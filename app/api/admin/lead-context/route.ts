import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Suma CONTEXTO a la oportunidad de un lead desde WhatsApp: audios (se transcriben)
 * o conversaciones/notas pegadas. Claude lo limpia en bullets claros y se appendea
 * a lead.meeting_notes, que el generador de propuesta inyecta como CONTEXTO DEL
 * CLIENTE. Así, todo lo que el cliente va contando queda en la oportunidad y el
 * Motor lo usa (no vive suelto en un chat).
 */

/** Transcribe un audio con un endpoint Whisper compatible con OpenAI (Groq por defecto). */
async function transcribe(file: File): Promise<string> {
  const key = process.env.TRANSCRIPTION_API_KEY;
  if (!key) {
    const e = new Error("NO_PROVIDER");
    e.name = "NO_PROVIDER";
    throw e;
  }
  const base = process.env.TRANSCRIPTION_BASE_URL || "https://api.groq.com/openai/v1";
  const model = process.env.TRANSCRIPTION_MODEL || "whisper-large-v3";
  const fd = new FormData();
  fd.append("file", file, file.name || "audio.ogg");
  fd.append("model", model);
  fd.append("language", "es");
  fd.append("response_format", "text");
  const r = await fetch(`${base}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: fd,
  });
  if (!r.ok) throw new Error(`Transcripción falló (${r.status}).`);
  return (await r.text()).trim();
}

/** Limpia una transcripción/conversación cruda en bullets de contexto para la oportunidad. */
async function summarize(raw: string, kind: "audio" | "texto"): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return raw.slice(0, 4000);
  const client = new Anthropic({ apiKey });
  const r = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1200,
    output_config: { effort: "low" },
    system: `Te paso ${kind === "audio" ? "la transcripción de un audio de WhatsApp" : "una conversación/nota de WhatsApp"} de un cliente contando qué necesita. Devolvé SOLO bullets claros y concretos de lo que el cliente QUIERE y de lo que YA TIENE, en español rioplatense, para sumar al diagnóstico de la oportunidad. Agrupá por tema si conviene. No inventes nada que no esté. Ignorá muletillas, saludos y ruido de transcripción. Sin preámbulo ni cierre: solo los bullets.`,
    messages: [{ role: "user", content: raw.slice(0, 20000) }],
  });
  const b = r.content.find((x) => x.type === "text");
  return b && "text" in b ? b.text.trim() : raw.slice(0, 4000);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const actor = auth.user?.email ?? "admin";

  let leadId = "";
  let text = "";
  let file: File | null = null;
  try {
    const form = await req.formData();
    leadId = String(form.get("leadId") ?? "").trim();
    text = String(form.get("text") ?? "").trim();
    const f = form.get("file");
    if (f && typeof f === "object" && "arrayBuffer" in f) file = f as File;
  } catch {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }
  if (!leadId) return NextResponse.json({ error: "Falta leadId." }, { status: 400 });

  // 1) Obtener el texto crudo: transcribir audio o usar el texto pegado.
  let raw = text;
  let kind: "audio" | "texto" = "texto";
  if (file) {
    kind = "audio";
    try {
      raw = await transcribe(file);
    } catch (e) {
      if (e instanceof Error && e.name === "NO_PROVIDER") {
        return NextResponse.json(
          {
            error:
              "Para transcribir audios falta configurar TRANSCRIPTION_API_KEY (ej. Groq, gratis). Mientras tanto, pegá el texto de la conversación.",
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: "No pude transcribir el audio. Probá de nuevo o pegá el texto." }, { status: 502 });
    }
  }
  if (!raw || raw.length < 10) {
    return NextResponse.json({ error: "No hay contenido. Subí un audio o pegá la conversación." }, { status: 400 });
  }

  // 2) Limpiar en bullets de contexto.
  let summary = "";
  try {
    summary = await summarize(raw, kind);
  } catch {
    summary = raw.slice(0, 4000);
  }

  // 3) Appendear a la oportunidad (meeting_notes).
  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase.from("leads").select("meeting_notes").eq("id", leadId).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });

  const stamp = new Date().toLocaleDateString("es-AR");
  const header = kind === "audio" ? `AUDIO DE WHATSAPP (${stamp})` : `CONVERSACIÓN DE WHATSAPP (${stamp})`;
  const block = `${header}:\n${summary}`;
  const prev = String(lead.meeting_notes ?? "").trim();
  const next = prev ? `${prev}\n\n${block}` : block;
  const { error } = await supabase.from("leads").update({ meeting_notes: next }).eq("id", leadId);
  if (error) return NextResponse.json({ error: "No pude guardar el contexto." }, { status: 500 });

  await supabase
    .from("events")
    .insert({ lead_id: leadId, event_type: "context_added", metadata: { actor, kind } })
    .then(() => {}, () => {});

  return NextResponse.json({ added: summary, kind });
}
