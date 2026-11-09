import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { computeTotals } from "@/lib/pricing";
import { buildCatalog } from "@/lib/concierge";
import type { Service, Microservice, LineItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Propuesta ESTRUCTURADA (no un choclo de texto). Genera una lectura estratégica
 * de la oportunidad (tipo asesor) + plan por fases + escenarios con precios para
 * que el cliente juegue con los números en la página. Todo desde la transcripción.
 */
const SCHEMA = {
  type: "object",
  properties: {
    positioning: {
      type: "string",
      description:
        "Frase de posicionamiento para el hero: la transformación que propone RUN, filosa y concreta (ej: 'De recibir pedidos por WhatsApp a un ecommerce que vende solo').",
    },
    summary: { type: "string", description: "1-2 frases: qué entendimos de la necesidad real." },
    opportunities: {
      type: "array",
      description: "Lectura de oportunidades del negocio (tabla). 3-5 filas.",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "La oportunidad (ej: 'Digitalizar pedidos de la ferretería')." },
          build: { type: "string", description: "Qué construiríamos / qué venderían." },
          revenue: { type: "string", description: "Cómo genera ingresos (para el cliente y/o RUN)." },
          read: { type: "string", description: "Lectura filosa y honesta (ej: 'La más concreta para empezar')." },
        },
        required: ["title", "build", "revenue", "read"],
        additionalProperties: false,
      },
    },
    recommendation: {
      type: "string",
      description:
        "Recomendación estratégica, voz de asesor tipo Elon Musk: primeros principios, directa, por dónde empezar y por qué. 3-5 frases máximo, sin relleno.",
    },
    phase1: {
      type: "object",
      properties: {
        title: { type: "string", description: "Nombre de la Fase 1 (ej: 'Fase 1 — Ecommerce de construcción')." },
        why: { type: "string", description: "Por qué arrancar por acá (1-2 frases)." },
        scope: { type: "array", items: { type: "string" }, description: "Qué incluye la Fase 1 (bullets claros)." },
      },
      required: ["title", "why", "scope"],
      additionalProperties: false,
    },
    nextPhases: {
      type: "array",
      description: "Fases siguientes a grandes rasgos. 1-3 items.",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
        },
        required: ["title", "detail"],
        additionalProperties: false,
      },
    },
    scenarios: {
      type: "array",
      description:
        "3 escenarios de inversión de la Fase 1: esencial, recomendado y completo. El del medio es el recomendado.",
      items: {
        type: "object",
        properties: {
          key: { type: "string", enum: ["esencial", "recomendado", "completo"] },
          name: { type: "string", description: "Nombre corto (ej: 'Esencial')." },
          tagline: { type: "string", description: "1 frase de para quién es / qué logra." },
          projectTypes: { type: "array", items: { type: "string" }, description: "slugs de tipos de proyecto del catálogo incluidos en este escenario." },
          addons: { type: "array", items: { type: "string" }, description: "slugs de addons del catálogo incluidos." },
          microservices: { type: "array", items: { type: "string" }, description: "claves 'service_slug:slug' de microservicios incluidos." },
          includes: { type: "array", items: { type: "string" }, description: "Bullets legibles de qué incluye (para mostrar al cliente)." },
        },
        required: ["key", "name", "tagline", "projectTypes", "addons", "microservices", "includes"],
        additionalProperties: false,
      },
    },
    options: {
      type: "array",
      description:
        "Módulos opcionales que el cliente puede sumar/sacar para jugar con el número. Usá SOLO slugs del catálogo (addons o 'service_slug:slug' de micros).",
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["addon", "micro"] },
          slug: { type: "string", description: "slug del addon, o clave 'service_slug:slug' del micro." },
          name: { type: "string", description: "Nombre legible del módulo." },
          detail: { type: "string", description: "1 frase de qué aporta." },
        },
        required: ["kind", "slug", "name", "detail"],
        additionalProperties: false,
      },
    },
    missing: { type: "array", items: { type: "string" }, description: "Datos que faltan para cerrar." },
  },
  required: ["positioning", "summary", "opportunities", "recommendation", "phase1", "scenarios"],
  additionalProperties: false,
} as const;

type Scenario = {
  key: string;
  name: string;
  tagline: string;
  projectTypes: string[];
  addons: string[];
  microservices: string[];
  includes: string[];
};
type Option = { kind: "addon" | "micro"; slug: string; name: string; detail: string };
type Output = {
  positioning: string;
  summary: string;
  opportunities: { title: string; build: string; revenue: string; read: string }[];
  recommendation: string;
  phase1: { title: string; why: string; scope: string[] };
  nextPhases?: { title: string; detail: string }[];
  scenarios: Scenario[];
  options?: Option[];
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

  const system = `Sos el estratega de RUN, que desarrolla software a medida, agentes de IA e integraciones. Pensás con PRIMEROS PRINCIPIOS, como un buen asesor (estilo Elon Musk): directo, sin relleno, enfocado en la oportunidad real de negocio y en qué conviene construir primero para generar impacto y que el cliente pague.

Te paso la TRANSCRIPCIÓN de una videollamada con un potencial cliente. Devolvés una PROPUESTA ESTRUCTURADA (NO un texto largo) con:
1) "positioning": una frase filosa de la transformación que propone RUN.
2) "opportunities": lectura de 3-5 oportunidades del negocio (qué construir, cómo genera ingresos, tu lectura honesta de cada una).
3) "recommendation": por dónde empezar y por qué, en 3-5 frases, con criterio comercial (qué deja facturar y aprender ya, qué validar antes de invertir).
4) "phase1": la Fase 1 recomendada para arrancar con impacto.
5) "scenarios": 3 escenarios de inversión (esencial / recomendado / completo) armados con slugs del catálogo. El recomendado es el del medio.
6) "options": módulos opcionales (slugs del catálogo) para que el cliente sume/saque y vea el precio moverse.

Reglas:
- Para scenarios y options usá EXCLUSIVAMENTE slugs/claves del catálogo de abajo. No inventes servicios ni precios: los calcula el sistema.
- Los 3 escenarios son incrementales: esencial ⊂ recomendado ⊂ completo tiene sentido, pero cada uno es un set válido.
- Español rioplatense. Nada de relleno ni marketing vacío: lectura honesta y concreta.

Catálogo disponible (usá solo estos slugs/claves):
${buildCatalog(services, micros)}`;

  let parsed: Output;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
      system,
      messages: [
        {
          role: "user",
          content: `Transcripción de la call:\n${transcript}${notes ? `\n\nNotas:\n${notes}` : ""}`,
        },
      ],
    });
    const block = response.content.find((b) => b.type === "text");
    const raw = block && "text" in block ? block.text : "{}";
    parsed = JSON.parse(raw) as Output;
  } catch {
    return NextResponse.json({ error: "No pude generar la propuesta. Probá de nuevo." }, { status: 502 });
  }

  // Pricing desde el catálogo (anti-alucinación).
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  const microKey = new Map(micros.map((m) => [`${m.service_slug}:${m.slug}`, m]));
  const { data: config } = await supabase.from("config").select("deposit_percent").eq("id", 1).maybeSingle();
  const depositPercent = config?.deposit_percent ?? 30;

  function priceItems(projectTypes: string[], addons: string[], microservices: string[]) {
    const items: LineItem[] = [];
    for (const slug of [...(projectTypes ?? []), ...(addons ?? [])]) {
      const s = bySlug.get(slug);
      if (s) items.push({ name: s.name, price_ars: s.price_ars });
    }
    for (const key of microservices ?? []) {
      const m = microKey.get(key);
      if (m) items.push({ name: `↳ ${m.name}`, price_ars: m.price_ars });
    }
    return { items, totals: computeTotals(items, depositPercent) };
  }

  const scenarios = (parsed.scenarios ?? []).map((sc) => {
    const { items, totals } = priceItems(sc.projectTypes, sc.addons, sc.microservices);
    return {
      key: sc.key,
      name: sc.name,
      tagline: sc.tagline,
      includes: sc.includes ?? [],
      lineItems: items,
      total: totals.total,
      deposit: totals.deposit,
      recommended: sc.key === "recomendado",
    };
  });

  const options = (parsed.options ?? [])
    .map((o) => {
      let price = 0;
      if (o.kind === "addon") price = bySlug.get(o.slug)?.price_ars ?? 0;
      else price = microKey.get(o.slug)?.price_ars ?? 0;
      return price > 0 ? { slug: o.slug, name: o.name, detail: o.detail, price_ars: price } : null;
    })
    .filter((o): o is { slug: string; name: string; detail: string; price_ars: number } => o !== null);

  return NextResponse.json({
    positioning: parsed.positioning,
    summary: parsed.summary,
    opportunities: parsed.opportunities ?? [],
    recommendation: parsed.recommendation,
    phase1: parsed.phase1,
    nextPhases: parsed.nextPhases ?? [],
    scenarios,
    options,
    depositPercent,
    missing: parsed.missing ?? [],
  });
}
