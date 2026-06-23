import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

export type PreviewInput = {
  projects: string[];
  addons: string[];
  brandStatus: string | null;
  objective: string | null;
  urgencyNote: string;
};

export type Preview = {
  interpretation: string;
  structure: string[];
  visualApproach: string;
  summary: string;
};

const SCHEMA = {
  type: "object",
  properties: {
    interpretation: {
      type: "string",
      description: "Interpretación breve (2-3 frases) de qué es el proyecto del cliente.",
    },
    structure: {
      type: "array",
      items: { type: "string" },
      description: "5 a 7 secciones/pantallas sugeridas para el proyecto, en orden.",
    },
    visualApproach: {
      type: "string",
      description: "Enfoque visual sugerido (estilo, colores, tono) en 1-2 frases.",
    },
    summary: {
      type: "string",
      description: "Una frase potente que resuma la visión del proyecto.",
    },
  },
  required: ["interpretation", "structure", "visualApproach", "summary"],
  additionalProperties: false,
} as const;

/** Genera el preview "Así imaginamos tu proyecto" con Claude (o template si no hay key). */
export async function POST(req: Request) {
  let input: PreviewInput;
  try {
    input = (await req.json()) as PreviewInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ preview: templatePreview(input), source: "template" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const prompt = buildPrompt(input);

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1500,
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "low" },
      system:
        "Sos un director creativo de RUN72, una empresa que lanza negocios digitales en 72 horas. Interpretás la idea del cliente y proponés una estructura concreta y un enfoque visual. Respondés en español rioplatense, conciso y profesional.",
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
    const preview = JSON.parse(raw) as Preview;
    return NextResponse.json({ preview, source: "ai" });
  } catch {
    // Si falla la IA, devolvemos el template para no romper el flujo.
    return NextResponse.json({ preview: templatePreview(input), source: "template" });
  }
}

function buildPrompt(input: PreviewInput): string {
  return [
    "Generá un preview conceptual del proyecto de este cliente.",
    `Tipo(s) de proyecto: ${input.projects.join(", ") || "a definir"}.`,
    `Servicios adicionales: ${input.addons.join(", ") || "ninguno"}.`,
    `Estado de marca: ${input.brandStatus ?? "no especificado"}.`,
    `Objetivo: ${input.objective ?? "no especificado"}.`,
    input.urgencyNote ? `Contexto del cliente: ${input.urgencyNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Preview determinístico cuando no hay IA configurada. */
function templatePreview(input: PreviewInput): Preview {
  const main = input.projects[0] ?? "tu proyecto";
  const baseStructure: Record<string, string[]> = {
    "Landing Page": ["Hero", "Beneficios", "Cómo funciona", "Prueba social", "Llamado a la acción"],
    Ecommerce: ["Home", "Catálogo", "Ficha de producto", "Carrito", "Checkout"],
    "Sitio Web": ["Home", "Servicios", "Nosotros", "Casos", "Contacto"],
    "Plataforma Web": ["Onboarding", "Dashboard", "Módulo principal", "Configuración", "Soporte"],
    Branding: ["Logo", "Paleta", "Tipografías", "Aplicaciones", "Manual de marca"],
    "Estrategia Comercial": ["Propuesta de valor", "Audiencia", "Posicionamiento", "Mensaje", "Plan de acción"],
  };
  return {
    interpretation: `Un proyecto de ${input.projects.join(" + ") || main} enfocado en ${input.objective ?? "crecer en el canal digital"}, listo para operar en 72 horas.`,
    structure: baseStructure[input.projects[0] ?? ""] ?? [
      "Inicio",
      "Propuesta de valor",
      "Servicios / Productos",
      "Prueba social",
      "Contacto",
    ],
    visualApproach:
      "Estética moderna y limpia, con identidad propia, jerarquía visual clara y foco en la conversión.",
    summary: `Tu ${main} listo para vender, con marca, estructura y estrategia alineadas.`,
  };
}
