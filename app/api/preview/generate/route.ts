import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { ProjectPreview } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAID = ["adelanto_pagado", "en_produccion", "entregado", "cobrado_completo"];

const SCHEMA = {
  type: "object",
  properties: {
    interpretation: { type: "string", description: "Interpretación del proyecto (3-4 frases)." },
    detectedFunctionalities: { type: "array", items: { type: "string" } },
    includedDeliverables: { type: "array", items: { type: "string" } },
    mockups: {
      type: "array",
      description: "Entre 3 y 5 mockups conceptuales.",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string", description: "Qué muestra y qué se desarrollará (2-3 frases)." },
          html: {
            type: "string",
            description:
              "Documento HTML autocontenido (<!doctype html> + <style> inline) que renderiza la pantalla. Sin scripts.",
          },
        },
        required: ["title", "description", "html"],
        additionalProperties: false,
      },
    },
  },
  required: ["interpretation", "detectedFunctionalities", "includedDeliverables", "mockups"],
  additionalProperties: false,
} as const;

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  let leadId: string | undefined;
  try {
    ({ leadId } = await req.json());
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!leadId) return NextResponse.json({ error: "Falta leadId." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });

  const paid =
    PAID.includes(lead.status) || lead.comprobante_status === "aprobado";
  if (!paid) return NextResponse.json({ paid: false });

  // Cache: si ya se generó, devolver
  if (lead.preview_text) {
    try {
      const cached = JSON.parse(lead.preview_text) as ProjectPreview;
      if (Array.isArray(cached.mockups) && cached.mockups.length > 0) {
        return NextResponse.json({ paid: true, preview: cached });
      }
    } catch {
      /* formato viejo; regenerar */
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      paid: true,
      preview: fallbackPreview(lead),
    });
  }

  try {
    const client = new Anthropic({ apiKey });

    const files = Array.isArray(lead.files) ? lead.files : [];
    const images = files
      .filter((f: { type?: string; url: string }) => (f.type ?? "").startsWith("image/"))
      .slice(0, 4);
    const docs = files.filter((f: { type?: string }) => !(f.type ?? "").startsWith("image/"));

    const content: Anthropic.ContentBlockParam[] = [
      { type: "text", text: buildPrompt(lead, docs) },
      ...images.map(
        (f: { url: string }) =>
          ({ type: "image", source: { type: "url", url: f.url } }) as Anthropic.ContentBlockParam,
      ),
    ];

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 14000,
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "low" },
      system:
        "Sos el director de producto y diseño de RUN72. A partir de la información de un proyecto ya pagado, generás una vista previa conceptual con mockups de UI en HTML autocontenido (inline CSS, sin scripts, sin recursos externos salvo el logo si se provee). Diseño premium, moderno, coherente con la marca del cliente (usá su logo y paleta si están en las imágenes adjuntas; si no, una paleta sobria). Español rioplatense.",
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
    const preview = JSON.parse(raw) as ProjectPreview;
    preview.generatedAt = new Date().toISOString();

    await supabase
      .from("leads")
      .update({ preview_text: JSON.stringify(preview) })
      .eq("id", leadId);

    return NextResponse.json({ paid: true, preview });
  } catch (e) {
    return NextResponse.json(
      { paid: true, preview: fallbackPreview(lead), error: e instanceof Error ? e.message : "error" },
      { status: 200 },
    );
  }
}

function buildPrompt(lead: Record<string, unknown>, docs: Array<{ name?: string }>): string {
  const addons = Array.isArray(lead.addons)
    ? (lead.addons as Array<{ name: string }>).map((a) => a.name)
    : [];
  const micros = Array.isArray(lead.microservices_selected)
    ? (lead.microservices_selected as Array<{ name: string }>).map((m) => m.name)
    : [];
  return [
    "Generá la vista previa conceptual de este proyecto YA contratado.",
    `Proyecto: ${lead.project_label ?? "a definir"}.`,
    `Tipo(s) (slugs): ${lead.project_type ?? "—"}.`,
    `Estado de marca: ${lead.brand_status ?? "—"}.`,
    `Objetivo: ${lead.objective ?? "—"}.`,
    `Servicios adicionales: ${addons.join(", ") || "ninguno"}.`,
    `Microservicios: ${micros.join(", ") || "ninguno"}.`,
    lead.urgency_note ? `Contexto del cliente: ${lead.urgency_note}` : "",
    docs.length ? `Archivos adjuntos (no imágenes): ${docs.map((d) => d.name).join(", ")}.` : "",
    "",
    "Reglas de mockups (generá SOLO los relevantes a lo contratado, MÁXIMO 4, priorizando el desarrollo principal; HTML conciso y limpio):",
    "- Landing Page → Hero, CTA, Formulario, Vista completa.",
    "- Sitio Web → Home, Vista mobile (angosta ~390px), Sección destacada.",
    "- Ecommerce → Home, Listado de productos, Ficha de producto, Checkout.",
    "- Plataforma/CRM → Dashboard, Pantalla de clientes, Reportes, Navegación.",
    "- Si hay 'Redes sociales' entre los servicios → sumá 1-2 mockups: grid de Instagram (9 posts) / perfil / portada LinkedIn / feed.",
    "Cada mockup: documento HTML completo autocontenido con <style> inline, responsive al contenedor, sin scripts ni imágenes externas (podés usar bloques de color, formas y, si hay logo en las imágenes adjuntas, el texto de marca). Respetá colores y estilo de las referencias adjuntas.",
  ]
    .filter(Boolean)
    .join("\n");
}

function fallbackPreview(lead: Record<string, unknown>): ProjectPreview {
  return {
    interpretation: `Vista previa de ${lead.project_label ?? "tu proyecto"}. Estamos preparando los mockups conceptuales.`,
    detectedFunctionalities: [],
    includedDeliverables: Array.isArray(lead.addons)
      ? (lead.addons as Array<{ name: string }>).map((a) => a.name)
      : [],
    mockups: [],
  };
}
