import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Partners recomendados visibles para el cliente (solo activos). */
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ partners: [] });
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { data } = await getSupabaseAdmin()
    .from("hub_partners")
    .select("id, category, name, description, contact, website, whatsapp, notes")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  return NextResponse.json({ partners: data ?? [] });
}
