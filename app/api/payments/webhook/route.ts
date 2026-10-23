import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getConfig } from "@/lib/config";
import { getPayment, exigirFirmaDeMP } from "@/lib/mercadopago";
import { activateProduction } from "@/lib/activation";
import { logEvent } from "@/lib/audit";
import { resolveMpToken, deployEnv, writeGuard } from "@/lib/commerce-guard";
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
    // Fail-closed: si Preview/local apunta a la base productiva, no se procesa ni
    // se escribe nada (ni siquiera auditoría, que también sería una escritura prod).
    const wg = writeGuard();
    if (!wg.ok) {
      console.warn(`[webhook] ${wg.error}`);
      return NextResponse.json({ ok: true });
    }

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

    // --- Firma de MP: obligatoria. Sin secreto configurado no se procesa nada (500 → MP reintenta). ---
    const firma = exigirFirmaDeMP(req, dataIdParam ?? `${paymentId}`);
    if (!firma.ok) {
      const supabase = getSupabaseAdmin();
      await logEvent(supabase, firma.status === 500 ? "webhook_secret_missing" : "webhook_signature_invalid", null, {
        ip,
        endpoint: "/api/payments/webhook",
        reason: firma.reason,
        request_id: req.headers.get("x-request-id"),
        payment_id: `${paymentId}`,
      });
      if (firma.status === 500) {
        console.error("[webhook] MP_WEBHOOK_SECRET no está configurado: no se procesan pagos hasta cargarlo");
        return NextResponse.json({ error: "Webhook sin configurar." }, { status: 500 });
      }
      console.warn(`[webhook] firma inválida (${firma.reason}) ip=${ip} payment=${paymentId}`);
      // Nunca procesamos un pago con firma inválida.
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }

    const config = await getConfig();
    // Guarda por entorno: fuera de producción sólo sandbox. Sin sandbox no se
    // procesa nada (evita que un Preview active pagos productivos de MercadoPago).
    const mp = resolveMpToken(config.mp_access_token);
    if ("error" in mp) {
      await logEvent(getSupabaseAdmin(), "webhook_skipped_env", null, { reason: mp.error, env: deployEnv(), payment_id: `${paymentId}` });
      return NextResponse.json({ ok: true });
    }

    const payment = await getPayment(mp.token, `${paymentId}`);
    const leadId = payment.external_reference;
    if (!leadId) return NextResponse.json({ ok: true });

    const supabase = getSupabaseAdmin();

    if (payment.status === "approved") {
      // Idempotencia a prueba de carrera: transición atómica a "approved" sólo si
      // todavía NO estaba aprobado. Ante dos webhooks concurrentes con el mismo
      // pago, una sola llamada actualiza la fila (devuelve id) y activa; la otra
      // no matchea (payment_status ya = approved) y no reprocesa. Sin doble
      // activación ni segundo correo.
      const { data: won } = await supabase
        .from("leads")
        .update({ payment_id: `${payment.id}`, payment_status: "approved" })
        .eq("id", leadId)
        .neq("payment_status", "approved")
        .select("id");
      if (won && won.length > 0) {
        await activateProduction(supabase, leadId);
        await logEvent(supabase, "payment_approved", leadId, { env: mp.env, payment_id: `${payment.id}` });
      }
    } else {
      // Estados no terminales (pending/rejected): se reflejan, sin activar.
      await supabase
        .from("leads")
        .update({ payment_id: `${payment.id}`, payment_status: payment.status })
        .eq("id", leadId);
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
