"use client";

import { useCallback, useEffect, useState } from "react";

type Status = "nuevo" | "revisando" | "contactado" | "cerrado";

type InquirySummary = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  interest: string;
  budget: string | null;
  status: Status;
  created_at: string;
  notified_at: string | null;
};

type InquiryDetail = InquirySummary & {
  problem: string;
  systems: string | null;
  source_path: string | null;
  privacy_version: string | null;
  privacy_accepted_at: string | null;
};

const STATUS: { value: Status; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "revisando", label: "Revisando" },
  { value: "contactado", label: "Contactado" },
  { value: "cerrado", label: "Cerrado" },
];

const STATUS_COLOR: Record<Status, string> = {
  nuevo: "text-brand-cyan",
  revisando: "text-amber-300",
  contactado: "text-violet-300",
  cerrado: "text-muted",
};

const INTEREST_LABEL: Record<string, string> = {
  software: "Software a medida",
  agentes: "Agentes de IA",
  automatizacion: "Automatización",
  orientacion: "Orientación",
};

const BUDGET_LABEL: Record<string, string> = {
  unsure: "Sin definir",
  under_3000: "Menos de USD 3.000",
  "3000_10000": "USD 3.000 a 10.000",
  over_10000: "Más de USD 10.000",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default function ConsultasPage() {
  const [items, setItems] = useState<InquirySummary[] | null>(null);
  const [filter, setFilter] = useState<"" | Status>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const qs = filter ? `?status=${filter}` : "";
    const r = await fetch(`/api/admin/inquiries${qs}`);
    if (!r.ok) {
      setError("No se pudieron cargar las consultas.");
      setItems([]);
      return;
    }
    setItems((await r.json()).inquiries);
  }, [filter]);

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
    setDetail((await r.json()).inquiry);
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

  async function changeStatus(id: string, status: Status) {
    setBusy(true);
    setNotice(null);
    const r = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (!r.ok) {
      setNotice((await r.json().catch(() => ({}))).error ?? "No se pudo cambiar el estado.");
      return;
    }
    setDetail((d) => (d && d.id === id ? { ...d, status } : d));
    setItems((prev) => (prev ? prev.map((i) => (i.id === id ? { ...i, status } : i)) : prev));
    setNotice("Estado actualizado.");
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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Consultas</h1>
          <p className="mt-1 text-sm text-muted">
            Consultas a medida recibidas desde el formulario de contacto de RUN.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as "" | Status);
            setSelectedId(null);
            setDetail(null);
          }}
          className="h-10 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-blue/60"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface/40">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-faint">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Interés</th>
              <th className="px-4 py-3 font-medium">Aviso</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-faint">
                  Cargando…
                </td>
              </tr>
            )}
            {items?.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-faint">
                  Todavía no hay consultas.
                </td>
              </tr>
            )}
            {items?.map((i) => (
              <tr
                key={i.id}
                onClick={() => select(i.id)}
                className={`cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.03] ${selectedId === i.id ? "bg-white/[0.05]" : ""}`}
              >
                <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtDate(i.created_at)}</td>
                <td className="px-4 py-3 font-medium">{i.name}</td>
                <td className="px-4 py-3 text-muted">{i.company || "—"}</td>
                <td className="px-4 py-3 text-muted">{INTEREST_LABEL[i.interest] ?? i.interest}</td>
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
                  {detail.company && <p className="text-sm text-muted">{detail.company}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Estado
                    <select
                      value={detail.status}
                      disabled={busy}
                      onChange={(e) => changeStatus(detail.id, e.target.value as Status)}
                      className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-fg outline-none focus:border-brand-blue/60"
                    >
                      {STATUS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
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

              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Field label="Interés" value={INTEREST_LABEL[detail.interest] ?? detail.interest} />
                <Field label="Inversión estimada" value={detail.budget ? (BUDGET_LABEL[detail.budget] ?? detail.budget) : "—"} />
                <Field label="Herramientas actuales" value={detail.systems || "—"} />
                <Field label="Origen" value={detail.source_path || "—"} />
                <Field label="Recibida" value={fmtDate(detail.created_at)} />
                <Field
                  label="Aviso por email"
                  value={detail.notified_at ? `Enviado · ${fmtDate(detail.notified_at)}` : "Pendiente"}
                />
                <Field
                  label="Privacidad aceptada"
                  value={`${fmtDate(detail.privacy_accepted_at)}${detail.privacy_version ? ` · v${detail.privacy_version}` : ""}`}
                />
              </dl>

              <div>
                <p className="text-xs text-muted">Proceso y resultado esperado</p>
                <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed">
                  {detail.problem}
                </p>
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
