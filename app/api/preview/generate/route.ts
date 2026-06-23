import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { generateLeadPreview } from "@/lib/preview-gen";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAID = ["adelanto_pagado", "en_produccion", "entregado", "cobrado_completo"];

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  // 60/h: la página post-pago hace polling cada 8s esperando la acreditación.
  // El costo real (generación con Claude) está acotado aparte por el check de
  // pago + el cache (se genera una sola vez por lead), así que el límite acá
  // es anti-abuso, no anti-costo.
  const limited = await enforceRateLimit({
    req,
    supabase: getSupabaseAdmin(),
    endpoint: "/api/preview/generate",
    limit: 60,
  });
  if (limited) return limited;

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

  // Elegible para ver el preview: pagó por MercadoPago, el comprobante de
  // transferencia ya fue aprobado, o al menos ya subió el comprobante
  // (transferencia en validación). Para transferencia no esperamos la
  // confirmación manual: el cliente ve su preview apenas envía el comprobante.
  const eligible =
    PAID.includes(lead.status) ||
    lead.comprobante_status === "aprobado" ||
    lead.comprobante_status === "recibido" ||
    lead.status === "comprobante_recibido";
  if (!eligible) return NextResponse.json({ paid: false });

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
