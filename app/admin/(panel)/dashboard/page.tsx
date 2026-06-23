"use client";

import { useEffect, useState } from "react";
import { formatARS } from "@/lib/pricing";

type Dashboard = {
  revenue: { total: number; last7: number; last30: number };
  avgTicket: number;
  pipeline: number;
  totalLeads: number;
  paidLeads: number;
  hot: number;
  cold: number;
  conversions: { quoteToPay: number; leadToProduction: number; productionToDelivery: number };
  funnel: { label: string; sessions: number; conversion: number; dropoff: number }[];
  topServices: { name: string; count: number }[];
  topMicroservices: { name: string; count: number }[];
  revenueBreakdown: { name: string; amount: number }[];
  avgHoursToPay: number | null;
};

export default function DashboardPage() {
  const [d, setD] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setD)
      .catch(() => setError("No se pudo cargar el dashboard."));
  }, []);

  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!d) return <p className="text-sm text-faint">Cargando métricas…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Métricas, funnel y revenue del negocio.</p>

      {/* Revenue + métricas clave */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Revenue total" value={formatARS(d.revenue.total)} accent />
        <Metric label="Revenue 7 días" value={formatARS(d.revenue.last7)} />
        <Metric label="Revenue 30 días" value={formatARS(d.revenue.last30)} />
        <Metric label="Ticket promedio" value={formatARS(d.avgTicket)} />
        <Metric label="Pipeline total" value={formatARS(d.pipeline)} />
        <Metric label="Leads" value={String(d.totalLeads)} />
        <Metric label="Pagados" value={String(d.paidLeads)} />
        <Metric
          label="Tiempo hasta pago"
          value={d.avgHoursToPay !== null ? `${d.avgHoursToPay} h` : "—"}
        />
      </div>

      {/* Conversiones */}
      <h2 className="mt-8 mb-3 text-sm font-medium text-muted">Conversión</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Conv label="Cotizador → Pago" value={d.conversions.quoteToPay} />
        <Conv label="Lead → Producción" value={d.conversions.leadToProduction} />
        <Conv label="Producción → Entrega" value={d.conversions.productionToDelivery} />
      </div>

      {/* Funnel */}
      <h2 className="mt-8 mb-3 text-sm font-medium text-muted">Funnel del cotizador</h2>
      <div className="rounded-2xl border border-line bg-surface/40 p-5">
        {d.funnel.every((f) => f.sessions === 0) ? (
          <p className="py-4 text-center text-sm text-faint">
            Todavía sin datos de funnel. Se van a llenar a medida que entren visitas al cotizador.
          </p>
        ) : (
          <div className="space-y-2.5">
            {d.funnel.map((f) => {
              const max = d.funnel[0].sessions || 1;
              const w = Math.max(2, (f.sessions / max) * 100);
              return (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-muted">{f.label}</span>
                  <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-white/[0.04]">
                    <div
                      className="flex h-full items-center rounded-lg bg-gradient-to-r from-brand-cyan/70 to-brand-violet/70 px-2"
                      style={{ width: `${w}%` }}
                    >
                      <span className="text-xs font-medium tabular-nums text-ink">{f.sessions}</span>
                    </div>
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs tabular-nums text-faint">
                    {f.conversion}%
                  </span>
                  <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-red-300/70">
                    {f.dropoff > 0 ? `-${f.dropoff}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leads + breakdowns */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Leads">
          <Bar label="🔥 Calientes" value={d.hot} max={d.hot + d.cold} color="from-orange-400 to-red-400" />
          <Bar label="❄ Fríos" value={d.cold} max={d.hot + d.cold} color="from-sky-400 to-blue-400" />
        </Panel>

        <Panel title="Revenue por proyecto">
          {d.revenueBreakdown.length === 0 ? (
            <Empty />
          ) : (
            d.revenueBreakdown.map((r) => (
              <Bar
                key={r.name}
                label={r.name}
                value={r.amount}
                max={d.revenueBreakdown[0].amount}
                display={formatARS(r.amount)}
              />
            ))
          )}
        </Panel>

        <Panel title="Servicios más vendidos">
          {d.topServices.length === 0 ? (
            <Empty />
          ) : (
            d.topServices.map((s) => (
              <Bar key={s.name} label={s.name} value={s.count} max={d.topServices[0].count} display={String(s.count)} />
            ))
          )}
        </Panel>

        <Panel title="Microservicios más vendidos">
          {d.topMicroservices.length === 0 ? (
            <Empty />
          ) : (
            d.topMicroservices.map((s) => (
              <Bar key={s.name} label={s.name} value={s.count} max={d.topMicroservices[0].count} display={String(s.count)} />
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/40 p-4">
      <p className="text-xs text-faint">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold tabular-nums ${accent ? "text-gradient" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Conv({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/40 p-4">
      <p className="text-xs text-faint">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold tabular-nums text-gradient">{value}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/40 p-5">
      <p className="mb-4 text-sm font-medium text-muted">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  display,
  color = "from-brand-cyan to-brand-violet",
}: {
  label: string;
  value: number;
  max: number;
  display?: string;
  color?: string;
}) {
  const w = max > 0 ? Math.max(3, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 truncate text-xs text-muted" title={label}>
        {label}
      </span>
      <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-white/[0.04]">
        <div className={`h-full rounded-lg bg-gradient-to-r ${color}`} style={{ width: `${w}%` }} />
      </div>
      <span className="w-20 shrink-0 text-right text-xs tabular-nums text-faint">
        {display ?? value}
      </span>
    </div>
  );
}

function Empty() {
  return <p className="py-2 text-center text-xs text-faint">Sin datos todavía.</p>;
}
