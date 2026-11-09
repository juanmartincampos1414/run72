import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectPreview, PreviewMockup } from "./types";
import { logEvent } from "./audit";
import { DISCOVERY_QUESTIONS } from "./discovery";
import { PREVIEW_ART_DIRECTION } from "./preview-design";
import { getReferences, fetchReferenceImage, referencesToPrompt } from "./refero";

// Pass 1 (director): planea las pantallas clave. SIN el HTML (que es lo pesado),
// así este JSON es chico y NUNCA se trunca.
const PLAN_SCHEMA = {
  type: "object",
  properties: {
    interpretation: { type: "string", description: "Interpretación del proyecto (3-4 frases)." },
    detectedFunctionalities: { type: "array", items: { type: "string" } },
    includedDeliverables: { type: "array", items: { type: "string" } },
    mockups: {
      type: "array",
      description: "Entre 2 y 3 pantallas CLAVE de la Fase 1 (las que mejor venden la idea).",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Nombre de la pantalla (ej: 'Home del e-commerce')." },
          description: { type: "string", description: "1 frase de qué muestra, para el cliente." },
          brief: {
            type: "string",
            description:
              "Brief de diseño para esta pantalla: qué secciones, componentes y datos concretos tiene que incluir (header, hero, grilla de productos con nombres/precios reales, filtros, checkout, etc.).",
          },
        },
        required: ["title", "description", "brief"],
        additionalProperties: false,
      },
    },
  },
  required: ["interpretation", "detectedFunctionalities", "includedDeliverables", "mockups"],
  additionalProperties: false,
} as const;

type MockupPlan = { title: string; description: string; brief: string };
type Plan = {
  interpretation: string;
  detectedFunctionalities: string[];
  includedDeliverables: string[];
  mockups: MockupPlan[];
};

type LeadLike = Record<string, unknown> & {
  id: string;
  files?: Array<{ name?: string; url: string; type?: string }> | null;
  preview_text?: string | null;
};

export type GenerateResult = { preview: ProjectPreview; fromCache: boolean };

/** Saca el HTML de la respuesta del builder (quita fences y prosa previa). */
function extractHtml(text: string): string {
  let t = text.trim();
  const fence = t.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const idx = t.search(/<!doctype html|<html/i);
  if (idx > 0) t = t.slice(idx);
  return t.trim();
}

/** Genera (o devuelve cacheado) el preview del lead. Guarda versión + audita.
 *
 *  Arquitectura: 1 pase "director" (plan de pantallas, JSON chico) + N pases
 *  "builder" EN PARALELO (cada uno devuelve el HTML de UNA pantalla como texto
 *  plano). Así ninguna respuesta es gigante (no se trunca el JSON) y el tiempo
 *  total es el de la pantalla más lenta, no la suma. */
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
  const refImages = images.map(
    (f) => ({ type: "image", source: { type: "url", url: f.url } }) as Anthropic.ContentBlockParam,
  );

  const client = new Anthropic({ apiKey });

  // --- Pase 1: director (plan de pantallas) ---
  const planResp = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 3000,
    output_config: { format: { type: "json_schema", schema: PLAN_SCHEMA }, effort: "low" },
    system: `${PREVIEW_ART_DIRECTION}\n\nSos el director de producto de RUN. Tu trabajo en este paso es PLANIFICAR: elegí las 2-3 pantallas clave de la Fase 1 y escribí un brief claro de cada una (todavía NO el HTML). Español rioplatense, datos realistas del negocio real del cliente.`,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }, ...refImages] }],
  });
  const planBlock = planResp.content.find((b) => b.type === "text");
  const plan = JSON.parse(planBlock && "text" in planBlock ? planBlock.text : "{}") as Plan;
  const planned = (plan.mockups ?? []).slice(0, 3);
  if (planned.length === 0) throw new Error("El plan no devolvió pantallas.");

  // --- Pase 2: builders (HTML de cada pantalla, EN PARALELO, texto plano) ---
  const builderSystem = `${PREVIEW_ART_DIRECTION}\n\nSos el diseñador de UI de RUN. Te paso el contexto del negocio y el brief de UNA pantalla. Devolvés EXCLUSIVAMENTE el documento HTML completo de esa pantalla (empezá en <!doctype html>), sin ningún texto antes o después, sin backticks. Español rioplatense, datos realistas del negocio real.`;

  // Pista de rubro para buscar referencias relevantes en Refero.
  const rubroHint = [
    typeof lead.project_label === "string" ? lead.project_label : "",
    plan.interpretation?.split(/[.·]/)[0] ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 120);

  const built = await Promise.all(
    planned.map(async (m): Promise<PreviewMockup | null> => {
      try {
        // Feed de referencias reales de Refero para ESTA pantalla (resiliente: [] si falla).
        const refs = await getReferences(`${m.title} ${rubroHint}`.trim(), 3);
        const refText = referencesToPrompt(refs);
        const refImgData = refs.length
          ? await fetchReferenceImage(refs.find((x) => x.imageUrl)?.imageUrl ?? "")
          : null;
        const referenceBlocks: Anthropic.ContentBlockParam[] = refImgData
          ? [
              {
                type: "image",
                source: { type: "base64", media_type: refImgData.mediaType as "image/jpeg", data: refImgData.base64 },
              } as Anthropic.ContentBlockParam,
            ]
          : [];

        const r = await client.messages.create({
          model: "claude-opus-4-8",
          max_tokens: 16000,
          output_config: { effort: "medium" },
          system: builderSystem,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `${prompt}\n\n=== DISEÑÁ ÚNICAMENTE ESTA PANTALLA ===\nTítulo: ${m.title}\nBrief: ${m.brief}\n${refText ? `\n${refText}\n` : ""}\nDevolvé solo el HTML completo de esta pantalla, premium y que deslumbre.`,
                },
                ...referenceBlocks,
                ...refImages,
              ],
            },
          ],
        });
        const b = r.content.find((x) => x.type === "text");
        const html = extractHtml(b && "text" in b ? b.text : "");
        if (html.length < 200) return null;
        return { title: m.title, description: m.description, html };
      } catch {
        return null;
      }
    }),
  );

  const mockups = built.filter((m): m is PreviewMockup => m !== null);
  if (mockups.length === 0) throw new Error("No se pudo generar ninguna pantalla. Probá de nuevo.");

  const preview: ProjectPreview = {
    interpretation: plan.interpretation ?? "",
    detectedFunctionalities: plan.detectedFunctionalities ?? [],
    includedDeliverables: plan.includedDeliverables ?? [],
    mockups,
  };
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
