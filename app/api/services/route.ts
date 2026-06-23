import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Service, Microservice } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Lista los servicios activos para el configurador (precios desde la DB). */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase no configurado." },
      { status: 503 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("services")
    .select("id, slug, name, category, description, price_ars, type, active, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Microservicios activos (tabla puede no existir aún si no se corrió la migración)
  let microservices: Microservice[] = [];
  const { data: micros } = await supabase
    .from("microservices")
    .select("id, service_slug, group_name, slug, name, description, price_ars, active, default_on, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (micros) microservices = micros as Microservice[];

  return NextResponse.json({
    services: (data ?? []) as Service[],
    microservices,
  });
}
