import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Lista todos los partners (incluye inactivos) para el admin. */
export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { data, error } = await getSupabaseAdmin()
    .from("hub_partners")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partners: data ?? [] });
}

/** Crea un partner. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const b = await req.json().catch(() => ({}));
  if (!b.category?.trim() || !b.name?.trim()) {
    return NextResponse.json({ error: "Categoría y nombre son obligatorios." }, { status: 400 });
  }
  const { data, error } = await getSupabaseAdmin()
    .from("hub_partners")
    .insert({
      category: b.category.trim(),
      name: b.name.trim(),
      description: b.description ?? null,
      contact: b.contact ?? null,
      website: b.website ?? null,
      whatsapp: b.whatsapp ?? null,
      notes: b.notes ?? null,
      sort_order: Number(b.sort_order) || 0,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partner: data });
}
