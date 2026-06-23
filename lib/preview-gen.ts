import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectPreview } from "./types";
import { logEvent } from "./audit";

const SCHEMA = {
  type: "object",
  properties: {
    interpretation: { type: "string", description: "Interpretación del proyecto (3-4 frases)." },
    detectedFunctionalities: { type: "array", items: { type: "string" } },
    includedDeliverables: { type: "array", items: { type: "string" } },
    mockups: {
      type: "array",
      description: "Entre 3 y 4 mockups conceptuales.",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          html: {
            type: "string",
            description: "Documento HTML autocontenido (<!doctype html> + <style> inline) sin scripts.",
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

type LeadLike = Record<string, unknown> & {
  id: string;
  files?: Array<{ name?: string; url: string; type?: string }> | null;
  preview_text?: string | null;
};

export type GenerateResult = { preview: ProjectPreview; fromCache: boolean };

/** Genera (o devuelve cacheado) el preview del lead. Guarda versión + audita. */
export async function generateLeadPreview(
  supabase: SupabaseClient,
  lead: LeadLike,
  opts: { force?: boolean; actor?: string } = {},
): Promise<GenerateResult> {
  const actor = opts.actor ?? "Sistema (post-pago)";

  // Cache
  if (!opts.force && lead.preview_text) {
    try {
      const cached = JSON.parse(lead.preview_text) as ProjectPreview;
      if (Array.isArray(cached.mockups) && cached.mockups.length > 0) {
        return { preview: cached, fromCache: true };
      }
    } catch {
      /* formato viejo; regenerar */
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { preview: fallbackPreview(lead), fromCache: false };

  const files = Array.isArray(lead.files) ? lead.files : [];
  const images = files.filter((f) => (f.type ?? "").startsWith("image/")).slice(0, 4);
  const docs = files.filter((f) => !(f.type ?? "").startsWith("image/"));
  const prompt = buildPrompt(lead, docs);

  const client = new Anthropic({ apiKey });
  const content: Anthropic.ContentBlockParam[] = [
    { type: "text", text: prompt },
    ...images.map(
      (f) => ({ type: "image", source: { type: "url", url: f.url } }) as Anthropic.ContentBlockParam,
    ),
  ];

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 14000,
    output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "low" },
    system:
      "Sos el director de producto y diseño de RUN72. Generás una vista previa conceptual con mockups de UI en HTML autocontenido (inline CSS, sin scripts ni recursos externos salvo el logo si se provee). Diseño premium, coherente con la marca del cliente (paleta/estilo de las imágenes adjuntas). Español rioplatense.",
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
  const preview = JSON.parse(raw) as ProjectPreview;
  preview.generatedAt = new Date().toISOString();

  // Persistir como última versión en el lead
  await supabase.from("leads").update({ preview_text: JSON.stringify(preview) }).eq("id", lead.id);

  // Guardar versión en el historial (no sobrescribe)
  try {
    await supabase.from("preview_versions").insert({
      lead_id: lead.id,
      prompt,
      response: preview.interpretation,
      preview,
      files_context: files,
      form_snapshot: {
        project_label: lead.project_label,
        project_type: lead.project_type,
        brand_status: lead.brand_status,
        objective: lead.objective,
        urgency_note: lead.urgency_note,
        addons: lead.addons,
        microservices_selected: lead.microservices_selected,
      },
      created_by: actor,
    });
  } catch {
    /* tabla preview_versions puede no existir aún */
  }

  await logEvent(supabase, opts.force ? "preview_regenerated" : "preview_generated", lead.id, {
    actor,
    mockups: preview.mockups.length,
  });

  return { preview, fromCache: false };
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
    "Reglas (generá SOLO mockups relevantes a lo contratado, MÁXIMO 4, priorizando el desarrollo principal; HTML conciso):",
    "- Landing → Hero, CTA, Formulario, Vista completa.",
    "- Sitio Web → Home, Vista mobile (~390px), Sección destacada.",
    "- Ecommerce → Home, Listado, Ficha de producto, Checkout.",
    "- Plataforma/CRM → Dashboard, Clientes, Reportes, Navegación.",
    "- Si hay 'Redes sociales' → sumá 1-2: grid de Instagram (9 posts) / perfil / portada.",
    "Cada mockup: documento HTML completo autocontenido con <style> inline, sin scripts ni imágenes externas. Respetá colores/estilo de las referencias adjuntas.",
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
