import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { requireActiveHub } from "@/lib/hub-guard";
import { HUB_AREAS, STATUS_ORDER, type HubStatus } from "@/lib/hub";

export const dynamic = "force-dynamic";

const VALID_KEYS = new Set(HUB_AREAS.flatMap((a) => a.items.map((i) => i.key)));

async function currentUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Estados del checklist del usuario + su perfil. */
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const admin = getSupabaseAdmin();

  // Asegurar perfil (idempotente).
  await admin
    .from("hub_profiles")
    .upsert(
      {
        user_id: user.id,
        email: user.email,
        company_name: (user.user_metadata?.company_name as string) ?? null,
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  const { data: profile } = await admin
    .from("hub_profiles")
    .select("company_name, subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: rows } = await admin
    .from("hub_checklist")
    .select("item_key, status")
    .eq("user_id", user.id);

  const statuses: Record<string, HubStatus> = {};
  for (const r of rows ?? []) statuses[r.item_key as string] = r.status as HubStatus;

  return NextResponse.json({ statuses, profile: profile ?? null });
}

/** Actualiza el estado de un ítem del checklist del usuario. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const auth = await requireActiveHub();
  if ("response" in auth) return auth.response;
  const user = auth.user;

  const body = await req.json().catch(() => ({}));
  const itemKey = String(body.itemKey ?? "");
  const status = String(body.status ?? "") as HubStatus;
  if (!VALID_KEYS.has(itemKey)) return NextResponse.json({ error: "Ítem inválido." }, { status: 400 });
  if (!STATUS_ORDER.includes(status)) return NextResponse.json({ error: "Estado inválido." }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("hub_checklist")
    .upsert(
      { user_id: user.id, item_key: itemKey, status, updated_at: new Date().toISOString() },
      { onConflict: "user_id,item_key" },
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
