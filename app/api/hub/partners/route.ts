import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { requireActiveHub } from "@/lib/hub-guard";

export const dynamic = "force-dynamic";

/** Partners recomendados visibles para el cliente (solo activos). */
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ partners: [] });
  const auth = await requireActiveHub();
  if ("response" in auth) return auth.response;

  const { data } = await getSupabaseAdmin()
    .from("hub_partners")
    .select("id, category, name, description, contact, website, whatsapp, notes")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return NextResponse.json({ partners: data ?? [] });
}
