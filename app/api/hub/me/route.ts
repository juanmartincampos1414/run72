import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { hubUser } from "@/lib/hub-guard";

export const dynamic = "force-dynamic";

/** Perfil del cliente del Hub (asegura que exista) + estado de suscripción. */
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "No configurado." }, { status: 503 });
  const user = await hubUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const admin = getSupabaseAdmin();
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

  const { data } = await admin
    .from("hub_profiles")
    .select("company_name, subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    company_name: data?.company_name ?? null,
    subscription_status: data?.subscription_status ?? "suspended",
  });
}
