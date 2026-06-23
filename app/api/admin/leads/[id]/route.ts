import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { activateProduction } from "@/lib/activation";

export const dynamic = "force-dynamic";

const STATES = [
  "nuevo",
  "pendiente_validacion",
  "validado",
  "rechazado_alcance",
  "esperando_pago",
  "comprobante_recibido",
  "adelanto_pagado",
  "en_produccion",
  "entregado",
  "cobrado_completo",
];

/** Cambia el estado / ejecuta acciones sobre el lead. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();

  // --- Acciones de cobro / alcance ---
  if (body.action) {
    if (body.action === "approve_payment") {
      // Comprobante aprobado → adelanto pagado + producción + email
      await supabase
        .from("leads")
        .update({ comprobante_status: "aprobado" })
        .eq("id", id);
      await activateProduction(supabase, id);
      const { data } = await supabase.from("leads").select("*").eq("id", id).single();
      return NextResponse.json({ lead: data });
    }
    if (body.action === "reject_payment") {
      const { data, error } = await supabase
        .from("leads")
        .update({ comprobante_status: "rechazado", status: "esperando_pago" })
        .eq("id", id)
        .select("*")
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ lead: data });
    }
    if (body.action === "reject_scope") {
      const { data, error } = await supabase
        .from("leads")
        .update({
          status: "rechazado_alcance",
          rejection_reason: (body.reason ?? "").trim() || "Alcance incompatible con 72h",
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ lead: data });
    }
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  // --- Cambio de estado manual ---
  if (!body.status || !STATES.includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  // Pasar a producción dispara la activación (estado + email)
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
