import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectPreview } from "./types";
import { logEvent } from "./audit";
import { DISCOVERY_QUESTIONS } from "./discovery";
import { PREVIEW_ART_DIRECTION } from "./preview-design";

const SCHEMA = {
  type: "object",
  properties: {
    interpretation: { type: "string", description: "Interpretación del proyecto (3-4 frases)." },
    detectedFunctionalities: { type: "array", items: { type: "string" } },
    includedDeliverables: { type: "array", items: { type: "string" } },
    mockups: {
      type: "array",
      description: "Entre 2 y 3 mockups conceptuales (los más importantes de la Fase 1).",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          html: {
            type: "string",
            description:
              "Documento HTML completo autocontenido (<!doctype html> + <style> inline). Permitido <link> a fonts.googleapis.com y <img>. SIN <script>. Diseño premium que deslumbra, nunca cajas grises.",
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
    max_tokens: 12000,
    output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
    system: `${PREVIEW_ART_DIRECTION}\n\nSos el director de producto y diseño de RUN. Devolvés mockups de UI en HTML autocontenido. Español rioplatense, datos realistas del negocio real del cliente.`,
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
  const transcript = typeof lead.transcript === "string" ? lead.transcript.trim() : "";
  const summary = typeof lead.conversation_summary === "string" ? lead.conversation_summary.trim() : "";
  const focus = typeof lead.focus === "string" ? lead.focus.trim() : "";

  // La propuesta ya generada (desde la transcripción) encierra la Fase 1
  // recomendada: la usamos como enfoque automático para los mockups, sin que
  // nadie tenga que cargar un "enfoque" a mano.
  const prop =
    lead.proposal && typeof lead.proposal === "object"
      ? (lead.proposal as { summary?: string; draft?: string; detectedNeeds?: string[] })
      : null;
  const proposalContext = prop
    ? [
        prop.summary ? `Resumen de la propuesta: ${prop.summary}` : "",
        prop.detectedNeeds?.length ? `Necesidades: ${prop.detectedNeeds.join("; ")}` : "",
        prop.draft ? `Propuesta enviada al cliente (incluye la Fase 1 recomendada):\n${prop.draft.slice(0, 6000)}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const disc =
    lead.discovery && typeof lead.discovery === "object" ? (lead.discovery as Record<string, string>) : null;
  const discoveryText = disc
    ? DISCOVERY_QUESTIONS.filter((q) => (disc[q.id] ?? "").trim())
        .map((q) => `- ${q.q}: ${disc[q.id]}`)
        .join("\n")
    : "";
  const fromCall = Boolean(transcript || focus || discoveryText || proposalContext);

  return [
    fromCall
      ? "Generá la vista previa VISUAL del proyecto basándote en la REUNIÓN con el cliente y la PROPUESTA ya armada (datos abajo). Los mockups tienen que REFLEJAR la Fase 1 recomendada en la propuesta. Deducí vos la fase de arranque a partir de la propuesta/transcripción (no esperes un enfoque cargado a mano): si la Fase 1 es un ecommerce, generá el ecommerce completo del rubro del cliente (Home, Listado, Ficha de producto, Checkout); si es una landing, el flujo de landing; etc. Siempre con datos realistas del negocio real del cliente."
      : "Generá la vista previa conceptual de este proyecto YA contratado.",
    `Proyecto: ${lead.project_label ?? "a definir"}.`,
    proposalContext,
    focus ? `ENFOQUE / Fase 1 recomendada por RUN (PRIORIZAR esto en los mockups): ${focus}` : "",
    `Tipo(s) (slugs): ${lead.project_type ?? "—"}.`,
    `Estado de marca: ${lead.brand_status ?? "—"}.`,
    `Objetivo: ${lead.objective ?? "—"}.`,
    `Servicios adicionales: ${addons.join(", ") || "ninguno"}.`,
    `Microservicios: ${micros.join(", ") || "ninguno"}.`,
    summary ? `Resumen del lead: ${summary}` : "",
    lead.urgency_note ? `Contexto del cliente: ${lead.urgency_note}` : "",
    discoveryText ? `Respuestas de la reunión de descubrimiento:\n${discoveryText}` : "",
    transcript ? `Transcripción de la videollamada:\n${transcript.slice(0, 20000)}` : "",
    docs.length ? `Archivos adjuntos (no imágenes): ${docs.map((d) => d.name).join(", ")}.` : "",
    "",
    "Reglas (generá SOLO los mockups MÁS IMPORTANTES de la Fase 1, MÁXIMO 3, priorizando las pantallas que mejor venden la idea; HTML conciso para no exceder tiempo):",
    "- Landing → Hero + CTA, Formulario.",
    "- Sitio Web → Home, Sección destacada.",
    "- Ecommerce → Home (con catálogo), Ficha de producto, Checkout.",
    "- Plataforma/CRM → Dashboard, Vista de detalle (clientes/reportes).",
    "- Si hay 'Redes sociales' → podés sumar 1 grid de Instagram (9 posts).",
    "Cada mockup: documento HTML completo autocontenido con <style> inline (permitido <link> a Google Fonts y <img>, SIN <script>). Imágenes de producto = tiles de GRADIENTE rico + ícono SVG inline del ítem, NUNCA cajas grises. Mantené el HTML compacto pero con detalle visual premium. Datos realistas y en español, del rubro del cliente. Respetá colores/estilo de las referencias adjuntas. Recordá: al abrir, tiene que DESLUMBRAR.",
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
