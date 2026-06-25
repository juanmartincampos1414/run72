import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { overallScore, type HubStatus } from "@/lib/hub";

export const dynamic = "force-dynamic";

/** Lista las empresas del Hub con su score y estado de suscripción. */
export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const admin = getSupabaseAdmin();

  const { data: profiles } = await admin
    .from("hub_profiles")
    .select("user_id, company_name, email, subscription_status, created_at")
    .order("created_at", { ascending: false });

  const { data: checklist } = await admin.from("hub_checklist").select("user_id, item_key, status");

  const byUser = new Map<string, Record<string, HubStatus>>();
  for (const r of checklist ?? []) {
    const m = byUser.get(r.user_id as string) ?? {};
    m[r.item_key as string] = r.status as HubStatus;
    byUser.set(r.user_id as string, m);
  }

  const companies = (profiles ?? []).map((p) => ({
    user_id: p.user_id,
    company_name: p.company_name,
    email: p.email,
    subscription_status: p.subscription_status,
    created_at: p.created_at,
    score: overallScore(byUser.get(p.user_id) ?? {}),
  }));

  return NextResponse.json({ companies });
}

/** Activa o suspende la cuenta de una empresa. */
export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const b = await req.json().catch(() => ({}));
  const userId = String(b.userId ?? "");
  const status = String(b.subscription_status ?? "");
  if (!userId || !["active", "suspended", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const { error } = await getSupabaseAdmin()
    .from("hub_profiles")
    .update({ subscription_status: status })
    .eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
