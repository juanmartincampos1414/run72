import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getConfig } from "@/lib/config";
import { getPreapproval, mapPreapprovalStatus, exigirFirmaDeMP } from "@/lib/mercadopago";
import { logEvent } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Webhook de suscripciones del Hub (separado del webhook de pagos para no tocar
 * el flujo de anticipos en producción). Configurar esta URL en MercadoPago para
 * el topic de preapproval. Reconfirma el estado contra la API de MP.
 *
 * Exige la firma de MP (misma clave secreta que el webhook de pagos). Antes no la verificaba: cualquiera
 * podía dispararlo con el id de una suscripción ajena y forzar su re-sincronización.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });

    const url = new URL(req.url);
    const dataIdParam = url.searchParams.get("data.id"); // el que firma MercadoPago
    let id = dataIdParam ?? url.searchParams.get("id");
    let type = url.searchParams.get("type") ?? url.searchParams.get("topic");
    try {
      const body = await req.json();
      id = id ?? body?.data?.id ?? body?.id;
      type = type ?? body?.type ?? body?.action?.split(".")[0];
    } catch {
      /* sin body */
    }

    // Solo eventos de suscripción/preapproval.
    if (!id || (type && !/preapproval|subscription/i.test(`${type}`))) {
      return NextResponse.json({ ok: true });
    }

    // --- Firma de MP: obligatoria. Sin secreto configurado no se procesa nada (500 → MP reintenta). ---
    const firma = exigirFirmaDeMP(req, dataIdParam ?? `${id}`);
    if (!firma.ok) {
      await logEvent(getSupabaseAdmin(), firma.status === 500 ? "webhook_secret_missing" : "webhook_signature_invalid", null, {
        ip,
        endpoint: "/api/hub/webhook",
        reason: firma.reason,
        request_id: req.headers.get("x-request-id"),
        preapproval_id: `${id}`,
      });
      if (firma.status === 500) {
        console.error("[hub/webhook] MP_WEBHOOK_SECRET no está configurado: no se procesan suscripciones hasta cargarlo");
        return NextResponse.json({ error: "Webhook sin configurar." }, { status: 500 });
      }
      console.warn(`[hub/webhook] firma inválida (${firma.reason}) ip=${ip} preapproval=${id}`);
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }

    const config = await getConfig();
    if (!config.mp_access_token) return NextResponse.json({ ok: true });

    const pre = await getPreapproval(config.mp_access_token, `${id}`);
    if (!pre.external_reference) return NextResponse.json({ ok: true });

    const status = mapPreapprovalStatus(pre.status);
    const admin = getSupabaseAdmin();
    await admin
      .from("hub_profiles")
      .update({ subscription_status: status })
      .eq("user_id", pre.external_reference);
    await logEvent(admin, "hub_subscription_updated", null, {
      user_id: pre.external_reference,
      status,
      mp_status: pre.status,
      source: "webhook",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
