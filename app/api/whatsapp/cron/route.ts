import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";
import { enviarPlantilla, normalizarTelefono, whatsappConfigurado } from "@/lib/whatsapp";
import {
  calendarConfigurado,
  creacionDelEvento,
  eventosEntre,
  eventosNuevosDesde,
  inicioDelEvento,
  nombreDelEvento,
  telefonoDelEvento,
  type CalendarEvent,
} from "@/lib/calendar";
import type { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es";
const T_CONFIRM = process.env.WHATSAPP_TEMPLATE_CONFIRM || "confirmacion_reserva";
const T_REMINDER = process.env.WHATSAPP_TEMPLATE_REMINDER || "recordatorio_meet";
const CONFIRM_MIN_MIN = Number(process.env.BOOKING_CONFIRM_MIN_MIN || "10"); // esperar al menos N min tras agendar
const CONFIRM_MAX_MIN = Number(process.env.BOOKING_CONFIRM_MAX_MIN || "120"); // no confirmar reservas más viejas
const REMINDER_BEFORE_MIN = Number(process.env.REMINDER_MINUTES_BEFORE || "30"); // recordar N min antes

const MIN = 60_000;
// Tolerancia para considerar que un evento se REPROGRAMÓ (cambio real de horario,
// no un reajuste de segundos de Google/Centralize).
const RESCHED_TOLERANCE_MS = 60_000;

const fechaLegible = (d: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(d);

type Datos = { phone: string; inicio: Date; nombre: string; created: Date | null };

function datos(ev: CalendarEvent): Datos | null {
  const inicio = inicioDelEvento(ev);
  const phone = normalizarTelefono(telefonoDelEvento(ev));
  if (!inicio || !phone) return null;
  return { phone, inicio, nombre: nombreDelEvento(ev), created: creacionDelEvento(ev) };
}

/**
 * Asegura la fila del evento y reclama atómicamente UN momento (columna `${campo}_sent_at`).
 * Devuelve el id de la fila si este proceso ganó el reclamo (debe enviar), o null si ya estaba enviado.
 */
async function reclamar(
  supabase: SupabaseClient,
  ev: CalendarEvent,
  d: Datos,
  campo: "booking_confirm" | "reminder30",
): Promise<string | null> {
  const ahora = new Date().toISOString();
  await supabase.from("meeting_reminders").upsert(
    {
      event_id: ev.id,
      meet_at: d.inicio.toISOString(),
      event_created_at: d.created?.toISOString() ?? null,
      phone: d.phone,
      name: d.nombre,
    },
    { onConflict: "event_id", ignoreDuplicates: true },
  );
  const { data } = await supabase
    .from("meeting_reminders")
    .update({ [`${campo}_sent_at`]: ahora, phone: d.phone, meet_at: d.inicio.toISOString(), updated_at: ahora })
    .eq("event_id", ev.id)
    .is(`${campo}_sent_at`, null)
    .select("id")
    .maybeSingle();
  return data?.id ?? null;
}

async function enviar(
  supabase: SupabaseClient,
  filaId: string,
  campo: "booking_confirm" | "reminder30",
  d: Datos,
  template: string,
): Promise<"ok" | string> {
  try {
    const wamid = await enviarPlantilla(d.phone, template, LANG, [d.nombre, fechaLegible(d.inicio)]);
    await supabase
      .from("meeting_reminders")
      .update({ [`${campo}_wamid`]: wamid, updated_at: new Date().toISOString() })
      .eq("id", filaId);
    return "ok";
  } catch (e) {
    // Libera el reclamo para reintentar en la próxima corrida.
    await supabase
      .from("meeting_reminders")
      .update({ [`${campo}_sent_at`]: null, last_reply: `envio_error: ${String(e)}`, updated_at: new Date().toISOString() })
      .eq("id", filaId);
    return String(e);
  }
}

/**
 * Reprogramación: el evento cambió de horario respecto a lo guardado. Reclama atómicamente
 * (solo gana la corrida que todavía ve el `meet_at` viejo), actualiza al horario nuevo,
 * re-marca la confirmación y RE-ARMA el recordatorio para la fecha nueva. Devuelve el id de
 * la fila si ganó (debe reconfirmar), o null si otra corrida ya la tomó.
 */
async function reclamarReprogramacion(
  supabase: SupabaseClient,
  ev: CalendarEvent,
  d: Datos,
  meetAtViejoIso: string,
): Promise<string | null> {
  const ahora = new Date().toISOString();
  const { data } = await supabase
    .from("meeting_reminders")
    .update({
      meet_at: d.inicio.toISOString(),
      event_created_at: d.created?.toISOString() ?? null,
      phone: d.phone,
      name: d.nombre,
      booking_confirm_sent_at: ahora,
      reminder30_sent_at: null, // re-armar: el recordatorio vuelve a salir 30 min antes del horario nuevo
      reminder30_wamid: null,
      updated_at: ahora,
    })
    .eq("event_id", ev.id)
    .eq("meet_at", meetAtViejoIso)
    .select("id")
    .maybeSingle();
  return data?.id ?? null;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  if (!whatsappConfigurado() || !calendarConfigurado() || !isSupabaseConfigured()) {
    return NextResponse.json({
      skipped: true,
      whatsapp: whatsappConfigurado(),
      calendar: calendarConfigurado(),
      db: isSupabaseConfigured(),
    });
  }

  const supabase = getSupabaseAdmin();
  const ahora = new Date();
  const res = { confirmaciones: 0, recordatorios: 0, errores: [] as string[] };

  // ── Momento 1: confirmación de reserva (altas nuevas) + reconfirmación de reprogramaciones ──
  // Mira eventos creados O actualizados en la última ventana (updatedMin), así una
  // reprogramación — que cambia `updated` pero no `created` — también entra acá.
  try {
    const nuevos = await eventosNuevosDesde(new Date(ahora.getTime() - CONFIRM_MAX_MIN * MIN));
    for (const ev of nuevos) {
      const d = datos(ev);
      if (!d) continue;
      if (d.inicio <= ahora) continue; // la meet ya pasó/empezó

      // ¿Ya existe fila para este evento? Distingue alta nueva de reprogramación.
      const { data: fila } = await supabase
        .from("meeting_reminders")
        .select("meet_at")
        .eq("event_id", ev.id)
        .maybeSingle();

      const reprogramada =
        !!fila?.meet_at &&
        Math.abs(new Date(fila.meet_at as string).getTime() - d.inicio.getTime()) > RESCHED_TOLERANCE_MS;

      if (reprogramada) {
        // Reconfirmar con la fecha NUEVA y re-armar el recordatorio.
        const filaId = await reclamarReprogramacion(supabase, ev, d, fila!.meet_at as string);
        if (!filaId) continue; // otra corrida ya la tomó
        try {
          const wamid = await enviarPlantilla(d.phone, T_CONFIRM, LANG, [d.nombre, fechaLegible(d.inicio)]);
          await supabase
            .from("meeting_reminders")
            .update({ booking_confirm_wamid: wamid, updated_at: new Date().toISOString() })
            .eq("id", filaId);
          res.confirmaciones++;
        } catch (e) {
          // Revertir el meet_at viejo re-dispara la detección → reintenta en la próxima corrida.
          await supabase
            .from("meeting_reminders")
            .update({ meet_at: fila!.meet_at, last_reply: `reprog_error: ${String(e)}`, updated_at: new Date().toISOString() })
            .eq("id", filaId);
          res.errores.push(`reprog ${ev.id}: ${String(e)}`);
        }
        continue;
      }

      // Alta nueva: ventana por antigüedad de creación (entre MIN y MAX minutos).
      if (!d.created) continue;
      const edadMin = (ahora.getTime() - d.created.getTime()) / MIN;
      if (edadMin < CONFIRM_MIN_MIN || edadMin > CONFIRM_MAX_MIN) continue;
      const nueva = await reclamar(supabase, ev, d, "booking_confirm");
      if (!nueva) continue;
      const r = await enviar(supabase, nueva, "booking_confirm", d, T_CONFIRM);
      if (r === "ok") res.confirmaciones++;
      else res.errores.push(`confirm ${ev.id}: ${r}`);
    }
  } catch (e) {
    res.errores.push(`calendar_nuevos: ${String(e)}`);
  }

  // ── Momento 2: recordatorio (meets que empiezan dentro de los próximos REMINDER_BEFORE min) ──
  try {
    const proximos = await eventosEntre(ahora, new Date(ahora.getTime() + REMINDER_BEFORE_MIN * MIN));
    for (const ev of proximos) {
      const d = datos(ev);
      if (!d) continue;
      const fila = await reclamar(supabase, ev, d, "reminder30");
      if (!fila) continue;
      const r = await enviar(supabase, fila, "reminder30", d, T_REMINDER);
      if (r === "ok") res.recordatorios++;
      else res.errores.push(`recordatorio ${ev.id}: ${r}`);
    }
  } catch (e) {
    res.errores.push(`calendar_proximos: ${String(e)}`);
  }

  await logEvent(supabase, "meeting_reminder_run", null, res);
  return NextResponse.json(res);
}
