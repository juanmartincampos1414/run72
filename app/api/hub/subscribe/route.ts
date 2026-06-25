import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getConfig } from "@/lib/config";
import { createPreapproval, getPreapproval, mapPreapprovalStatus, baseUrlFrom } from "@/lib/mercadopago";
import { HUB_PRICE_ARS } from "@/lib/hub";
import { logEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

async function currentUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Crea la suscripción mensual del Hub y devuelve el init_point de MercadoPago. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const user = await currentUser();
  if (!user || !user.email) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const config = await getConfig();
  if (!config.mp_access_token) {
    return NextResponse.json({ error: "MercadoPago no está configurado." }, { status: 503 });
  }

  try {
    const pre = await createPreapproval({
      accessToken: config.mp_access_token,
      reason: "RUN72 Business Hub — suscripción mensual",
      amount: HUB_PRICE_ARS,
      externalReference: user.id,
      payerEmail: user.email,
      baseUrl: baseUrlFrom(req),
    });
    await getSupabaseAdmin()
      .from("hub_profiles")
      .upsert({ user_id: user.id, email: user.email }, { onConflict: "user_id", ignoreDuplicates: true });
    return NextResponse.json({ init_point: pre.init_point, preapproval_id: pre.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error creando la suscripción." },
      { status: 502 },
    );
  }
}

/** Confirma el estado de la suscripción al volver de MercadoPago (back_url). */
export async function PATCH(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const preapprovalId = String(body.preapprovalId ?? "");
  if (!preapprovalId) return NextResponse.json({ error: "Falta preapprovalId." }, { status: 400 });

  const config = await getConfig();
  if (!config.mp_access_token) return NextResponse.json({ error: "MP no configurado." }, { status: 503 });

  try {
    const pre = await getPreapproval(config.mp_access_token, preapprovalId);
    // Seguridad: la suscripción debe pertenecer a este usuario.
    if (pre.external_reference && pre.external_reference !== user.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
    const status = mapPreapprovalStatus(pre.status);
    const admin = getSupabaseAdmin();
    await admin.from("hub_profiles").update({ subscription_status: status }).eq("user_id", user.id);
    await logEvent(admin, "hub_subscription_updated", null, { user_id: user.id, status, source: "return" });
    return NextResponse.json({ subscription_status: status });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 });
  }
}
