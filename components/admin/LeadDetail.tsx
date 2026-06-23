"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatARS } from "@/lib/pricing";
import {
  ANTICIPO_LABEL,
  anticipoState,
  saldoState,
} from "@/lib/sla";
import { SlaBar } from "./SlaBar";
import type { Lead, ProjectPreview } from "@/lib/types";

type Version = {
  id: string;
  prompt: string | null;
  response: string | null;
  preview: ProjectPreview | null;
  files_context: Array<{ name: string; url: string }> | null;
  form_snapshot: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
};
type AuditEvent = { event_type: string; metadata: Record<string, unknown>; created_at: string };

const EVENT_LABEL: Record<string, string> = {
  lead_created: "Lead creado",
  checkout_started: "Checkout iniciado",
  payment_initiated: "Pago iniciado",
  payment_completed: "Anticipo pagado",
  comprobante_uploaded: "Comprobante cargado",
  comprobante_approved: "Comprobante aprobado",
  comprobante_rejected: "Comprobante rechazado",
  scope_rejected: "Rechazado por alcance",
  preview_generated: "Preview generado",
  preview_regenerated: "Preview regenerado",
  production_started: "Proyecto iniciado",
  status_changed: "Cambio de estado",
};

export function LeadDetail({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [obs, setObs] = useState("");
  const [busy, setBusy] = useState(false);
  const [openVersion, setOpenVersion] = useState<string | null>(null);

  async function load() {
    const r = await fetch(`/api/admin/leads/${leadId}`);
    if (r.ok) {
      const d = await r.json();
      setLead(d.lead);
      setVersions(d.versions ?? []);
      setEvents(d.events ?? []);
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, [leadId]);

  async function action(action: string) {
    setBusy(true);
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, observaciones: obs }),
    });
    setObs("");
    await load();
    setBusy(false);
  }

  async function regenerate() {
    if (!confirm("¿Regenerar el preview? Se guarda como una versión nueva (no borra las anteriores).")) return;
    setBusy(true);
    await fetch(`/api/admin/leads/${leadId}/regenerate`, { method: "POST" });
    await load();
    setBusy(false);
  }

  if (loading) return <p className="text-sm text-faint">Cargando…</p>;
  if (!lead) return <p className="text-sm text-red-300">Lead no encontrado.</p>;

  const latest = versions[0]?.preview ?? null;

  return (
    <div className="max-w-4xl">
      <Link href="/admin" className="text-sm text-muted hover:text-fg">
        ← Volver a Leads
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <p className="text-sm text-muted">
            {lead.email}
            {lead.whatsapp ? ` · ${lead.whatsapp}` : ""}
            {lead.company ? ` · ${lead.company}` : ""}
          </p>
          <p className="mt-1 text-sm text-fg">{lead.project_label ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-semibold tabular-nums">{formatARS(lead.total_ars)}</p>
          <p className="text-xs text-muted">Adelanto {formatARS(lead.deposit_ars)}</p>
        </div>
      </div>

      {/* SLA */}
      {lead.production_started_at && lead.status === "en_produccion" && (
        <div className="mt-4 rounded-2xl border border-line bg-surface/40 p-4">
          <p className="mb-2 text-xs text-faint">SLA 72 horas</p>
          <SlaBar startedAt={lead.production_started_at} deadlineAt={lead.estimated_delivery_at} />
        </div>
      )}

      {/* Pago + comprobante */}
      <Section title="Pago">
        <div className="flex flex-wrap gap-2">
          <Badge {...ANTICIPO_LABEL[anticipoState(lead)]} />
          <Badge {...saldoState(lead)} />
        </div>
        {lead.payment_status === "approved" && (
          <p className="mt-3 text-xs text-emerald-400">
            ✅ Pago MercadoPago confirmado{lead.payment_id ? ` · #${lead.payment_id}` : ""}
            {lead.production_started_at ? ` · ${fmt(lead.production_started_at)}` : ""} · {formatARS(lead.deposit_ars)}
          </p>
        )}

        {lead.comprobante_url ? (
          <div className="mt-4 rounded-2xl border border-line bg-ink/40 p-4">
            <p className="mb-2 text-sm font-medium">📎 Comprobante de transferencia</p>
            <p className="text-xs text-faint">
              {lead.comprobante_name} · {lead.comprobante_uploaded_at ? fmt(lead.comprobante_uploaded_at) : ""}
              {lead.comprobante_status ? ` · estado: ${lead.comprobante_status}` : ""}
            </p>
            {/\.(png|jpe?g|webp|gif)$/i.test(lead.comprobante_name ?? "") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lead.comprobante_url} alt="Comprobante" className="mt-3 max-h-80 rounded-xl border border-line" />
            ) : (
              <a href={lead.comprobante_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-brand-cyan hover:underline">
                Abrir comprobante (PDF) →
              </a>
            )}

            {lead.comprobante_status === "recibido" && (
              <div className="mt-4">
                <textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  rows={2}
                  placeholder="Observaciones (opcional)"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-blue/60"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => action("approve_payment")}
                    disabled={busy}
                    className="rounded-full bg-emerald-500/15 px-4 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
                  >
                    Aprobar pago
                  </button>
                  <button
                    onClick={() => action("reject_payment")}
                    disabled={busy}
                    className="rounded-full bg-red-500/15 px-4 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            )}
            {lead.comprobante_observaciones && (
              <p className="mt-3 text-xs text-faint">Obs: {lead.comprobante_observaciones}</p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-faint">Sin comprobante adjunto.</p>
        )}
      </Section>

      {/* Preview IA */}
      <Section title="Preview IA">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {versions.length > 0
              ? `${versions.length} versión(es) · última: ${fmt(versions[0].created_at)} por ${versions[0].created_by ?? "—"}`
              : "Todavía no se generó (se genera tras el pago)."}
          </p>
          <button
            onClick={regenerate}
            disabled={busy}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-ink disabled:opacity-50"
          >
            {busy ? "Generando…" : "Regenerar Preview"}
          </button>
        </div>

        {latest && (
          <>
            <p className="mt-4 text-sm leading-relaxed text-muted">{latest.interpretation}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {latest.mockups.map((m, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-line bg-white">
                  <iframe title={m.title} sandbox="" srcDoc={m.html} className="h-72 w-full" loading="lazy" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Historial */}
        {versions.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-faint">Historial</p>
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="rounded-xl border border-line bg-ink/40">
                  <button
                    onClick={() => setOpenVersion(openVersion === v.id ? null : v.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs"
                  >
                    <span>
                      {fmt(v.created_at)} · {v.created_by ?? "—"} · {v.preview?.mockups.length ?? 0} mockups
                    </span>
                    <span className="text-muted">{openVersion === v.id ? "−" : "+"}</span>
                  </button>
                  {openVersion === v.id && (
                    <div className="border-t border-line px-4 py-3 text-xs text-muted">
                      <p className="mb-2">{v.response}</p>
                      <details>
                        <summary className="cursor-pointer text-faint">Ver prompt utilizado</summary>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-[11px] text-faint">{v.prompt}</pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Auditoría */}
      <Section title="Auditoría">
        {events.length === 0 ? (
          <p className="text-xs text-faint">Sin eventos registrados.</p>
        ) : (
          <ol className="relative space-y-3 border-l border-line pl-5">
            {events.map((e, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[23px] top-1 h-2 w-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet" />
                <p className="text-sm">{EVENT_LABEL[e.event_type] ?? e.event_type}</p>
                <p className="text-[11px] text-faint">
                  {fmt(e.created_at)}
                  {e.metadata?.actor ? ` · ${String(e.metadata.actor)}` : ""}
                  {e.metadata?.observaciones ? ` · ${String(e.metadata.observaciones)}` : ""}
                  {e.metadata?.status ? ` · ${String(e.metadata.status)}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-3xl border border-line bg-surface/40 p-5 sm:p-6">
      <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{label}</span>;
}
