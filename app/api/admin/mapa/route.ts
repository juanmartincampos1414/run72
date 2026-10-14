import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { AREAS } from "@/lib/radar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TIPOS = ["agente", "chatbot", "automatizacion", "datos", "analitica", "contenido", "integracion", "capacitacion", "gobernanza"];

const SCHEMA = {
  type: "object",
  properties: {
    negocio: { type: "string", description: "Nombre o descripción breve del negocio del cliente." },
    resumen: { type: "string", description: "1-2 frases: dónde está hoy y hacia dónde va con IA." },
    equipo: {
      type: "array",
      description: "4 a 6 integrantes ficticios del equipo (nombres y apellidos argentinos realistas) con su rol.",
      items: {
        type: "object",
        properties: { nombre: { type: "string" }, rol: { type: "string" } },
        required: ["nombre", "rol"],
        additionalProperties: false,
      },
    },
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
          resultado: { type: "string", description: "Beneficio concreto para el negocio cuando el área llega a Nativo IA (una frase corta)." },
          celdas: {
            type: "array",
            description: "Exactamente 4 celdas, una por fase (orden fase 1 a 4).",
            items: {
              type: "object",
              properties: {
                accion: { type: "string", description: "Qué se hace en esta fase. Frase corta y concreta." },
                responsable: { type: "string", description: "Nombre de un integrante del equipo (de la lista 'equipo')." },
                herramienta: { type: "string", description: "Herramienta o proveedor concreto (ej: WhatsApp Business, ChatGPT, n8n, Make, un CRM, Google Sheets, Looker). Corto." },
                tipo: { type: "string", enum: TIPOS, description: "Tipo de iniciativa (para el ícono)." },
              },
              required: ["accion", "responsable", "herramienta", "tipo"],
              additionalProperties: false,
            },
          },
        },
        required: ["area", "resultado", "celdas"],
        additionalProperties: false,
      },
    },
  },
  required: ["negocio", "resumen", "equipo", "fases", "areas"],
  additionalProperties: false,
} as const;

type Celda = { accion: string; responsable: string; herramienta: string; tipo: string };
type MapOut = {
  negocio: string;
  resumen: string;
  equipo: { nombre: string; rol: string }[];
  fases: { nombre: string; objetivo: string }[];
  areas: { area: string; resultado?: string; celdas: Celda[] }[];
};

const DEFAULT_FASES = [
  { nombre: "Fase 1 · Primeros pasos", objetivo: "Quick wins con IA en lo que ya hacés." },
  { nombre: "Fase 2 · Integración", objetivo: "La IA entra a los procesos clave." },
  { nombre: "Fase 3 · Escala", objetivo: "Medir, escalar y llevarla a clientes." },
  { nombre: "Nativo IA", objetivo: "Agentes y decisiones asistidas en el núcleo." },
];
const DEFAULT_EQUIPO = [
  { nombre: "Dirección", rol: "Dueño/a" },
  { nombre: "Operaciones", rol: "Encargado/a" },
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
Con la info de un cliente, armás su "Mapa de IA": un roadmap de adopción de IA por fases y áreas, concreto, accionable y realista para una PyME, en español rioplatense (vos).

Reglas:
- Inventá un equipo ficticio de 4 a 6 personas (nombres y apellidos argentinos realistas) con su rol (ej: "Lucía Benítez · Atención al cliente"). Reutilizá esas mismas personas como responsables en las celdas.
- Devolvé EXACTAMENTE 4 fases, de menos a más (de quick wins a "Nativo IA").
- Devolvé EXACTAMENTE estas 6 áreas, en este orden y con estos nombres:
${areaList}
- Para cada área: 4 celdas (una por fase, en orden). Cada celda tiene:
  · accion: qué se hace, frase corta y concreta para ESE negocio.
  · responsable: el nombre de alguien del equipo que inventaste.
  · herramienta: una herramienta o proveedor concreto (WhatsApp Business, ChatGPT, n8n, Make, un CRM, Google Sheets, Looker, etc.).
  · tipo: uno de ${TIPOS.join(", ")}.
- Para cada área, un "resultado": el beneficio concreto al llegar a Nativo IA.
- Que se note el avance fase a fase. Si falta info, proponé lo más razonable para el rubro.`;

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
      max_tokens: 5000,
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

  const fases = (parsed.fases ?? []).slice(0, 4);
  while (fases.length < 4) fases.push(DEFAULT_FASES[fases.length]);
  const equipo = Array.isArray(parsed.equipo) && parsed.equipo.length ? parsed.equipo.slice(0, 6) : DEFAULT_EQUIPO;

  const byArea = new Map((parsed.areas ?? []).map((a) => [a.area?.toLowerCase().trim(), a]));
  const areas = AREAS.map((a) => {
    const found = byArea.get(a.name.toLowerCase());
    const celdas: Celda[] = (found?.celdas ?? []).slice(0, 4).map((cel) => ({
      accion: cel?.accion ?? "—",
      responsable: cel?.responsable ?? "",
      herramienta: cel?.herramienta ?? "",
      tipo: TIPOS.includes(cel?.tipo) ? cel.tipo : "automatizacion",
    }));
    while (celdas.length < 4) celdas.push({ accion: "—", responsable: "", herramienta: "", tipo: "automatizacion" });
    return { area: a.name, short: a.short, service: a.service, resultado: found?.resultado ?? "", celdas };
  });

  const payload = { negocio: parsed.negocio ?? "", resumen: parsed.resumen ?? "", equipo, fases, areas };

  let id: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await getSupabaseAdmin().from("ia_maps").insert(payload).select("id").single();
      if (!error) id = data?.id ?? null;
    } catch {
      id = null;
    }
  }

  return NextResponse.json({ id, ...payload });
}
