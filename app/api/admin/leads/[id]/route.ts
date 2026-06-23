import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { activateProduction } from "@/lib/activation";

export const dynamic = "force-dynamic";

const STATES = [
  "nuevo",
  "adelanto_pagado",
  "en_produccion",
  "entregado",
  "cobrado_completo",
];

/** Cambia el estado del lead en el pipeline. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.status || !STATES.includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Transferencia validada por el admin → activar producción (estado + email)
  if (body.status === "en_produccion") {
    await activateProduction(supabase, id);
    const { data } = await supabase.from("leads").select("*").eq("id", id).single();
    return NextResponse.json({ lead: data });
  }

  const { data, error } = await supabase
    .from("leads")
    .update({ status: body.status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}

/** Elimina un lead. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
