/**
 * Integración MercadoPago vía REST (Checkout Pro).
 * El access token se lee de la config (DB), nunca se expone al cliente.
 */

import crypto from "node:crypto";

const MP_API = "https://api.mercadopago.com";

export type SignatureCheck = { valid: boolean; reason?: string };

/**
 * Valida la firma del webhook de MercadoPago según la guía oficial.
 * Manifest: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 * HMAC-SHA256 con la clave secreta → debe coincidir con v1 del header x-signature.
 */
export function verifyWebhookSignature(opts: {
  secret: string;
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): SignatureCheck {
  const { secret, xSignature, xRequestId, dataId } = opts;
  if (!xSignature) return { valid: false, reason: "missing_x_signature" };
  if (!dataId) return { valid: false, reason: "missing_data_id" };

  // x-signature: "ts=1700000000,v1=abc123..."
  let ts: string | null = null;
  let v1: string | null = null;
  for (const part of xSignature.split(",")) {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (k === "ts") ts = v;
    else if (k === "v1") v1 = v;
  }
  if (!ts || !v1) return { valid: false, reason: "malformed_x_signature" };

  // data.id alfanumérico debe ir en minúsculas (recomendación oficial).
  const id = /^\d+$/.test(dataId) ? dataId : dataId.toLowerCase();
  const manifest = `id:${id};request-id:${xRequestId ?? ""};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(v1, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false, reason: "hash_mismatch" };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: "compare_error" };
  }
}

export type FirmaDeMP =
  | { ok: true }
  | { ok: false; status: 401 | 500; reason: string };

/**
 * Exige la firma de MercadoPago en un webhook. Falla CERRADO: sin MP_WEBHOOK_SECRET no se procesa nada.
 *
 * Antes la firma se validaba "sólo si hay secreto": si la variable faltaba en un deploy, el webhook de pagos
 * aceptaba cualquier pedido, y el del Hub no la validaba nunca (auditoría 13/10/2026). Los dos reconsultan
 * el estado a la API de MP, así que no se podía inventar un pago, pero cualquiera podía dispararlos.
 *
 * Sin secreto responde 500 (no 200): MP reintenta, y cuando se carga la variable las notificaciones entran.
 * `dataId` es el `data.id` de la URL si vino (es el que firma MP); si no, el del body.
 */
export function exigirFirmaDeMP(req: Request, dataId: string | null): FirmaDeMP {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return { ok: false, status: 500, reason: "webhook_secret_missing" };
  const check = verifyWebhookSignature({
    secret,
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
    dataId,
  });
  return check.valid ? { ok: true } : { ok: false, status: 401, reason: check.reason ?? "invalid_signature" };
}

export type MPPreference = {
  id: string;
  init_point: string;
  sandbox_init_point: string;
};

export async function createPreference(opts: {
  accessToken: string;
  title: string;
  amount: number;
  externalReference: string; // leadId
  baseUrl: string;
  payerEmail?: string;
}): Promise<MPPreference> {
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.accessToken}`,
    },
    body: JSON.stringify({
      items: [
        {
          id: opts.externalReference,
          title: opts.title,
          quantity: 1,
          unit_price: opts.amount,
          currency_id: "ARS",
        },
      ],
      external_reference: opts.externalReference,
      ...(opts.payerEmail ? { payer: { email: opts.payerEmail } } : {}),
      // source_news=webhooks: sólo notificaciones de tipo Webhook (firmadas), no las IPN viejas sin firma,
      // que el webhook ahora rechaza.
      notification_url: `${opts.baseUrl}/api/payments/webhook?source_news=webhooks`,
      back_urls: {
        success: `${opts.baseUrl}/proyecto/${opts.externalReference}`,
        pending: `${opts.baseUrl}/pago?status=pending&lead=${opts.externalReference}`,
        failure: `${opts.baseUrl}/pago?status=failure&lead=${opts.externalReference}`,
      },
      auto_return: "approved",
      metadata: { lead_id: opts.externalReference },
      statement_descriptor: "RUN",
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`MercadoPago: ${res.status} ${detail}`);
  }
  return (await res.json()) as MPPreference;
}

export type MPPayment = {
  id: number;
  status: string; // approved | pending | rejected | ...
  external_reference: string | null;
  transaction_amount: number;
};

export async function getPayment(
  accessToken: string,
  paymentId: string,
): Promise<MPPayment> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`MercadoPago payment ${paymentId}: ${res.status}`);
  }
  return (await res.json()) as MPPayment;
}

/* ---------------- Suscripciones (preapproval) ---------------- */

export type MPPreapproval = {
  id: string;
  init_point: string;
  status: string; // pending | authorized | paused | cancelled
  external_reference: string | null;
};

/** Crea una suscripción mensual (preapproval) y devuelve el init_point para autorizar. */
export async function createPreapproval(opts: {
  accessToken: string;
  reason: string;
  amount: number;
  externalReference: string; // userId del Hub
  payerEmail: string;
  baseUrl: string;
}): Promise<MPPreapproval> {
  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.accessToken}`,
    },
    body: JSON.stringify({
      reason: opts.reason,
      external_reference: opts.externalReference,
      payer_email: opts.payerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: opts.amount,
        currency_id: "ARS",
      },
      back_url: `${opts.baseUrl}/hub`,
      status: "pending",
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`MercadoPago preapproval: ${res.status} ${detail}`);
  }
  return (await res.json()) as MPPreapproval;
}

export async function getPreapproval(
  accessToken: string,
  preapprovalId: string,
): Promise<MPPreapproval> {
  const res = await fetch(`${MP_API}/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`MercadoPago preapproval ${preapprovalId}: ${res.status}`);
  return (await res.json()) as MPPreapproval;
}

/** Mapea el estado de MP a nuestro subscription_status. */
export function mapPreapprovalStatus(mpStatus: string): "active" | "suspended" | "cancelled" {
  if (mpStatus === "authorized") return "active";
  if (mpStatus === "cancelled") return "cancelled";
  return "suspended"; // pending | paused | otros
}

/** Deriva la URL base pública desde el request (fallback a run72.app). */
export function baseUrlFrom(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (host) return `https://${host}`;
  return "https://run72.app";
}
