import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getConfig } from "@/lib/config";
import { getPayment } from "@/lib/mercadopago";
import { activateProduction } from "@/lib/activation";

export const dynamic = "force-dynamic";

/**
 * Webhook de MercadoPago. Recibe notificaciones de pago, consulta el estado
 * real en la API de MP y actualiza el lead asociado (external_reference).
 * Siempre responde 200 para evitar reintentos infinitos.
 */
export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });

    const url = new URL(req.url);
    let type = url.searchParams.get("type") ?? url.searchParams.get("topic");
    let paymentId =
      url.searchParams.get("data.id") ?? url.searchParams.get("id");

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
  } catch {
    // Nunca devolvemos error: evitamos reintentos en loop de MP
    return NextResponse.json({ ok: true });
  }
}

// MP a veces hace un GET de verificación
export async function GET() {
  return NextResponse.json({ ok: true });
}
