"use client";

import { useEffect, useMemo, useState } from "react";
import type { Microservice } from "@/lib/types";

type Draft = {
  service_slug: string;
  group_name: string;
  slug: string;
  name: string;
  description: string;
  price_ars: number;
  sort_order: number;
};

const EMPTY: Draft = {
  service_slug: "",
  group_name: "General",
  slug: "",
  name: "",
  description: "",
  price_ars: 0,
  sort_order: 0,
};

export default function MicroserviciosPage() {
  const [micros, setMicros] = useState<Microservice[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/microservices");
    if (r.ok) setMicros((await r.json()).microservices);
  }
  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, Microservice[]> = {};
    (micros ?? []).forEach((m) => {
      (g[m.service_slug] ??= []).push(m);
    });
    return g;
  }, [micros]);

  async function create() {
    setError(null);
    const r = await fetch("/api/admin/microservices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await r.json();
    if (!r.ok) {
      setError(data.error ?? "Error al crear.");
      return;
    }
    setDraft(EMPTY);
    setCreating(false);
    load();
  }

  async function patch(id: string, patch: Partial<Microservice>) {
    setMicros((prev) => (prev ? prev.map((m) => (m.id === id ? { ...m, ...patch } : m)) : prev));
    await fetch(`/api/admin/microservices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este microservicio?")) return;
    setMicros((prev) => (prev ? prev.filter((m) => m.id !== id) : prev));
    await fetch(`/api/admin/microservices/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Microservicios</h1>
          <p className="mt-1 text-sm text-muted">
            Subservicios configurables por servicio. Aparecen en el drawer del cotizador.
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink"
        >
          {creating ? "Cancelar" : "+ Nuevo"}
        </button>
      </div>

      {creating && (
        <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-surface/40 p-5 sm:grid-cols-2">
          <Field label="Servicio (slug)">
            <input value={draft.service_slug} onChange={(e) => setDraft({ ...draft, service_slug: e.target.value })} className={inp} placeholder="ej: redes, landing, ecommerce" />
          </Field>
          <Field label="Grupo">
            <input value={draft.group_name} onChange={(e) => setDraft({ ...draft, group_name: e.target.value })} className={inp} />
          </Field>
          <Field label="Slug (único por servicio)">
            <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className={inp} />
          </Field>
          <Field label="Nombre">
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inp} />
          </Field>
          <Field label="Precio ARS">
            <input type="number" value={draft.price_ars} onChange={(e) => setDraft({ ...draft, price_ars: Number(e.target.value) })} className={inp} />
          </Field>
          <Field label="Orden">
            <input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} className={inp} />
          </Field>
          <Field label="Descripción" full>
            <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={inp} />
          </Field>
          {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button onClick={create} className="rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-2 text-sm font-semibold text-ink">
              Crear microservicio
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {micros === null && <p className="text-sm text-faint">Cargando…</p>}
        {micros?.length === 0 && (
          <p className="text-sm text-faint">
            Todavía no hay microservicios. Corré la migración de Fase A o creá uno nuevo.
          </p>
        )}
        {Object.entries(grouped).map(([service, items]) => (
          <div key={service}>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-faint">{service}</p>
            <div className="space-y-2">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="grid items-center gap-3 rounded-2xl border border-line bg-surface/40 p-3 md:grid-cols-[1.4fr_1fr_auto_auto_auto]"
                >
                  <div>
                    <input
                      value={m.name}
                      onChange={(e) => patch(m.id, { name: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium outline-none"
                    />
                    <div className="text-xs text-faint">{m.slug}</div>
                  </div>
                  <input
                    value={m.group_name}
                    onChange={(e) => patch(m.id, { group_name: e.target.value })}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-faint">$</span>
                    <input
                      type="number"
                      value={m.price_ars}
                      onChange={(e) => patch(m.id, { price_ars: Number(e.target.value) })}
                      className="w-24 rounded-lg border border-line bg-surface px-2 py-1.5 text-right text-xs tabular-nums outline-none"
                    />
                  </div>
                  <button
                    onClick={() => patch(m.id, { active: !m.active })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${m.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.04] text-faint"}`}
                  >
                    {m.active ? "Activo" : "Inactivo"}
                  </button>
                  <button onClick={() => remove(m.id)} className="text-xs text-faint hover:text-red-300">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp = "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-blue/60";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
