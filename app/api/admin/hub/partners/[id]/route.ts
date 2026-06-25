import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const FIELDS = ["category", "name", "description", "contact", "website", "whatsapp", "notes", "active", "sort_order"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  for (const f of FIELDS) if (f in b) patch[f] = b[f];
  const { data, error } = await getSupabaseAdmin()
    .from("hub_partners")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partner: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const { error } = await getSupabaseAdmin().from("hub_partners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
