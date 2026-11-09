import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/whatsapp";
import { logEvent } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Verificación del webhook (Meta llama una vez al configurarlo) ---
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

/** Interpreta la respuesta del usuario a un estado de confirmación. */
function interpretar(texto: string): "confirmed" | "reschedule" | null {
  const t = texto.trim().toLowerCase();
  if (/(^|\b)(confirm|si|sí|dale|asisto|ahí estoy|ahi estoy|ok|voy|perfecto)\b/.test(t)) return "confirmed";
  if (/(reprogram|reagend|cambiar|otro (día|dia|horario)|no puedo|posponer|mover)/.test(t)) return "reschedule";
  return null;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const secreto = process.env.WHATSAPP_APP_SECRET;
  const firma = req.headers.get("x-hub-signature-256");

  // Falla cerrado: sin App Secret configurado (o firma inválida), no se procesa nada.
  if (!secreto || !verifyWebhookSignature(raw, firma, secreto)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true }); // nada que procesar
  }

  // Estructura: entry[].changes[].value.messages[]
  const entries = (payload as { entry?: unknown[] }).entry ?? [];
  const mensajes: { from?: string; text?: string; contextId?: string }[] = [];
  for (const e of entries as Record<string, unknown>[]) {
    for (const ch of (e.changes as Record<string, unknown>[]) ?? []) {
      const value = (ch.value as Record<string, unknown>) ?? {};
      for (const m of (value.messages as Record<string, unknown>[]) ?? []) {
        const from = m.from as string | undefined;
        const contextId = (m.context as { id?: string } | undefined)?.id;
        let text: string | undefined;
        if (m.type === "text") text = (m.text as { body?: string })?.body;
        else if (m.type === "button") text = (m.button as { text?: string })?.text;
        else if (m.type === "interactive") {
          const it = m.interactive as Record<string, unknown>;
          text =
            (it.button_reply as { title?: string })?.title ||
            (it.list_reply as { title?: string })?.title;
        }
        mensajes.push({ from, text, contextId });
      }
    }
  }

  if (!mensajes.length || !isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseAdmin();

  for (const msg of mensajes) {
    if (!msg.from && !msg.contextId) continue;
    const estado = msg.text ? interpretar(msg.text) : null;

    // Buscar la fila: primero por el mensaje citado (context.id == alguno de nuestros wamid),
    // si no, la última enviada a ese teléfono.
    let query = supabase.from("meeting_reminders").select("id,confirmation_status").limit(1);
    if (msg.contextId) {
      query = query.or(`booking_confirm_wamid.eq.${msg.contextId},reminder30_wamid.eq.${msg.contextId}`);
    } else {
      query = query.eq("phone", msg.from as string).order("updated_at", { ascending: false });
    }
    const { data } = await query.maybeSingle();
    if (!data) continue;

    await supabase
      .from("meeting_reminders")
      .update({
        confirmation_status: estado ?? data.confirmation_status,
        confirmed_at: estado ? new Date().toISOString() : null,
        last_reply: msg.text ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    await logEvent(supabase, "meeting_reminder_reply", null, {
      status: estado ?? "sin_interpretar",
      reply: msg.text ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
