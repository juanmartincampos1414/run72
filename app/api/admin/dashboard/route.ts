import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { anticipoState, computeSla } from "@/lib/sla";

export const dynamic = "force-dynamic";

const PAID = ["adelanto_pagado", "en_produccion", "entregado", "cobrado_completo"];

type LeadRow = {
  id: string;
  created_at: string;
  status: string;
  total_ars: number;
  deposit_ars: number;
  hot: boolean;
  project_label: string | null;
  project_type: string | null;
  addons: Array<{ name: string }> | null;
  microservices_selected: Array<{ name: string }> | null;
  line_items: Array<{ name: string; price_ars: number }> | null;
  production_started_at: string | null;
  estimated_delivery_at: string | null;
  payment_status: string | null;
  comprobante_status: string | null;
};

type EventRow = { event_type: string; session_id: string | null; metadata: Record<string, unknown> };

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const supabase = getSupabaseAdmin();
  const { data: leadsData } = await supabase
    .from("leads")
    .select(
      "id, created_at, status, total_ars, deposit_ars, hot, project_label, project_type, addons, microservices_selected, line_items, production_started_at, estimated_delivery_at, payment_status, comprobante_status",
    );
  const leads = (leadsData ?? []) as LeadRow[];

  let events: EventRow[] = [];
  const { data: ev } = await supabase
    .from("events")
    .select("event_type, session_id, metadata")
    .limit(50000);
  if (ev) events = ev as EventRow[];

  const now = Date.now();
  const within = (iso: string | null, days: number) =>
    iso ? now - new Date(iso).getTime() <= days * 86400000 : false;

  const isPaid = (l: LeadRow) => PAID.includes(l.status);
  const paidLeads = leads.filter(isPaid);
  const paidDate = (l: LeadRow) => l.production_started_at ?? l.created_at;

  const revenue = paidLeads.reduce((s, l) => s + (l.deposit_ars || 0), 0);
  const revenue7 = paidLeads
    .filter((l) => within(paidDate(l), 7))
    .reduce((s, l) => s + (l.deposit_ars || 0), 0);
  const revenue30 = paidLeads
    .filter((l) => within(paidDate(l), 30))
    .reduce((s, l) => s + (l.deposit_ars || 0), 0);

  const pipeline = leads.reduce((s, l) => s + (l.total_ars || 0), 0);
  const avgTicket = leads.length ? Math.round(pipeline / leads.length) : 0;

  // Conversiones
  const startedSessions = new Set(
    events.filter((e) => e.event_type === "cotizador_started" && e.session_id).map((e) => e.session_id),
  ).size;
  const enProdOrBeyond = leads.filter((l) =>
    ["en_produccion", "entregado", "cobrado_completo"].includes(l.status),
  ).length;
  const entregadoOrBeyond = leads.filter((l) =>
    ["entregado", "cobrado_completo"].includes(l.status),
  ).length;

  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

  const conversions = {
    quoteToPay: pct(paidLeads.length, startedSessions || leads.length),
    leadToProduction: pct(enProdOrBeyond, leads.length),
    productionToDelivery: pct(entregadoOrBeyond, enProdOrBeyond),
  };

  // Funnel por paso (sesiones distintas por etapa)
  const distinct = (pred: (e: EventRow) => boolean) =>
    new Set(events.filter((e) => pred(e) && e.session_id).map((e) => e.session_id)).size;

  const stages = [
    { label: "Inicio", n: distinct((e) => e.event_type === "cotizador_started") },
    ...[0, 1, 2, 3, 4, 5].map((i) => ({
      label: `Paso ${i + 1}`,
      n: distinct((e) => e.event_type === "step_completed" && e.metadata?.step === i),
    })),
    { label: "Preview", n: distinct((e) => e.event_type === "preview_viewed") },
    { label: "Checkout", n: distinct((e) => e.event_type === "checkout_started") },
    { label: "Pago iniciado", n: distinct((e) => e.event_type === "payment_initiated") },
    { label: "Pago completado", n: distinct((e) => e.event_type === "payment_completed") },
  ];
  const base = stages[0].n || 1;
  const funnel = stages.map((s, i) => ({
    label: s.label,
    sessions: s.n,
    conversion: pct(s.n, base),
    dropoff: i > 0 ? Math.max(0, stages[i - 1].n - s.n) : 0,
  }));

  // Top servicios y microservicios (por cantidad)
  const svcCount: Record<string, number> = {};
  const microCount: Record<string, number> = {};
  for (const l of leads) {
    for (const item of l.line_items ?? []) {
      if (item.name.startsWith("↳")) continue;
      svcCount[item.name] = (svcCount[item.name] ?? 0) + 1;
    }
    for (const m of l.microservices_selected ?? []) {
      microCount[m.name] = (microCount[m.name] ?? 0) + 1;
    }
  }
  const topN = (obj: Record<string, number>) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

  // Revenue breakdown por tipo de proyecto (leads pagos)
  const revByProject: Record<string, number> = {};
  for (const l of paidLeads) {
    const key = l.project_label ?? "Sin definir";
    revByProject[key] = (revByProject[key] ?? 0) + (l.deposit_ars || 0);
  }
  const revenueBreakdown = Object.entries(revByProject)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, amount]) => ({ name, amount }));

  // Tiempo promedio hasta pago (horas)
  const paidWithTime = paidLeads.filter((l) => l.production_started_at);
  const avgHoursToPay = paidWithTime.length
    ? Math.round(
        paidWithTime.reduce(
          (s, l) => s + (new Date(l.production_started_at!).getTime() - new Date(l.created_at).getTime()) / 3600000,
          0,
        ) / paidWithTime.length,
      )
    : null;

  // --- Dashboard ejecutivo + SLA ---
  const active = leads.filter((l) => l.status === "en_produccion" && l.production_started_at);
  const activeSla = active.map((l) => ({
    lead: l,
    sla: computeSla(l.production_started_at, l.estimated_delivery_at),
  }));
  const overdue = activeSla.filter((x) => x.sla.overdue);
  const avgRemaining = active.length
    ? Math.round(activeSla.reduce((s, x) => s + x.sla.remainingH, 0) / active.length)
    : null;

  const stageCounts = {
    recibidos: leads.length,
    pendientesPago: leads.filter((l) => {
      const a = anticipoState(l);
      return a === "pendiente" || a === "comprobante_recibido";
    }).length,
    anticiposConfirmados: leads.filter((l) => {
      const a = anticipoState(l);
      return a === "confirmado" || a === "mercadopago";
    }).length,
    enDesarrollo: active.length,
    entregados: leads.filter((l) =>
      ["entregado", "cobrado_completo"].includes(l.status),
    ).length,
    vencidosSla: overdue.length,
  };

  const upcoming = activeSla
    .sort((a, b) => a.sla.remainingH - b.sla.remainingH)
    .slice(0, 6)
    .map((x) => ({
      id: x.lead.id,
      label: x.lead.project_label ?? "Proyecto",
      remainingH: x.sla.remainingH,
      pct: x.sla.pct,
      bucket: x.sla.bucket,
      overdue: x.sla.overdue,
    }));

  return NextResponse.json({
    stages: stageCounts,
    avgRemaining,
    upcoming,
    revenue: { total: revenue, last7: revenue7, last30: revenue30 },
    avgTicket,
    pipeline,
    totalLeads: leads.length,
    paidLeads: paidLeads.length,
    hot: leads.filter((l) => l.hot).length,
    cold: leads.filter((l) => !l.hot).length,
    conversions,
    funnel,
    topServices: topN(svcCount),
    topMicroservices: topN(microCount),
    revenueBreakdown,
    avgHoursToPay,
  });
}
