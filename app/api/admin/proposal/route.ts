import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { computeTotals } from "@/lib/pricing";
import { buildCatalog } from "@/lib/concierge";
import type { Service, Microservice, LineItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string", description: "La necesidad real del cliente, interpretada, en 2-4 frases." },
    detectedNeeds: { type: "array", items: { type: "string" }, description: "Necesidades concretas detectadas, en lenguaje del cliente." },
    projectTypes: { type: "array", items: { type: "string" }, description: "slugs de tipos de proyecto del catálogo." },
    addons: { type: "array", items: { type: "string" }, description: "slugs de addons del catálogo." },
    microservices: { type: "array", items: { type: "string" }, description: "claves 'service_slug:slug' de microservicios del catálogo." },
    draft: { type: "string", description: "Borrador de propuesta en español rioplatense, listo para revisar y enviar. SIN precios." },
    missing: { type: "array", items: { type: "string" }, description: "Datos que faltan para cerrar el presupuesto." },
  },
  required: ["summary", "draft", "projectTypes", "addons", "microservices"],
  additionalProperties: false,
} as const;

type Output = {
  summary: string;
  detectedNeeds?: string[];
  projectTypes: string[];
  addons: string[];
  microservices: string[];
  draft: string;
  missing?: string[];
};

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY." }, { status: 503 });

  let transcript = "";
  let notes = "";
  try {
    const body = await req.json();
    transcript = String(body.transcript ?? "").slice(0, 60000).trim();
    notes = String(body.notes ?? "").slice(0, 4000).trim();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (transcript.length < 30) {
    return NextResponse.json({ error: "Pegá la transcripción de la call (es muy corta)." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: svc } = await supabase
    .from("services")
    .select("id, slug, name, category, description, price_ars, type, active, sort_order")
    .eq("active", true);
  const services = (svc ?? []) as Service[];
  const { data: mic } = await supabase
    .from("microservices")
    .select("id, service_slug, group_name, slug, name, description, price_ars, active, default_on, sort_order")
    .eq("active", true);
  const micros = (mic ?? []) as Microservice[];

  const system = `Sos el asistente interno de propuestas de RUN, que desarrolla software a medida, agentes de IA e integraciones.
Te paso la TRANSCRIPCIÓN de una videollamada con un potencial cliente (y a veces notas sueltas). Tu trabajo:
1) Interpretar la necesidad REAL del cliente (no solo lo que pide literal).
2) Elegir qué cotizar usando EXCLUSIVAMENTE los slugs/claves del catálogo de abajo. No inventes servicios ni precios: los precios los calcula el sistema.
3) Escribir "draft": un borrador de propuesta en español rioplatense (vos), claro y humano, listo para que alguien de RUN lo revise y se lo mande al cliente. Estructura: qué entendimos, qué proponemos y por qué, alcance, y próximos pasos (coordinar la videollamada / arrancar). NO incluyas precios en el draft (van aparte).
4) En "missing", listar los datos que falten para cerrar bien el presupuesto.
Si la transcripción es ambigua, igual proponé lo más razonable y marcá los faltantes.

Catálogo disponible (usá solo estos slugs/claves):
${buildCatalog(services, micros)}`;

  let parsed: Output;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3000,
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
      system,
      messages: [{ role: "user", content: `Transcripción de la call:\n${transcript}${notes ? `\n\nNotas:\n${notes}` : ""}` }],
    });
    const block = response.content.find((b) => b.type === "text");
    const raw = block && "text" in block ? block.text : "{}";
    parsed = JSON.parse(raw) as Output;
  } catch {
    return NextResponse.json({ error: "No pude generar la propuesta. Probá de nuevo." }, { status: 502 });
  }

  // Validación anti-alucinación: solo slugs/claves que existen en el catálogo.
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  const microKey = new Map(micros.map((m) => [`${m.service_slug}:${m.slug}`, m]));
  const projectTypes = (parsed.projectTypes ?? []).filter((s) => bySlug.has(s));
  const addons = (parsed.addons ?? []).filter((s) => bySlug.has(s));
  const microservices = (parsed.microservices ?? []).filter((k) => microKey.has(k));

  const { data: config } = await supabase.from("config").select("deposit_percent").eq("id", 1).maybeSingle();
  const depositPercent = config?.deposit_percent ?? 30;

  const lineItems: LineItem[] = [];
  for (const slug of [...projectTypes, ...addons]) {
    const s = bySlug.get(slug);
    if (s) lineItems.push({ name: s.name, price_ars: s.price_ars });
  }
  for (const key of microservices) {
    const m = microKey.get(key);
    if (m) lineItems.push({ name: `↳ ${m.name}`, price_ars: m.price_ars });
  }
  const pricing = { ...computeTotals(lineItems, depositPercent), lineItems, depositPercent };

  return NextResponse.json({
    summary: parsed.summary,
    detectedNeeds: parsed.detectedNeeds ?? [],
    missing: parsed.missing ?? [],
    draft: parsed.draft,
    proposal: { projectTypes, addons, microservices },
    pricing,
  });
}
