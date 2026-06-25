import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getConfig } from "@/lib/config";
import { getPreapproval, mapPreapprovalStatus } from "@/lib/mercadopago";
import { logEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Webhook de suscripciones del Hub (separado del webhook de pagos para no tocar
 * el flujo de anticipos en producción). Configurar esta URL en MercadoPago para
 * el topic de preapproval. Reconfirma el estado contra la API de MP.
 */
export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });

    const url = new URL(req.url);
    let id = url.searchParams.get("data.id") ?? url.searchParams.get("id");
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
