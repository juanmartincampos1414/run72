import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Lista TODOS los microservicios (incluye inactivos). */
export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("microservices")
    .select("*")
    .order("service_slug", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ microservices: data ?? [] });
}

/** Crea un microservicio. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await req.json().catch(() => null);
  if (!body?.service_slug || !body?.slug || !body?.name) {
    return NextResponse.json(
      { error: "service_slug, slug y name son obligatorios." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("microservices")
    .insert({
      service_slug: String(body.service_slug).trim().toLowerCase(),
      group_name: body.group_name ?? "General",
      slug: String(body.slug).trim().toLowerCase(),
      name: String(body.name).trim(),
      description: body.description ?? null,
      price_ars: Number(body.price_ars) || 0,
      active: body.active ?? true,
      default_on: body.default_on ?? false,
      sort_order: Number(body.sort_order) || 0,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ microservice: data });
}
