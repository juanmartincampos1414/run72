import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { activateProduction } from "@/lib/activation";
import { logEvent } from "@/lib/audit";
import { signOne } from "@/lib/storage";

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

/** Detalle del lead: lead + historial de previews + timeline de eventos. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error || !lead) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });

  // Bucket privado: firmamos comprobante y adjuntos para que el admin pueda verlos.
  lead.comprobante_url = await signOne(lead.comprobante_url);
  if (Array.isArray(lead.files)) {
    lead.files = await Promise.all(
      lead.files.map(async (f: { url: string }) => ({ ...f, url: (await signOne(f.url)) ?? f.url })),
    );
  }

  const { data: versions } = await supabase
    .from("preview_versions")
    .select("id, prompt, response, preview, files_context, form_snapshot, created_by, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const { data: events } = await supabase
    .from("events")
    .select("event_type, metadata, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ lead, versions: versions ?? [], events: events ?? [] });
}

/** Cambia estado / ejecuta acciones (aprobar/rechazar pago, rechazar alcance). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const actor = auth.user?.email ?? "admin";

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabaseAdmin();
  const observaciones = (body.observaciones ?? "").trim() || null;

  // Guardar Documento Final de Entrega
  if (body.delivery_doc) {
    const { data, error } = await supabase
      .from("leads")
      .update({ delivery_doc: body.delivery_doc })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logEvent(supabase, "delivery_doc_updated", id, { actor });
    return NextResponse.json({ lead: data });
  }

  if (body.action) {
    if (body.action === "approve_payment") {
      await supabase
        .from("leads")
        .update({ comprobante_status: "aprobado", comprobante_observaciones: observaciones })
        .eq("id", id);
      await activateProduction(supabase, id);
      await logEvent(supabase, "comprobante_approved", id, { actor, observaciones });
      const { data } = await supabase.from("leads").select("*").eq("id", id).single();
      return NextResponse.json({ lead: data });
    }
    if (body.action === "reject_payment") {
      const { data, error } = await supabase
        .from("leads")
        .update({
          comprobante_status: "rechazado",
          status: "esperando_pago",
          comprobante_observaciones: observaciones,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logEvent(supabase, "comprobante_rejected", id, { actor, observaciones });
      return NextResponse.json({ lead: data });
    }
    if (body.action === "reject_scope") {
      const reason = (body.reason ?? "").trim() || "Alcance incompatible con 72h";
      const { data, error } = await supabase
        .from("leads")
        .update({ status: "rechazado_alcance", rejection_reason: reason })
        .eq("id", id)
        .select("*")
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logEvent(supabase, "scope_rejected", id, { actor, reason });
      return NextResponse.json({ lead: data });
    }
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  if (!body.status || !STATES.includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

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
  await logEvent(supabase, "status_changed", id, { actor, status: body.status });
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
