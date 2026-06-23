import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getConfig } from "@/lib/config";
import { getPayment, verifyWebhookSignature } from "@/lib/mercadopago";
import { activateProduction } from "@/lib/activation";
import { logEvent } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Webhook de MercadoPago. Recibe notificaciones de pago, consulta el estado
 * real en la API de MP y actualiza el lead asociado (external_reference).
 * Siempre responde 200 para evitar reintentos infinitos.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });

    const url = new URL(req.url);
    const dataIdParam = url.searchParams.get("data.id"); // el que firma MercadoPago
    let type = url.searchParams.get("type") ?? url.searchParams.get("topic");
    let paymentId = dataIdParam ?? url.searchParams.get("id");

    // Algunos eventos llegan en el body
    try {
      const body = await req.json();
      type = type ?? body?.type ?? body?.action?.split(".")[0];
      paymentId = paymentId ?? body?.data?.id ?? body?.id;
    } catch {
      /* sin body JSON */
    }

    // Solo nos interesan notificaciones de pago
    if (!paymentId || (type && !`${type}`.includes("payment"))) {
      return NextResponse.json({ ok: true });
    }

    // --- Validación de firma (oficial MP). Solo se activa si hay secreto configurado. ---
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (secret) {
      const xRequestId = req.headers.get("x-request-id");
      const check = verifyWebhookSignature({
        secret,
        xSignature: req.headers.get("x-signature"),
        xRequestId,
        dataId: dataIdParam ?? `${paymentId}`,
      });
      if (!check.valid) {
        const supabase = getSupabaseAdmin();
        await logEvent(supabase, "webhook_signature_invalid", null, {
          ip,
          endpoint: "/api/payments/webhook",
          reason: check.reason,
          request_id: xRequestId,
          payment_id: `${paymentId}`,
        });
        console.warn(`[webhook] firma inválida (${check.reason}) ip=${ip} payment=${paymentId}`);
        // Nunca procesamos un pago con firma inválida.
        return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
      }
    }

    const config = await getConfig();
    if (!config.mp_access_token) return NextResponse.json({ ok: true });

    const payment = await getPayment(config.mp_access_token, `${paymentId}`);
    const leadId = payment.external_reference;
    if (!leadId) return NextResponse.json({ ok: true });

    const supabase = getSupabaseAdmin();
    await supabase
      .from("leads")
      .update({ payment_id: `${payment.id}`, payment_status: payment.status })
      .eq("id", leadId);

    // Pago aprobado → activar producción (estado + email automático)
    if (payment.status === "approved") {
      await activateProduction(supabase, leadId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Registramos el error pero devolvemos 200: evitamos reintentos en loop de MP.
    try {
      await logEvent(getSupabaseAdmin(), "unexpected_error", null, {
        ip,
        endpoint: "/api/payments/webhook",
        message: e instanceof Error ? e.message : "error",
      });
    } catch {
      /* logging best-effort */
    }
    console.error("[webhook] error inesperado", e);
    return NextResponse.json({ ok: true });
  }
}

// MP a veces hace un GET de verificación
export async function GET() {
  return NextResponse.json({ ok: true });
}
