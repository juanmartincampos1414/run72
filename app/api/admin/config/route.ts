import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Devuelve la config completa (incluye credenciales MP) para el panel. */
export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ config: data });
}

/** Actualiza datos bancarios, credenciales MP y parámetros. */
export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of [
    "bank_cbu",
    "bank_alias",
    "bank_holder",
    "mp_access_token",
    "mp_public_key",
  ]) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  if (body.deposit_percent !== undefined) {
    patch.deposit_percent = Math.min(100, Math.max(0, Number(body.deposit_percent) || 30));
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("config")
    .update(patch)
    .eq("id", 1)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ config: data });
}
