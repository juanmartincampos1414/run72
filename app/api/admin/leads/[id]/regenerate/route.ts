import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateLeadPreview } from "@/lib/preview-gen";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Regenera el preview IA (mantiene historial, no sobrescribe versiones). */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const actor = auth.user?.email ?? "admin";

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });

  try {
    const { preview } = await generateLeadPreview(supabase, lead, { force: true, actor });
    return NextResponse.json({ preview });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al regenerar." },
      { status: 502 },
    );
  }
}
