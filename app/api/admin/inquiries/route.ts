import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const STATUSES = ["nuevo", "revisando", "contactado", "cerrado"] as const;

/** Lista de consultas a medida (solo project_inquiries), más recientes primero. */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  const status = new URL(req.url).searchParams.get("status");
  if (status && !(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  let query = getSupabaseAdmin()
    .from("project_inquiries")
    .select("id, name, email, company, interest, budget, status, created_at, notified_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar las consultas." }, { status: 500 });
  }
  return NextResponse.json({ inquiries: data ?? [] });
}
