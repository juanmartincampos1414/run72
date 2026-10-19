import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SCHEMA = {
  type: "object",
  properties: {
    level: { type: "integer", enum: [1, 2, 3, 4], description: "Nivel que mejor describe la respuesta del cliente." },
    reply: { type: "string", description: "Respuesta breve y cálida de Runit (1 frase), en español rioplatense." },
  },
  required: ["level", "reply"],
  additionalProperties: false,
} as const;

type Body = {
  areaName?: string;
  question?: string;
  options?: string[];
  userText?: string;
  last?: boolean;
};

export async function POST(req: Request) {
  // Rate-limit best-effort si hay Supabase.
  if (isSupabaseConfigured()) {
    const limited = await enforceRateLimit({ req, supabase: getSupabaseAdmin(), endpoint: "/api/radar/interpret", limit: 60 });
    if (limited) return limited;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ unavailable: true });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const areaName = (body.areaName ?? "").slice(0, 80);
  const question = (body.question ?? "").slice(0, 300);
  const options = (body.options ?? []).slice(0, 4).map((o) => String(o).slice(0, 200));
  const userText = (body.userText ?? "").slice(0, 1500).trim();
  if (!userText || options.length !== 4) {
    return NextResponse.json({ error: "Falta información." }, { status: 400 });
  }

  const scale = options.map((o, i) => `Nivel ${i + 1}: ${o}`).join("\n");
  const system = `Sos Runit, el asistente de IA de RUN (software a medida, agentes de IA e integraciones).
Estás haciendo un diagnóstico rápido y amistoso sobre cuánto usa IA el negocio de la persona.
Hablás en español rioplatense (vos), cálido, breve y concreto. Sin tecnicismos. Sin emojis.
Te doy un área, la pregunta y una escala de 4 niveles (de menos a más madurez).
Leé la respuesta libre de la persona y:
1) Elegí el nivel (1 a 4) que mejor la describe. Ante la duda entre dos, elegí el más bajo.
2) Escribí una sola frase de respuesta, humana, que reconozca lo que dijo${body.last ? " y cierre el diagnóstico (es la última)" : " y dé pie a seguir"}. No menciones el número de nivel ni la palabra "nivel".

Área: ${areaName}
Pregunta: ${question}
Escala:
${scale}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 400,
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "low" },
      system,
      messages: [{ role: "user", content: userText }],
    });
    const block = response.content.find((b) => b.type === "text");
    const raw = block && "text" in block ? block.text : "{}";
    const parsed = JSON.parse(raw) as { level: number; reply: string };
    const level = Math.max(1, Math.min(4, Number(parsed.level) || 2));
    const reply = String(parsed.reply || "Dale, seguimos.").slice(0, 300);
    return NextResponse.json({ level, reply });
  } catch {
    return NextResponse.json({ error: "No pude interpretarlo." }, { status: 502 });
  }
}
