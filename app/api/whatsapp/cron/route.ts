import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/audit";
import { enviarPlantilla, normalizarTelefono, whatsappConfigurado } from "@/lib/whatsapp";
import {
  calendarConfigurado,
  eventosEntre,
  inicioDelEvento,
  nombreDelEvento,
  telefonoDelEvento,
  type CalendarEvent,
} from "@/lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es";
const TEMPLATE = process.env.WHATSAPP_TEMPLATE_REMINDER || "recordatorio_meet";
const LEAD_HOURS = Number(process.env.WHATSAPP_REMINDER_LEAD_HOURS || "24");

const fechaLegible = (d: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(d);

export async function GET(req: Request) {
  // Protegido: Vercel Cron manda Authorization: Bearer <CRON_SECRET>. Falla cerrado.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  // Sin WhatsApp, sin Calendar o sin DB configurados: no envía (fail-closed).
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
  const hasta = new Date(ahora.getTime() + LEAD_HOURS * 3600_000);

  let eventos: CalendarEvent[];
  try {
    eventos = await eventosEntre(ahora, hasta);
  } catch (e) {
    await logEvent(supabase, "meeting_reminder_error", null, { error: String(e) });
    return NextResponse.json({ error: "calendar", detail: String(e) }, { status: 502 });
  }

  let enviados = 0;
  const omitidos: { event: string; motivo: string }[] = [];

  for (const ev of eventos) {
    const inicio = inicioDelEvento(ev);
    const telefono = normalizarTelefono(telefonoDelEvento(ev));
    if (!inicio) {
      omitidos.push({ event: ev.id, motivo: "sin_inicio" });
      continue;
    }
    if (!telefono) {
      omitidos.push({ event: ev.id, motivo: "sin_telefono" });
      continue;
    }

    // Asegura la fila del evento (no pisa si ya existe).
    await supabase
      .from("meeting_reminders")
      .upsert(
        {
          event_id: ev.id,
          meet_at: inicio.toISOString(),
          phone: telefono,
          name: nombreDelEvento(ev),
        },
        { onConflict: "event_id", ignoreDuplicates: true },
      );

    // Reclamo atómico: solo quien logra setear reminder_sent_at (estando null) envía.
    const { data: reclamado } = await supabase
      .from("meeting_reminders")
      .update({ reminder_sent_at: ahora.toISOString(), phone: telefono, meet_at: inicio.toISOString(), updated_at: ahora.toISOString() })
      .eq("event_id", ev.id)
      .is("reminder_sent_at", null)
      .select("id")
      .maybeSingle();

    if (!reclamado) {
      omitidos.push({ event: ev.id, motivo: "ya_enviado" });
      continue;
    }

    try {
      const wamid = await enviarPlantilla(telefono, TEMPLATE, LANG, [nombreDelEvento(ev), fechaLegible(inicio)]);
      await supabase
        .from("meeting_reminders")
        .update({ reminder_wamid: wamid, updated_at: new Date().toISOString() })
        .eq("id", reclamado.id);
      enviados++;
    } catch (e) {
      // Falló el envío: libera el reclamo para reintentar en la próxima corrida.
      await supabase
        .from("meeting_reminders")
        .update({ reminder_sent_at: null, last_reply: `envio_error: ${String(e)}`, updated_at: new Date().toISOString() })
        .eq("id", reclamado.id);
      omitidos.push({ event: ev.id, motivo: `error_envio: ${String(e)}` });
    }
  }

  await logEvent(supabase, "meeting_reminder_run", null, {
    ventana_horas: LEAD_HOURS,
    eventos: eventos.length,
    enviados,
    omitidos: omitidos.length,
  });

  return NextResponse.json({ enviados, omitidos, eventos: eventos.length });
}
