import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { extractPath, signMany } from "@/lib/storage";
import { normalizarTelefono } from "@/lib/whatsapp";
import { logEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Crea un lead manualmente desde el admin (si la integración con Centralize no lo tomó). */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const telRaw = (body.whatsapp ?? "").trim();
  const whatsapp = normalizarTelefono(telRaw) || telRaw || null;
  const company = (body.company ?? "").trim() || null;
  const idea = (body.idea ?? "").trim();
  const budget = (body.budget ?? "").trim();

  if (!name && !email && !whatsapp) {
    return NextResponse.json({ error: "Cargá al menos nombre, email o WhatsApp." }, { status: 400 });
  }

  const resumen = [
    idea ? `💡 Idea: ${idea}` : null,
    budget ? `💰 Presupuesto: ${budget}` : null,
    "📣 Origen: carga manual",
  ]
    .filter(Boolean)
    .join("\n");
  const hot = /8\.?000|más de 8|mas de 8|\+\s*8/i.test(budget);

  const supabase = getSupabaseAdmin();
  const base: Record<string, unknown> = {
    name: name || "Lead manual",
    email: email || null,
    whatsapp,
    phone: whatsapp,
    company,
    project_label: "Software / IA a medida (manual)",
    status: "nuevo",
    hot,
    total_ars: 0,
    deposit_ars: 0,
  };
  const extra: Record<string, unknown> = {
    source_type: "manual",
    conversation_summary: resumen,
    intake: { origen: "manual", idea, budget },
  };

  let lead: { id: string } | null = null;
  let err: { message: string } | null = null;
  {
    const res = await supabase.from("leads").insert({ ...base, ...extra }).select("id").single();
    if (res.error && /column|does not exist|schema cache/i.test(res.error.message)) {
      const retry = await supabase.from("leads").insert(base).select("id").single();
      lead = retry.data;
      err = retry.error;
    } else {
      lead = res.data;
      err = res.error;
    }
  }
  if (err || !lead) return NextResponse.json({ error: err?.message ?? "No se pudo crear el lead." }, { status: 500 });

  await logEvent(supabase, "lead_created", lead.id, { source: "manual", actor: auth.user?.email ?? "admin" });
  return NextResponse.json({ ok: true, id: lead.id });
}

/** Lista los leads (más nuevos primero) para el CRM. */
export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const leads = data ?? [];

  // Bucket privado: firmamos comprobantes y adjuntos en un solo batch.
  const allStored: string[] = [];
  for (const l of leads) {
    if (l.comprobante_url) allStored.push(l.comprobante_url);
    if (Array.isArray(l.files)) for (const f of l.files) if (f?.url) allStored.push(f.url);
  }
  if (allStored.length > 0) {
    const signed = await signMany(allStored);
    const lookup = (stored: string | null) => {
      if (!stored) return stored;
      const p = extractPath(stored);
      return (p && signed.get(p)) || stored;
    };
    for (const l of leads) {
      if (l.comprobante_url) l.comprobante_url = lookup(l.comprobante_url);
      if (Array.isArray(l.files)) {
        l.files = l.files.map((f: { url: string }) => ({ ...f, url: lookup(f.url) }));
      }
    }
  }

  return NextResponse.json({ leads });
}
