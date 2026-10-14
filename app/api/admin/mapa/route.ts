import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { AREAS } from "@/lib/radar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SCHEMA = {
  type: "object",
  properties: {
    negocio: { type: "string", description: "Nombre o descripción breve del negocio del cliente." },
    resumen: { type: "string", description: "1-2 frases: dónde está hoy y hacia dónde va con IA." },
    fases: {
      type: "array",
      description: "Exactamente 4 fases, de menos a más.",
      items: {
        type: "object",
        properties: { nombre: { type: "string" }, objetivo: { type: "string" } },
        required: ["nombre", "objetivo"],
        additionalProperties: false,
      },
    },
    areas: {
      type: "array",
      description: "Las 6 áreas dadas, en el mismo orden.",
      items: {
        type: "object",
        properties: {
          area: { type: "string", description: "Nombre exacto del área (de la lista dada)." },
          acciones: {
            type: "array",
            description: "Exactamente 4 acciones, una por fase (orden fase 1 a 4). Cortas, concretas, accionables.",
            items: { type: "string" },
          },
        },
        required: ["area", "acciones"],
        additionalProperties: false,
      },
    },
  },
  required: ["negocio", "resumen", "fases", "areas"],
  additionalProperties: false,
} as const;

type MapOut = {
  negocio: string;
  resumen: string;
  fases: { nombre: string; objetivo: string }[];
  areas: { area: string; acciones: string[] }[];
};

const DEFAULT_FASES = [
  { nombre: "Fase 1 · Primeros pasos", objetivo: "Quick wins con IA en lo que ya hacés." },
  { nombre: "Fase 2 · Integración", objetivo: "La IA entra a los procesos clave." },
  { nombre: "Fase 3 · Escala", objetivo: "Medir, escalar lo que funciona y llevarlo a clientes." },
  { nombre: "Nativo IA", objetivo: "Agentes y decisiones asistidas en el núcleo del negocio." },
];

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY." }, { status: 503 });

  let transcript = "", notes = "", scan = "";
  try {
    const body = await req.json();
    transcript = String(body.transcript ?? "").slice(0, 60000).trim();
    notes = String(body.notes ?? "").slice(0, 4000).trim();
    scan = String(body.scan ?? "").slice(0, 4000).trim();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (transcript.length < 30 && scan.length < 10) {
    return NextResponse.json({ error: "Pegá la transcripción de la call o el resultado del Runit Scan." }, { status: 400 });
  }

  const areaList = AREAS.map((a) => `- ${a.name} (${a.service})`).join("\n");
  const system = `Sos el estratega de IA de RUN72 (agencia que entrega en 72 horas).
Con la información de un cliente, armás su "Mapa de IA": un roadmap de adopción de IA por fases y áreas, concreto y accionable, en español rioplatense (vos). Sin tecnicismos, pensando en PyMEs.

Reglas:
- Devolvé EXACTAMENTE 4 fases, de menos a más (de quick wins a "Nativo IA").
- Devolvé EXACTAMENTE estas 6 áreas, en este orden y con estos nombres:
${areaList}
- Para cada área, devolvé EXACTAMENTE 4 acciones (una por fase, en orden de fase 1 a 4). Cada acción: una frase corta, concreta y realista para ESE negocio, que se note el avance fase a fase.
- Partí del diagnóstico y lo que surja de la call. Si falta info, proponé lo más razonable para ese rubro.`;

  const userContent = [
    scan ? `Resultado del Runit Scan:\n${scan}` : "",
    transcript ? `Transcripción de la call:\n${transcript}` : "",
    notes ? `Notas:\n${notes}` : "",
  ].filter(Boolean).join("\n\n");

  let parsed: MapOut;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3500,
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
      system,
      messages: [{ role: "user", content: userContent }],
    });
    const block = response.content.find((b) => b.type === "text");
    const raw = block && "text" in block ? block.text : "{}";
    parsed = JSON.parse(raw) as MapOut;
  } catch {
    return NextResponse.json({ error: "No pude generar el mapa. Probá de nuevo." }, { status: 502 });
  }

  // Normalizar: 4 fases, 6 áreas (en el orden canónico), 4 acciones cada una.
  const fases = (parsed.fases ?? []).slice(0, 4);
  while (fases.length < 4) fases.push(DEFAULT_FASES[fases.length]);

  const byArea = new Map((parsed.areas ?? []).map((a) => [a.area?.toLowerCase().trim(), a]));
  const areas = AREAS.map((a) => {
    const found = byArea.get(a.name.toLowerCase());
    const acciones = (found?.acciones ?? []).slice(0, 4);
    while (acciones.length < 4) acciones.push("—");
    return { area: a.name, short: a.short, service: a.service, acciones };
  });

  const payload = {
    negocio: parsed.negocio ?? "",
    resumen: parsed.resumen ?? "",
    fases,
    areas,
  };

  // Guardar para compartir vía /mapa/{id} (best-effort).
  let id: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from("ia_maps")
        .insert(payload)
        .select("id")
        .single();
      if (!error) id = data?.id ?? null;
    } catch {
      id = null;
    }
  }

  return NextResponse.json({ id, ...payload });
}

