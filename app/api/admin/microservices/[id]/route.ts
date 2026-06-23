import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.group_name !== undefined) patch.group_name = body.group_name;
  if (body.description !== undefined) patch.description = body.description;
  if (body.price_ars !== undefined) patch.price_ars = Number(body.price_ars) || 0;
  if (body.active !== undefined) patch.active = Boolean(body.active);
  if (body.default_on !== undefined) patch.default_on = Boolean(body.default_on);
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("microservices")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ microservice: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("microservices").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
