import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

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

  await supabase.from("leads").update(patch).eq("id", body.leadId);
  return NextResponse.json({ ok: true });
}
