import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { buildLineItems, computeScore, computeTotals } from "@/lib/pricing";
import { BRAND_STATUS, OBJECTIVES, UNSURE_PROJECT, labelFor } from "@/lib/quote-options";
import type { QuoteSubmission, Service, LeadFile } from "@/lib/types";

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
  const whatsapp = (contact.whatsapp ?? "").trim();
  if (!name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  if (whatsapp.length < 6)
    return NextResponse.json({ error: "El WhatsApp es obligatorio." }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // --- % de adelanto desde config ---
  const { data: config } = await supabase
    .from("config")
    .select("deposit_percent")
    .eq("id", 1)
    .maybeSingle();
  const depositPercent = config?.deposit_percent ?? 30;

  // --- Resolver precios SIEMPRE desde la DB ---
  const projectSlugs = (Array.isArray(body.projectTypes) ? body.projectTypes : []).filter(
    (s) => s && s !== "unsure",
  );
  const addonSlugs = Array.isArray(body.addons) ? body.addons : [];
  const wantedSlugs = [...projectSlugs, ...addonSlugs];

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

  const projectServices = projectSlugs
    .map((slug) => services.find((s) => s.slug === slug && s.type === "project"))
    .filter((s): s is Service => Boolean(s));
  const addonServices = addonSlugs
    .map((slug) => services.find((s) => s.slug === slug && s.type === "addon"))
    .filter((s): s is Service => Boolean(s));

  // --- Microservicios: resolver precios desde la DB (claves "service_slug:slug") ---
  const microKeys = Array.isArray(body.microservices) ? body.microservices : [];
  let selectedMicros: Array<{ service_slug: string; slug: string; name: string; price_ars: number }> = [];
  if (microKeys.length > 0) {
    const microSlugs = microKeys.map((k) => k.split(":")[1]).filter(Boolean);
    const { data: micros } = await supabase
      .from("microservices")
      .select("service_slug, slug, name, price_ars")
      .in("slug", microSlugs)
      .eq("active", true);
    const wanted = new Set(microKeys);
    selectedMicros = (micros ?? []).filter((m) =>
      wanted.has(`${m.service_slug}:${m.slug}`),
    );
  }

  const lineItems = buildLineItems(projectServices, addonServices, selectedMicros);
  const { subtotal, iva, total, deposit, balance } = computeTotals(lineItems, depositPercent);
  const { score, hot } = computeScore({
    projectTypes: (Array.isArray(body.projectTypes) ? body.projectTypes : []).filter(Boolean),
    addons: addonServices.map((a) => a.slug),
    microservices: selectedMicros.map((m) => m.slug),
    timing: body.timing,
    objective: body.objective,
    total,
  });

  const unsure = (Array.isArray(body.projectTypes) ? body.projectTypes : []).includes("unsure");
  const labels = [
    ...projectServices.map((p) => p.name),
    ...(unsure ? [UNSURE_PROJECT.label] : []),
  ];
  const projectLabel = labels.length > 0 ? labels.join(" + ") : null;

  const files: LeadFile[] = Array.isArray(body.files) ? body.files.slice(0, 20) : [];

  // --- Insertar lead ---
  const { data: lead, error: insertError } = await supabase
    .from("leads")
    .insert({
      name,
      company: (contact.company ?? "").trim() || null,
      email,
      whatsapp,
      phone: whatsapp, // compatibilidad con columna previa
      project_type:
        [...projectSlugs, ...(unsure ? ["unsure"] : [])].join(",") || null,
      project_label: projectLabel,
      brand_status: labelFor(BRAND_STATUS, body.brandStatus),
      objective: labelFor(OBJECTIVES, body.objective),
      timing: "Lo antes posible",
      urgency_note: (body.urgencyNote ?? "").trim() || null,
      files,
      addons: addonServices.map((a) => ({ slug: a.slug, name: a.name, price_ars: a.price_ars })),
      microservices_selected: selectedMicros,
      line_items: lineItems,
      subtotal_ars: subtotal,
      iva_ars: iva,
      total_ars: total,
      deposit_ars: deposit,
      balance_ars: balance,
      deposit_percent: depositPercent,
      score,
      hot,
      status: "nuevo",
      preview_text: body.previewText ?? null,
      preview_rating:
        typeof body.previewRating === "number" ? body.previewRating : null,
      preview_comments: (body.previewComments ?? "").trim() || null,
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
    subtotal,
    iva,
    total,
    deposit,
    balance,
    depositPercent,
  });
}
