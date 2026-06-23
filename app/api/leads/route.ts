import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  buildLineItems,
  computeScore,
  computeTotals,
} from "@/lib/pricing";
import { BRAND_STATUS, OBJECTIVES, TIMINGS, UNSURE_PROJECT, labelFor } from "@/lib/quote-options";
import type { QuoteSubmission, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  let body: QuoteSubmission;
  try {
    body = (await req.json()) as QuoteSubmission;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // --- Validación de contacto ---
  const contact = body.contact ?? ({} as QuoteSubmission["contact"]);
  const name = (contact.name ?? "").trim();
  const email = (contact.email ?? "").trim().toLowerCase();
  if (!name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // --- Cargar % de adelanto desde config ---
  const { data: config } = await supabase
    .from("config")
    .select("deposit_percent")
    .eq("id", 1)
    .maybeSingle();
  const depositPercent = config?.deposit_percent ?? 30;

  // --- Resolver precios SIEMPRE desde la DB (nunca confiar en el cliente) ---
  const wantedSlugs = [
    ...(body.projectType && body.projectType !== "unsure" ? [body.projectType] : []),
    ...(Array.isArray(body.addons) ? body.addons : []),
  ];

  let services: Service[] = [];
  if (wantedSlugs.length > 0) {
    const { data, error } = await supabase
      .from("services")
      .select("id, slug, name, category, description, price_ars, type, active, sort_order")
      .in("slug", wantedSlugs)
      .eq("active", true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    services = (data ?? []) as Service[];
  }

  const project =
    body.projectType && body.projectType !== "unsure"
      ? services.find((s) => s.slug === body.projectType && s.type === "project") ?? null
      : null;

  const addonServices = (Array.isArray(body.addons) ? body.addons : [])
    .map((slug) => services.find((s) => s.slug === slug && s.type === "addon"))
    .filter((s): s is Service => Boolean(s));

  const lineItems = buildLineItems(project, addonServices);
  const { total, deposit, balance } = computeTotals(lineItems, depositPercent);
  const { score, hot } = computeScore({
    projectType: body.projectType,
    addons: addonServices.map((a) => a.slug),
    timing: body.timing,
    objective: body.objective,
    total,
  });

  const projectLabel = project
    ? project.name
    : body.projectType === "unsure"
      ? UNSURE_PROJECT.label
      : null;

  // --- Insertar lead ---
  const { data: lead, error: insertError } = await supabase
    .from("leads")
    .insert({
      name,
      company: (contact.company ?? "").trim() || null,
      email,
      phone: (contact.phone ?? "").trim() || null,
      project_type: body.projectType ?? null,
      project_label: projectLabel,
      brand_status: labelFor(BRAND_STATUS, body.brandStatus),
      objective: labelFor(OBJECTIVES, body.objective),
      timing: labelFor(TIMINGS, body.timing),
      addons: addonServices.map((a) => ({ slug: a.slug, name: a.name, price_ars: a.price_ars })),
      line_items: lineItems,
      total_ars: total,
      deposit_ars: deposit,
      balance_ars: balance,
      deposit_percent: depositPercent,
      score,
      hot,
      status: "nuevo",
    })
    .select("id")
    .single();

  if (insertError || !lead) {
    return NextResponse.json(
      { error: insertError?.message ?? "No se pudo crear el lead." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    leadId: lead.id,
    projectLabel,
    lineItems,
    total,
    deposit,
    balance,
    depositPercent,
  });
}
