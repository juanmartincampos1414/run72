/**
 * Integración MercadoPago vía REST (Checkout Pro).
 * El access token se lee de la config (DB), nunca se expone al cliente.
 */

const MP_API = "https://api.mercadopago.com";

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
