import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { generateLeadPreview } from "@/lib/preview-gen";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAID = ["adelanto_pagado", "en_produccion", "entregado", "cobrado_completo"];

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  let leadId: string | undefined;
  try {
    ({ leadId } = await req.json());
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!leadId) return NextResponse.json({ error: "Falta leadId." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });

  const paid = PAID.includes(lead.status) || lead.comprobante_status === "aprobado";
  if (!paid) return NextResponse.json({ paid: false });

  try {
    const { preview } = await generateLeadPreview(supabase, lead);
    return NextResponse.json({ paid: true, preview });
  } catch (e) {
    return NextResponse.json(
      { paid: true, preview: null, error: e instanceof Error ? e.message : "error" },
      { status: 200 },
    );
  }
}
