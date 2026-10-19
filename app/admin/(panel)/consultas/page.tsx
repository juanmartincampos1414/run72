"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Status = "nuevo" | "revisando" | "contactado" | "cerrado";
type Priority = "alta" | "media" | "baja" | "spam";

type InquirySummary = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  interest: string;
  budget: string | null;
  timeline: string | null;
  status: Status;
  priority: Priority | null;
  source: string | null;
  channel: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
  notified_at: string | null;
};

type InquiryDetail = InquirySummary & {
  problem: string;
  systems: string | null;
  entry_path: string | null;
  landing_page: string | null;
  referrer: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
  source_path: string | null;
  privacy_version: string | null;
  privacy_accepted_at: string | null;
  consent_marketing_at: string | null;
  notes: string | null;
  last_contact_at: string | null;
};

const STATUS: { value: Status; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "revisando", label: "Revisando" },
  { value: "contactado", label: "Contactado" },
  { value: "cerrado", label: "Cerrado" },
];

const PRIORITY: { value: Priority; label: string }[] = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
  { value: "spam", label: "Spam" },
];

const STATUS_COLOR: Record<Status, string> = {
  nuevo: "text-brand-cyan",
  revisando: "text-amber-300",
  contactado: "text-violet-300",
  cerrado: "text-muted",
};

const PRIORITY_COLOR: Record<Priority, string> = {
  alta: "text-red-300",
  media: "text-amber-300",
  baja: "text-muted",
  spam: "text-faint",
};

const INTEREST_LABEL: Record<string, string> = {
  software: "Software a medida",
  agentes: "Agentes de IA",
  automatizacion: "Automatización",
  orientacion: "Orientación",
};

const BUDGET_LABEL: Record<string, string> = {
  unsure: "A dimensionar",
  "3000_7500": "USD 3k–7,5k",
  "7500_15000": "USD 7,5k–15k",
  "15000_30000": "USD 15k–30k",
  over_30000: "USD 30k+",
};

const TIMELINE_LABEL: Record<string, string> = {
  asap: "Lo antes posible",
  month: "Este mes",
  "1_3m": "En 1–3 meses",
  later: "Más adelante",
  exploring: "Explorando",
};

const CHANNEL_LABEL: Record<string, string> = {
  google_ads: "Google Ads",
  google: "Google (orgánico)",
  meta_ads: "Meta Ads",
  linkedin: "LinkedIn",
  paid: "Pago",
  referral: "Referral",
  direct: "Directo",
  organic: "Orgánico",
};

const SOURCE_LABEL: Record<string, string> = {
  contact: "Contacto",
  quote: "Cotizador",
  runit: "Runit",
  runit_scan: "Runit Scan",
  express: "Express",
  direct_email: "Email directo",
  manual: "Manual",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
}

export default function ConsultasPage() {
  const [items, setItems] = useState<InquirySummary[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [priorityFilter, setPriorityFilter] = useState<"" | Priority>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const qs = new URLSearchParams();
    if (statusFilter) qs.set("status", statusFilter);
    if (priorityFilter) qs.set("priority", priorityFilter);
    const r = await fetch(`/api/admin/inquiries${qs.toString() ? `?${qs}` : ""}`);
    if (!r.ok) {
      setError("No se pudieron cargar las consultas.");
      setItems([]);
      return;
    }
    setItems((await r.json()).inquiries);
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function loadDetail(id: string) {
    setDetailLoading(true);
    setNotice(null);
    const r = await fetch(`/api/admin/inquiries/${id}`);
    setDetailLoading(false);
    if (!r.ok) {
      setDetail(null);
      setNotice("No se pudo cargar el detalle.");
      return;
    }
    const d: InquiryDetail = (await r.json()).inquiry;
    setDetail(d);
    setNotesDraft(d.notes ?? "");
  }

  function select(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
      return;
    }
    setSelectedId(id);
    setDetail(null);
    loadDetail(id);
  }

  async function patch(id: string, payload: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setNotice(null);
    const r = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!r.ok) {
      setNotice((await r.json().catch(() => ({}))).error ?? "No se pudo actualizar.");
      return false;
    }
    setNotice(okMsg);
    return true;
  }

  async function changeStatus(id: string, status: Status) {
    if (await patch(id, { status }, "Estado actualizado.")) {
      setDetail((d) => (d && d.id === id ? { ...d, status } : d));
      setItems((prev) => (prev ? prev.map((i) => (i.id === id ? { ...i, status } : i)) : prev));
    }
  }

  async function changePriority(id: string, priority: Priority) {
    if (await patch(id, { priority }, "Prioridad actualizada.")) {
      setDetail((d) => (d && d.id === id ? { ...d, priority } : d));
      setItems((prev) => (prev ? prev.map((i) => (i.id === id ? { ...i, priority } : i)) : prev));
    }
  }

  async function saveNotes(id: string) {
    if (await patch(id, { notes: notesDraft }, "Notas guardadas.")) {
      setDetail((d) => (d && d.id === id ? { ...d, notes: notesDraft } : d));
    }
  }

  async function resend(id: string) {
    setBusy(true);
    setNotice(null);
    const r = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend" }),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setNotice(data.error ?? "No se pudo reenviar el aviso.");
      return;
    }
    const notifiedAt: string = data.notified_at ?? new Date().toISOString();
    setDetail((d) => (d && d.id === id ? { ...d, notified_at: notifiedAt } : d));
    setItems((prev) => (prev ? prev.map((i) => (i.id === id ? { ...i, notified_at: notifiedAt } : i)) : prev));
    setNotice(data.warning ?? "Aviso reenviado.");
  }

  const csvHref = useMemo(() => {
    if (!items || items.length === 0) return null;
    const cols = ["created_at", "name", "email", "phone", "company", "interest", "budget", "timeline", "priority", "status", "source", "channel", "utm_source", "utm_campaign"];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [cols.join(",")].concat(
      items.map((i) => cols.map((c) => esc((i as unknown as Record<string, unknown>)[c])).join(",")),
    );
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [items]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Consultas / Leads</h1>
          <p className="mt-1 text-sm text-muted">
            Leads a medida recibidos desde el formulario de contacto de RUN, con atribución y prioridad.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as "" | Priority);
              setSelectedId(null);
              setDetail(null);
            }}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-blue/60"
            aria-label="Filtrar por prioridad"
          >
            <option value="">Toda prioridad</option>
            {PRIORITY.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "" | Status);
              setSelectedId(null);
              setDetail(null);
            }}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-blue/60"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {csvHref && (
            <a
              href={csvHref}
              download={`run-leads-${new Date().toISOString().slice(0, 10)}.csv`}
              className="h-10 rounded-xl border border-line bg-surface px-4 text-sm leading-10 hover:bg-white/[0.04]"
            >
              Exportar CSV
            </a>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface/40">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-faint">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Interés</th>
              <th className="px-4 py-3 font-medium">Canal</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Aviso</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr><td colSpan={7} className="px-4 py-6 text-faint">Cargando…</td></tr>
            )}
            {items?.length === 0 && !error && (
              <tr><td colSpan={7} className="px-4 py-6 text-faint">Todavía no hay consultas.</td></tr>
            )}
            {items?.map((i) => (
              <tr
                key={i.id}
                onClick={() => select(i.id)}
                className={`cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.03] ${selectedId === i.id ? "bg-white/[0.05]" : ""}`}
              >
                <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtDate(i.created_at)}</td>
                <td className="px-4 py-3">
                  <span className="font-medium">{i.name}</span>
                  {i.company && <span className="block text-xs text-faint">{i.company}</span>}
                </td>
                <td className="px-4 py-3 text-muted">{INTEREST_LABEL[i.interest] ?? i.interest}</td>
                <td className="px-4 py-3 text-muted">{i.channel ? (CHANNEL_LABEL[i.channel] ?? i.channel) : "—"}</td>
                <td className={`px-4 py-3 ${i.priority ? PRIORITY_COLOR[i.priority] : "text-muted"}`}>
                  {i.priority ? (PRIORITY.find((p) => p.value === i.priority)?.label ?? i.priority) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={i.notified_at ? "text-emerald-400" : "text-amber-300"}>
                    {i.notified_at ? "Enviado" : "Pendiente"}
                  </span>
                </td>
                <td className={`px-4 py-3 ${STATUS_COLOR[i.status] ?? "text-muted"}`}>
                  {STATUS.find((s) => s.value === i.status)?.label ?? i.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <section className="mt-6 rounded-2xl border border-line bg-surface/40 p-5">
          {detailLoading && <p className="text-sm text-faint">Cargando detalle…</p>}
          {!detailLoading && detail && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">{detail.name}</h2>
                  <a href={`mailto:${detail.email}`} className="text-sm text-brand-cyan hover:underline">
                    {detail.email}
                  </a>
                  {detail.phone && (
                    <p className="text-sm text-muted">
                      {detail.phone} ·{" "}
                      <a href={waLink(detail.phone)} target="_blank" rel="noopener" className="text-emerald-400 hover:underline">
                        WhatsApp
                      </a>
                    </p>
                  )}
                  {detail.company && <p className="text-sm text-muted">{detail.company}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Prioridad
                    <select
                      value={detail.priority ?? "media"}
                      disabled={busy}
                      onChange={(e) => changePriority(detail.id, e.target.value as Priority)}
                      className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-fg outline-none focus:border-brand-blue/60"
                    >
                      {PRIORITY.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Estado
                    <select
                      value={detail.status}
                      disabled={busy}
                      onChange={(e) => changeStatus(detail.id, e.target.value as Status)}
                      className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-fg outline-none focus:border-brand-blue/60"
                    >
                      {STATUS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() => resend(detail.id)}
                    disabled={busy}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
                  >
                    Reenviar aviso
                  </button>
                </div>
              </div>

              {notice && <p className="text-sm text-muted">{notice}</p>}

              <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Interés" value={INTEREST_LABEL[detail.interest] ?? detail.interest} />
                <Field label="Inversión estimada" value={detail.budget ? (BUDGET_LABEL[detail.budget] ?? detail.budget) : "—"} />
                <Field label="Plazo" value={detail.timeline ? (TIMELINE_LABEL[detail.timeline] ?? detail.timeline) : "—"} />
                <Field label="Origen" value={detail.source ? (SOURCE_LABEL[detail.source] ?? detail.source) : "—"} />
                <Field label="Canal" value={detail.channel ? (CHANNEL_LABEL[detail.channel] ?? detail.channel) : "—"} />
                <Field label="Herramientas" value={detail.systems || "—"} />
                <Field label="Landing" value={detail.landing_page || detail.source_path || "—"} />
                <Field label="Entry path" value={detail.entry_path || "—"} />
                <Field label="Referrer" value={detail.referrer || "—"} />
                <Field label="utm_source" value={detail.utm_source || "—"} />
                <Field label="utm_medium" value={detail.utm_medium || "—"} />
                <Field label="utm_campaign" value={detail.utm_campaign || "—"} />
                <Field label="utm_content" value={detail.utm_content || "—"} />
                <Field label="utm_term" value={detail.utm_term || "—"} />
                <Field label="Recibida" value={fmtDate(detail.created_at)} />
                <Field label="Aviso por email" value={detail.notified_at ? `Enviado · ${fmtDate(detail.notified_at)}` : "Pendiente"} />
                <Field label="Último contacto" value={fmtDate(detail.last_contact_at)} />
                <Field
                  label="Privacidad aceptada"
                  value={`${fmtDate(detail.privacy_accepted_at)}${detail.privacy_version ? ` · v${detail.privacy_version}` : ""}`}
                />
                <Field label="Consentimiento marketing" value={detail.consent_marketing_at ? fmtDate(detail.consent_marketing_at) : "No"} />
              </dl>

              <div>
                <p className="text-xs text-muted">Proceso y resultado esperado</p>
                <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed">
                  {detail.problem}
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="text-xs text-muted">Notas internas</label>
                <textarea
                  id="notes"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={3}
                  maxLength={4000}
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand-blue/60"
                  placeholder="Seguimiento, próxima acción, contexto…"
                />
                <button
                  onClick={() => saveNotes(detail.id)}
                  disabled={busy || notesDraft === (detail.notes ?? "")}
                  className="mt-2 rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40"
                >
                  Guardar notas
                </button>
              </div>
            </div>
          )}
          {!detailLoading && !detail && notice && <p className="text-sm text-red-300">{notice}</p>}
        </section>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 break-words">{value}</dd>
    </div>
  );
}
