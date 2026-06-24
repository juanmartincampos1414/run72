import type { Service, Microservice } from "./types";

/**
 * Project Concierge — lógica del cotizador conversacional.
 * Claude propone SLUGS del catálogo (servicios/addons/microservicios); el precio
 * SIEMPRE lo calcula el server desde la DB. Claude nunca define precios.
 */

/** Arma el catálogo en texto para el system prompt (slugs exactos + precios reales). */
export function buildCatalog(services: Service[], micros: Microservice[]): string {
  const projects = services.filter((s) => s.type === "project");
  const addons = services.filter((s) => s.type === "addon");

  const line = (s: Service) =>
    `- slug "${s.slug}" · ${s.name} · $${s.price_ars} + IVA${s.description ? ` · ${s.description}` : ""}`;

  const microByService = new Map<string, Microservice[]>();
  for (const m of micros) {
    const arr = microByService.get(m.service_slug) ?? [];
    arr.push(m);
    microByService.set(m.service_slug, arr);
  }

  const microBlock = [...microByService.entries()]
    .map(([svc, list]) => {
      const items = list
        .map((m) => `    · clave "${svc}:${m.slug}" · ${m.name} · $${m.price_ars} + IVA`)
        .join("\n");
      return `  Funcionalidades de "${svc}":\n${items}`;
    })
    .join("\n");

  return [
    "TIPOS DE PROYECTO (services type=project):",
    projects.map(line).join("\n") || "  (ninguno)",
    "",
    "ADDONS (services type=addon):",
    addons.map(line).join("\n") || "  (ninguno)",
    "",
    "FUNCIONALIDADES (microservicios, clave = 'service_slug:slug'):",
    microBlock || "  (ninguna)",
  ].join("\n");
}

/** Schema de salida estructurada que devuelve Claude en cada turno. */
export const CONCIERGE_SCHEMA = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description:
        "Tu respuesta al usuario. UNA sola pregunta corta por turno mientras indagás, o la introducción a la propuesta, o el pedido de nombre y email. Tono de consultor cálido, español rioplatense. Nunca menciones precios que no estén en el catálogo.",
    },
    proposal: {
      type: ["object", "null"],
      description:
        "Completar SOLO cuando ya entendés el proyecto lo suficiente para cotizar. Mantener en null mientras seguís indagando. Usar EXCLUSIVAMENTE slugs/claves del catálogo provisto.",
      properties: {
        summary: { type: "string", description: "Resumen del proyecto del cliente, 1-2 frases." },
        detectedNeeds: {
          type: "array",
          items: { type: "string" },
          description: "Necesidades detectadas, en lenguaje simple del cliente.",
        },
        projectTypes: {
          type: "array",
          items: { type: "string" },
          description: "slugs de tipos de proyecto recomendados (del catálogo).",
        },
        addons: {
          type: "array",
          items: { type: "string" },
          description: "slugs de addons recomendados (del catálogo).",
        },
        microservices: {
          type: "array",
          items: { type: "string" },
          description: "claves 'service_slug:slug' de funcionalidades recomendadas (del catálogo).",
        },
        objective: {
          type: ["string", "null"],
          description: "uno de: vender, automatizar, lanzar, profesionalizar, escalar; o null.",
        },
      },
      required: ["summary", "detectedNeeds", "projectTypes", "addons", "microservices", "objective"],
      additionalProperties: false,
    },
    contact: {
      type: ["object", "null"],
      description:
        "Completar SOLO cuando el usuario YA dio su nombre y un email válido. Mantener en null hasta entonces.",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        whatsapp: { type: ["string", "null"] },
        company: { type: ["string", "null"] },
      },
      required: ["name", "email", "whatsapp", "company"],
      additionalProperties: false,
    },
  },
  required: ["message", "proposal", "contact"],
  additionalProperties: false,
} as const;

export type ConciergeProposal = {
  summary: string;
  detectedNeeds: string[];
  projectTypes: string[];
  addons: string[];
  microservices: string[];
  objective: string | null;
};

export type ConciergeOutput = {
  message: string;
  proposal: ConciergeProposal | null;
  contact: { name: string; email: string; whatsapp: string | null; company: string | null } | null;
};

export function buildSystemPrompt(catalog: string): string {
  return [
    "Sos el Project Concierge de RUN72, una empresa que lanza negocios digitales en 72 horas.",
    "Actuás como un consultor senior: entendés el negocio del cliente, detectás sus necesidades y armás una propuesta concreta de RUN72 lista para pagar.",
    "",
    "OBJETIVO: ayudar al cliente a definir su proyecto y transformarlo en una propuesta con precio. NO sos un chatbot de soporte; no respondas temas ajenos a cotizar su proyecto.",
    "",
    "CÓMO CONVERSÁS:",
    "- Una sola pregunta corta por turno. Nada de cuestionarios ni listas de preguntas.",
    "- Inferí todo lo posible de lo que el cliente ya dijo. Preguntá SOLO lo estrictamente necesario para cotizar.",
    "- Tono humano, cálido y profesional. Español rioplatense.",
    "- Necesitás entender: qué quiere construir y para qué, su actividad/etapa/objetivo, y el alcance (funcionalidades, integraciones, automatizaciones, branding, redes). Preguntá por activos existentes (dominio, hosting, redes, branding) SOLO si es relevante.",
    "",
    "PROPUESTA:",
    "- Cuando tengas información suficiente, completá 'proposal' usando EXCLUSIVAMENTE los slugs y claves del catálogo de abajo. Nunca inventes servicios, funcionalidades ni precios.",
    "- En 'message', presentá la propuesta en lenguaje claro (qué entendiste + qué recomendás), SIN inventar el precio: el sistema le muestra el precio real debajo de tu mensaje.",
    "- Si el cliente pide ajustes, actualizá la propuesta en el siguiente turno.",
    "",
    "CIERRE:",
    "- Cuando el cliente confirme que quiere avanzar, pedile nombre y email (WhatsApp opcional). Cuando los tengas, completá 'contact'.",
    "- No completes 'contact' con datos inventados ni incompletos.",
    "",
    "REGLAS DE SEGURIDAD (innegociables): no inventes precios, servicios ni funcionalidades; no prometas nada fuera del catálogo; no modifiques condiciones comerciales. El plazo es 72h y el anticipo es 30%.",
    "",
    "CATÁLOGO ACTUAL (única fuente de verdad de servicios y precios):",
    catalog,
  ].join("\n");
}
