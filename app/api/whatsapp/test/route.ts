import { NextResponse } from "next/server";
import { enviarPlantilla, estadoNumero, normalizarTelefono, whatsappConfigurado } from "@/lib/whatsapp";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint de diagnóstico (protegido con CRON_SECRET):
 *   ?status=1                      → estado del número (calidad, límites)
 *   ?to=...&template=...&v1=&v2=   → envía una plantilla
 *   ...&record=1                   → además crea una fila en meeting_reminders ligada al wamid
 *                                    (para probar que la respuesta Confirmar/Reprogramar la matchee)
 *   ...&raw=1                      → envía al número tal cual, sin agregar el "9" argentino
 *   ?rows=1                        → últimas filas de meeting_reminders (estado de confirmación)
 *   ?events=1                      → últimos eventos meeting_reminder_reply (respuestas recibidas)
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const url = new URL(req.url);

  // ── Lecturas de diagnóstico (no envían nada) ──
  if (url.searchParams.get("rows")) {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: "db no configurada" }, { status: 503 });
    const { data, error } = await getSupabaseAdmin()
      .from("meeting_reminders")
      .select("id,phone,name,confirmation_status,confirmed_at,last_reply,reminder30_wamid,booking_confirm_wamid,updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);
    return NextResponse.json({ ok: !error, rows: data ?? [], error: error?.message });
  }
  if (url.searchParams.get("events")) {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: "db no configurada" }, { status: 503 });
    const { data, error } = await getSupabaseAdmin()
      .from("events")
      .select("event_type,metadata,created_at")
      .eq("event_type", "meeting_reminder_reply")
      .order("created_at", { ascending: false })
      .limit(10);
    return NextResponse.json({ ok: !error, events: data ?? [], error: error?.message });
  }

  if (!whatsappConfigurado()) {
    return NextResponse.json({ error: "whatsapp no configurado (faltan token/phone_id)" }, { status: 503 });
  }

  // Diagnóstico: ?status=1 devuelve el estado del número.
  if (url.searchParams.get("status")) {
    try {
      return NextResponse.json({ ok: true, numero: await estadoNumero() });
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
    }
  }

  const rawTo = url.searchParams.get("to");
  const to = url.searchParams.get("raw")
    ? (rawTo || "").replace(/[^\d]/g, "") || null
    : normalizarTelefono(rawTo);
  if (!to) return NextResponse.json({ error: "falta ?to= con un número válido" }, { status: 400 });

  const template = url.searchParams.get("template") || "hello_world";
  const lang = url.searchParams.get("lang") || (template === "hello_world" ? "en_US" : "es");
  const vars = [url.searchParams.get("v1"), url.searchParams.get("v2")].filter(Boolean) as string[];

  try {
    const wamid = await enviarPlantilla(to, template, lang, vars);

    // ?record=1 → crea/actualiza la fila de prueba para que el webhook matchee la respuesta.
    if (url.searchParams.get("record") && isSupabaseConfigured()) {
      const ahora = new Date().toISOString();
      await getSupabaseAdmin()
        .from("meeting_reminders")
        .upsert(
          {
            event_id: `test-${to}`,
            phone: to,
            name: vars[0] || "Prueba",
            meet_at: ahora,
            reminder30_sent_at: ahora,
            reminder30_wamid: wamid,
            confirmation_status: "pending",
            confirmed_at: null,
            last_reply: null,
            updated_at: ahora,
          },
          { onConflict: "event_id" },
        );
    }

    return NextResponse.json({ ok: true, to, template, wamid, recorded: Boolean(url.searchParams.get("record")) });
  } catch (e) {
    return NextResponse.json({ ok: false, to, template, error: String(e) }, { status: 502 });
  }
}
