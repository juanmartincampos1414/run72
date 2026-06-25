import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Usuario autenticado del Hub (cualquier sesión), o null. */
export async function hubUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Para APIs del Hub: exige sesión Y suscripción activa.
 * Devuelve { user } o { response } (401 sin sesión, 403 si la suscripción no está activa).
 */
export async function requireActiveHub() {
  const user = await hubUser();
  if (!user) return { response: NextResponse.json({ error: "No autorizado." }, { status: 401 }) };

  const { data } = await getSupabaseAdmin()
    .from("hub_profiles")
    .select("subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data || data.subscription_status !== "active") {
    return { response: NextResponse.json({ error: "Suscripción inactiva." }, { status: 403 }) };
  }
  return { user };
}
