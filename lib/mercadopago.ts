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
      notification_url: `${opts.baseUrl}/api/payments/webhook`,
      back_urls: {
        success: `${opts.baseUrl}/proyecto/${opts.externalReference}`,
        pending: `${opts.baseUrl}/pago?status=pending&lead=${opts.externalReference}`,
        failure: `${opts.baseUrl}/pago?status=failure&lead=${opts.externalReference}`,
      },
      auto_return: "approved",
      metadata: { lead_id: opts.externalReference },
      statement_descriptor: "RUN72",
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
