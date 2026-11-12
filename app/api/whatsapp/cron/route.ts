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

  // ── Momento 1: confirmación de reserva (reservas creadas hace entre MIN y MAX minutos) ──
  try {
    const nuevos = await eventosNuevosDesde(new Date(ahora.getTime() - CONFIRM_MAX_MIN * MIN));
    for (const ev of nuevos) {
      const d = datos(ev);
      if (!d || !d.created) continue;
      if (d.inicio <= ahora) continue; // la meet ya pasó/empezó
      const edadMin = (ahora.getTime() - d.created.getTime()) / MIN;
      if (edadMin < CONFIRM_MIN_MIN || edadMin > CONFIRM_MAX_MIN) continue;
      const fila = await reclamar(supabase, ev, d, "booking_confirm");
      if (!fila) continue;
      const r = await enviar(supabase, fila, "booking_confirm", d, T_CONFIRM);
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
