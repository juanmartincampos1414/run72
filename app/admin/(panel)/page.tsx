"use client";

import { useEffect, useMemo, useState } from "react";
import { formatARS } from "@/lib/pricing";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUS: { value: LeadStatus; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "adelanto_pagado", label: "Adelanto pagado" },
  { value: "en_produccion", label: "En producción" },
  { value: "entregado", label: "Entregado" },
  { value: "cobrado_completo", label: "Cobrado completo" },
];

const STATUS_COLOR: Record<LeadStatus, string> = {
  nuevo: "text-muted",
  adelanto_pagado: "text-brand-cyan",
  en_produccion: "text-amber-300",
  entregado: "text-violet-300",
  cobrado_completo: "text-emerald-400",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/leads");
    if (!r.ok) {
      setError("No se pudieron cargar los leads.");
      return;
    }
    setLeads((await r.json()).leads);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id: string, status: LeadStatus) {
    setLeads((prev) =>
      prev ? prev.map((l) => (l.id === id ? { ...l, status } : l)) : prev,
    );
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este lead?")) return;
    setLeads((prev) => (prev ? prev.filter((l) => l.id !== id) : prev));
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
  }

  const metrics = useMemo(() => {
    const list = leads ?? [];
    return {
      total: list.length,
      hot: list.filter((l) => l.hot).length,
      paid: list.filter((l) => l.status === "adelanto_pagado").length,
      pipeline: list.reduce((s, l) => s + (l.total_ars || 0), 0),
    };
  }, [leads]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Leads</h1>
      <p className="mt-1 text-sm text-muted">
        Cada finalización del cotizador entra acá automáticamente.
      </p>

      {/* Métricas */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Total leads" value={String(metrics.total)} />
        <Metric label="🔥 Hot leads" value={String(metrics.hot)} />
        <Metric label="Adelantos pagados" value={String(metrics.paid)} />
        <Metric label="Pipeline" value={formatARS(metrics.pipeline)} />
      </div>

      {error && <p className="mt-6 text-sm text-red-300">{error}</p>}

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-faint">
              <Th>Fecha</Th>
              <Th>Contacto</Th>
              <Th>Proyecto</Th>
              <Th>Total</Th>
              <Th>Adelanto</Th>
              <Th>Score</Th>
              <Th>Estado</Th>
              <Th> </Th>
            </tr>
          </thead>
          <tbody>
            {leads === null && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-faint">
                  Cargando…
                </td>
              </tr>
            )}
            {leads?.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-faint">
                  Todavía no hay leads.
                </td>
              </tr>
            )}
            {leads?.map((l) => (
              <tr key={l.id} className="border-b border-line/60 align-top">
                <Td className="whitespace-nowrap text-faint">
                  {new Date(l.created_at).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </Td>
                <Td>
                  <div className="font-medium text-fg">{l.name}</div>
                  {l.company && <div className="text-xs text-faint">{l.company}</div>}
                  <div className="text-xs text-muted">{l.email}</div>
                  {l.whatsapp && (
                    <div className="text-xs text-faint">WhatsApp: {l.whatsapp}</div>
                  )}
                </Td>
                <Td>
                  <div className="text-fg">{l.project_label ?? "—"}</div>
                  {l.addons?.length > 0 && (
                    <div className="mt-0.5 text-xs text-faint">
                      {l.addons.map((a) => a.name).join(", ")}
                    </div>
                  )}
                  {(l.objective || l.timing) && (
                    <div className="mt-0.5 text-xs text-faint">
                      {[l.objective, l.timing].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {l.urgency_note && (
                    <div className="mt-1 max-w-xs truncate text-xs text-faint" title={l.urgency_note}>
                      “{l.urgency_note}”
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                    {typeof l.preview_rating === "number" && (
                      <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-muted">
                        Preview {l.preview_rating}/10
                      </span>
                    )}
                    {l.files?.length > 0 &&
                      l.files.map((f) => (
                        <a
                          key={f.url}
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-white/[0.05] px-1.5 py-0.5 text-brand-cyan hover:underline"
                        >
                          📎 {f.name.length > 16 ? f.name.slice(0, 14) + "…" : f.name}
                        </a>
                      ))}
                  </div>
                  {l.preview_comments && (
                    <div className="mt-1 max-w-xs truncate text-xs text-faint" title={l.preview_comments}>
                      💬 {l.preview_comments}
                    </div>
                  )}
                </Td>
                <Td className="whitespace-nowrap tabular-nums">{formatARS(l.total_ars)}</Td>
                <Td className="whitespace-nowrap tabular-nums text-muted">
                  {formatARS(l.deposit_ars)}
                  {l.payment_status && (
                    <div className="text-[11px] text-emerald-400">{l.payment_status}</div>
                  )}
                </Td>
                <Td>
                  <span className="tabular-nums">{l.score}</span>
                  {l.hot && (
                    <span className="ml-1 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-medium text-orange-300">
                      🔥
                    </span>
                  )}
                </Td>
                <Td>
                  <select
                    value={l.status}
                    onChange={(e) => changeStatus(l.id, e.target.value as LeadStatus)}
                    className={`rounded-lg border border-line bg-surface px-2 py-1.5 text-xs outline-none ${STATUS_COLOR[l.status]}`}
                  >
                    {STATUS.map((s) => (
                      <option key={s.value} value={s.value} className="text-fg">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <button
                    onClick={() => remove(l.id)}
                    className="text-xs text-faint transition-colors hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/40 p-4">
      <p className="text-xs text-faint">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
