import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { computeTotals } from "@/lib/pricing";
import { buildCatalog } from "@/lib/concierge";
import { getPlaybook, playbookToPrompt } from "@/lib/playbooks";
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
    vertical: { type: "string", description: "Rubro del cliente en una palabra, lowercase (ej: 'arquitectura', 'ferreteria', 'gastronomia'). Para que el Motor agrupe aprendizajes por rubro." },
    opportunities: {
      type: "array",
      description: "Lectura de oportunidades del negocio (tabla). 3-5 filas.",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "La oportunidad (ej: 'Digitalizar pedidos de la ferretería')." },
          build: { type: "string", description: "Qué se construye / qué va a poder hacer el cliente." },
          revenue: { type: "string", description: "Qué resultado de negocio le da al cliente: más ventas, ahorro de tiempo, menos errores, etc. Siempre desde el beneficio del cliente." },
          read: { type: "string", description: "Por qué conviene y qué la hace valiosa PARA EL CLIENTE (ej: 'La más directa para empezar y ver resultados rápido'). Nada de jerga interna ni de lo que le conviene al proveedor." },
        },
        required: ["title", "build", "revenue", "read"],
        additionalProperties: false,
      },
    },
    recommendation: {
      type: "string",
      description:
        "Recomendación clara dirigida AL CLIENTE: por dónde empezar y por qué conviene, con criterio. 3-5 frases, sin relleno. PROHIBIDO mencionar competidores o productos de terceros (nombres o precios) y hablar de lo que le conviene al proveedor.",
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
    roadmap: {
      type: "object",
      description: "Cronograma realista de la Fase 1, por semanas o meses, con el hito que ve el cliente.",
      properties: {
        unit: { type: "string", enum: ["semanas", "meses"] },
        steps: {
          type: "array",
          description: "3-6 etapas en orden.",
          items: {
            type: "object",
            properties: {
              period: { type: "string", description: "Ej: 'Semana 1-2' o 'Mes 1'." },
              title: { type: "string", description: "Foco de la etapa (ej: 'Diseño y catálogo')." },
              detail: { type: "string", description: "Qué se hace en esta etapa (1 frase)." },
              milestone: { type: "string", description: "Qué ve o recibe el cliente al final de esta etapa." },
            },
            required: ["period", "title", "milestone"],
            additionalProperties: false,
          },
        },
      },
      required: ["unit", "steps"],
      additionalProperties: false,
    },
    scenarios: {
      type: "array",
      description:
        "EXACTAMENTE 2 escenarios de inversión de la Fase 1: 'recomendado' (el punto de entrada, el que marcamos recomendado) y 'completo' (la versión integral). NO incluyas un escenario más básico/económico que esos dos.",
      items: {
        type: "object",
        properties: {
          key: { type: "string", enum: ["recomendado", "completo"] },
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
type Output = {
  positioning: string;
  summary: string;
  vertical?: string;
  opportunities: { title: string; build: string; revenue: string; read: string }[];
  recommendation: string;
  phase1: { title: string; why: string; scope: string[] };
  nextPhases?: { title: string; detail: string }[];
  roadmap?: { unit: string; steps: { period: string; title: string; detail?: string; milestone: string }[] };
  scenarios: Scenario[];
  missing?: string[];
};

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY." }, { status: 503 });

  let transcript = "";
  let notes = "";
  let leadId = "";
  try {
    const body = await req.json();
    transcript = String(body.transcript ?? "").slice(0, 60000).trim();
    notes = String(body.notes ?? "").slice(0, 4000).trim();
    leadId = String(body.leadId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (transcript.length < 30) {
    return NextResponse.json({ error: "Pegá la transcripción de la call (es muy corta)." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  // La propuesta es un presupuesto a medida curado por el admin (no el cotizador
  // self-serve). Por eso incluimos los PROYECTOS BASE aunque estén inactivos en el
  // catálogo público (ej "plataforma" $2.5M): un software a medida tiene que poder
  // anclar en su núcleo real. Los addons siguen siendo solo los activos.
  const { data: svc } = await supabase
    .from("services")
    .select("id, slug, name, category, description, price_ars, type, active, sort_order");
  const services = ((svc ?? []) as Service[]).filter((s) => s.active || s.type === "project");
  const { data: mic } = await supabase
    .from("microservices")
    .select("id, service_slug, group_name, slug, name, description, price_ars, active, default_on, sort_order")
    .eq("active", true);
  const micros = (mic ?? []) as Microservice[];

  // Motor: si el lead ya tiene rubro, inyectamos el playbook de ese rubro.
  let leadVertical = "";
  let clientContext = "";
  if (leadId) {
    const { data: lead } = await supabase
      .from("leads")
      .select("vertical, meeting_notes")
      .eq("id", leadId)
      .maybeSingle();
    leadVertical = String(lead?.vertical ?? "").trim();
    clientContext = String(lead?.meeting_notes ?? "").trim();
  }
  const playbook = await getPlaybook(supabase, leadVertical);
  const playbookBlock = playbookToPrompt(playbook);

  const system = `Sos el estratega de RUN, que desarrolla software a medida, agentes de IA e integraciones. Pensás con PRIMEROS PRINCIPIOS: directo, sin relleno, enfocado en la oportunidad real de negocio y en qué conviene construir primero para generar impacto.

🚨 ESTO LO LEE EL CLIENTE FINAL. Es una propuesta PARA el cliente, no notas internas. Por lo tanto, en TODOS los textos (positioning, opportunities, recommendation, phase1, roadmap, scenarios):
- Escribí SIEMPRE dirigido al cliente (hablale de "tu negocio", "vas a poder"), en tono profesional, concreto y convincente.
- PROHIBIDO mencionar competidores o productos/herramientas de terceros por nombre o con precios (ej "reemplaza al competidor de $X/mes"). Hablá del valor que gana el cliente, no de contra quién compite.
- PROHIBIDO hablar en primera persona del proveedor ni de lo que "nos conviene" / "nos deja facturar", y nada de asides internos de venta (ej "no vendamos la NASA", "esto nos da data"). Reformulalo siempre como beneficio del cliente.
- Nada de jerga interna ni comentarios de pasillo. Que se lea como una propuesta seria que el cliente puede mostrar a su socio.

Te paso la TRANSCRIPCIÓN de una videollamada con un potencial cliente. Devolvés una PROPUESTA ESTRUCTURADA (NO un texto largo) con:
1) "positioning": una frase filosa de la transformación que propone RUN.
2) "opportunities": lectura de 3-5 oportunidades del negocio (qué construir, cómo genera ingresos, tu lectura honesta de cada una).
3) "recommendation": por dónde empezar y por qué, en 3-5 frases, con criterio (qué resultado concreto consigue el cliente primero y qué conviene validar antes de invertir más). Siempre en beneficio del cliente, sin mencionar competidores.
4) "phase1": la Fase 1 recomendada para arrancar con impacto.
5) "roadmap": cronograma realista de la Fase 1 (por semanas o meses según el tamaño), 3-6 etapas, cada una con el hito concreto que ve o recibe el cliente. Sé realista con los plazos de un desarrollo a medida.
6) "scenarios": EXACTAMENTE 2 escenarios de inversión armados con slugs del catálogo: 'recomendado' (punto de entrada, marcado como recomendado) y 'completo' (versión integral). NO generes un tercer escenario más económico/básico. NO generes módulos opcionales/adicionales: el cliente elige entre los 2 escenarios y listo.

Reglas:
- Para scenarios usá EXCLUSIVAMENTE slugs/claves del catálogo de abajo. No inventes servicios ni precios: los calcula el sistema.
- Los 2 escenarios son incrementales: recomendado ⊂ completo.
- Español rioplatense. Nada de relleno ni marketing vacío: lectura honesta y concreta.
- Si te paso CONTEXTO DEL CLIENTE (datos de su web / notas), usalo para afinar el diagnóstico: distinguí bien lo que el cliente YA TIENE de lo que le falta, y no propongas como nuevo algo que ya tiene.

ANCLAJE DE PRECIO (CRÍTICO — no lo ignores):
- RUN vende software a medida. Si el cliente necesita una plataforma, una app, un sistema con lógica propia, un portal, o integraciones con sistemas externos (PACS, ERP, HIS, APIs, pasarelas, etc.), CADA uno de los 3 escenarios DEBE anclar en un service type=project real del catálogo ("plataforma" para un sistema a medida, "ecommerce" para una tienda, "sitio" para institucional). Ese proyecto base es el NÚCLEO del presupuesto.
- Los microservicios y addons SE SUMAN al proyecto base. NUNCA reemplazan al proyecto base. Un presupuesto de software a medida armado solo con microservicios está MAL y sale ridículamente barato: eso no puede pasar.
- Progresión típica para software a medida (son 2 escenarios, NO 3):
  · recomendado (punto de entrada) = proyecto base (ej "plataforma") + el núcleo que opera + la integración/automatización clave que lo hace sólido en producción. Es un entregable serio, no una versión recortada.
  · completo = todo lo del recomendado + portal multi-actor, pagos diferenciados, automatizaciones, reportes, etc.
- No armes un escenario "económico/básico" por debajo del recomendado: RUN no lowballea; el punto de entrada ya tiene que ser una solución real.
- Sanity check antes de responder: un desarrollo a medida serio (plataforma + integración con un sistema externo) NO puede dar un total irrisorio. Si el escenario recomendado te quedó por debajo de lo que cuesta construir eso en serio (pensá en meses-persona reales de ingeniería), es porque te olvidaste del proyecto base o de funcionalidades: corregilo e incluí el service type=project que corresponde.
- Solo cuando el pedido es puramente branding/estrategia/marketing (sin software) un escenario puede no tener proyecto base.

Catálogo disponible (usá solo estos slugs/claves):
${buildCatalog(services, micros)}${playbookBlock ? `\n\n${playbookBlock}` : ""}`;

  let parsed: Output;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 5500,
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
      system,
      messages: [
        {
          role: "user",
          content: `Transcripción de la call:\n${transcript}${notes ? `\n\nNotas:\n${notes}` : ""}${clientContext ? `\n\nCONTEXTO DEL CLIENTE (datos de su web / notas — para afinar el diagnóstico de lo que YA tiene):\n${clientContext}` : ""}`,
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
    // Guardrail anti-presupuesto-barato: un microservicio SIEMPRE pertenece a un
    // proyecto (clave "service_slug:slug"). Si el escenario incluye micros de un
    // proyecto pero omitió el proyecto base, lo inyectamos: no se puede vender
    // "la integración de la plataforma" sin cobrar la plataforma.
    const projects = new Set((projectTypes ?? []).filter((s) => bySlug.get(s)?.type === "project"));
    for (const key of microservices ?? []) {
      const parent = key.split(":")[0];
      if (bySlug.get(parent)?.type === "project") projects.add(parent);
    }
    const addonSet = (projectTypes ?? [])
      .filter((s) => bySlug.get(s)?.type === "addon")
      .concat(addons ?? []);

    const items: LineItem[] = [];
    for (const slug of [...projects, ...addonSet]) {
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

  // Guardar el rubro clasificado en el lead (si no tenía) para el Motor.
  if (leadId && !leadVertical && parsed.vertical) {
    await supabase
      .from("leads")
      .update({ vertical: String(parsed.vertical).trim().toLowerCase() })
      .eq("id", leadId)
      .then(() => {}, () => {});
  }

  return NextResponse.json({
    positioning: parsed.positioning,
    summary: parsed.summary,
    vertical: parsed.vertical ?? leadVertical ?? null,
    opportunities: parsed.opportunities ?? [],
    recommendation: parsed.recommendation,
    phase1: parsed.phase1,
    nextPhases: parsed.nextPhases ?? [],
    roadmap: parsed.roadmap ?? null,
    scenarios,
    depositPercent,
    missing: parsed.missing ?? [],
  });
}
