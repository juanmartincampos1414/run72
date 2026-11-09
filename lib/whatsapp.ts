// Cliente mínimo de la API de WhatsApp de Meta (Cloud API) para RUN:
// enviar plantillas aprobadas, consultar estado y validar la firma de los webhooks.
// Credenciales SOLO por variables de entorno de Vercel (nunca en el repo).
//
// Portado del proyecto Aikestar Métricas, sin sus IDs/plantillas propios.
// El número de WhatsApp sigue en el celular (coexistencia): esta API envía
// plantillas sin desconectar la app de WhatsApp Business.

import crypto from "node:crypto";

// WHATSAPP_GRAPH_URL solo para pruebas locales contra un Meta simulado.
const GRAPH = process.env.WHATSAPP_GRAPH_URL || "https://graph.facebook.com/v23.0";

// Para ENVIAR una plantilla solo hacen falta el token y el phone_id.
// El WABA_ID es solo para listar/gestionar plantillas por API (no para enviar),
// así se puede reutilizar el token del System User de otra cuenta y agregar
// únicamente el phone_id propio del número de RUN.
export const ENV_WHATSAPP = ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID"] as const;

const env = (k: string) => process.env[k];

/** Devuelve las variables obligatorias que faltan (para diagnóstico, nunca expone valores). */
export function faltanVariables(): string[] {
  return ENV_WHATSAPP.filter((k) => !env(k));
}

export function whatsappConfigurado(): boolean {
  return faltanVariables().length === 0;
}

async function graph(path: string, init: { method?: string; body?: unknown } = {}) {
  const r = await fetch(`${GRAPH}/${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  }).catch((err: Error) => {
    throw new Error(`No se pudo conectar con Meta (${err.message})`);
  });
  const j = (await r.json().catch(() => ({}))) as {
    error?: { message?: string; error_user_msg?: string; code?: number };
  } & Record<string, unknown>;
  if (!r.ok || j.error) {
    throw new Error(j.error?.error_user_msg || j.error?.message || `Meta respondió ${r.status}`);
  }
  return j;
}

/**
 * Normaliza un teléfono a formato WhatsApp (solo dígitos, con código de país, sin '+').
 * No inventa el "9" de los móviles argentinos: si el número viene sin él, se envía tal cual.
 * Devuelve null si no parece un número válido.
 */
export function normalizarTelefono(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = String(raw).replace(/[^\d+]/g, "");
  d = d.replace(/^\+/, "").replace(/^00/, "");
  if (d.length < 8 || d.length > 15) return null;
  // Argentina: los móviles necesitan el "9" después del 54 para WhatsApp (549...).
  // Centrilize captura el número sin el 9 (ej: +54 2323 53-8166 → 542323538166 → 5492323538166).
  if (d.startsWith("54") && !d.startsWith("549")) d = "549" + d.slice(2);
  return d;
}

/** Manda una plantilla aprobada. Devuelve el id del mensaje (wamid). */
export async function enviarPlantilla(
  to: string,
  nombre: string,
  idioma: string,
  variables: string[],
): Promise<string> {
  const j = await graph(`${env("WHATSAPP_PHONE_ID")}/messages`, {
    method: "POST",
    body: {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: nombre,
        language: { code: idioma },
        components: variables.length
          ? [{ type: "body", parameters: variables.map((text) => ({ type: "text", text })) }]
          : [],
      },
    },
  });
  const id = (j.messages as { id: string }[] | undefined)?.[0]?.id;
  if (!id) throw new Error("Meta no devolvió el id del mensaje");
  return id;
}

/** Estado del número: nombre visible, calidad y límite de mensajes. */
export async function estadoNumero() {
  return graph(
    `${env("WHATSAPP_PHONE_ID")}?fields=display_phone_number,verified_name,name_status,quality_rating,messaging_limit_tier,status,code_verification_status`,
  );
}

export type PlantillaMeta = {
  name: string;
  status: string;
  category: string;
  language: string;
  rejected_reason?: string;
};

export async function listarPlantillas(): Promise<PlantillaMeta[]> {
  const j = await graph(
    `${env("WHATSAPP_WABA_ID")}/message_templates?fields=name,status,category,language,rejected_reason&limit=200`,
  );
  return (j.data as PlantillaMeta[]) ?? [];
}

/** Firma de los webhooks de Meta: HMAC-SHA256 del cuerpo crudo con el App Secret. */
export function verifyWebhookSignature(raw: string, firma: string | null, secreto: string): boolean {
  if (!firma?.startsWith("sha256=")) return false;
  const esperada = Buffer.from("sha256=" + crypto.createHmac("sha256", secreto).update(raw).digest("hex"));
  const dada = Buffer.from(firma);
  return esperada.length === dada.length && crypto.timingSafeEqual(esperada, dada);
}

/** Alias en español, misma verificación HMAC. */
export const firmaValida = verifyWebhookSignature;
