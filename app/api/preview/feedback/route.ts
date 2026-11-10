import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { findLeadByHandle } from "@/lib/lead-slug";

export const dynamic = "force-dynamic";

/** Guarda el rating/comentarios del preview post-pago en el lead. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true });

  let body: { leadId?: string; rating?: number; comments?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!body.leadId) return NextResponse.json({ error: "Falta leadId." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = {};
  if (typeof body.rating === "number") patch.preview_rating = body.rating;
  if (body.comments !== undefined) patch.preview_comments = body.comments.trim() || null;

  // leadId puede ser slug o UUID: resolvemos al id real antes de actualizar.
  const lead = await findLeadByHandle(supabase, body.leadId, "id");
  if (!lead) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  await supabase.from("leads").update(patch).eq("id", lead.id as string);
  return NextResponse.json({ ok: true });
}
