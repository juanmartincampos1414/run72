"use client";

import { useEffect, useState } from "react";
import { formatARS } from "@/lib/pricing";
import type { Service } from "@/lib/types";

type Draft = {
  slug: string;
  name: string;
  category: string;
  description: string;
  price_ars: number;
  type: "project" | "addon";
  sort_order: number;
};

const EMPTY: Draft = {
  slug: "",
  name: "",
  category: "General",
  description: "",
  price_ars: 0,
  type: "addon",
  sort_order: 0,
};

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/services");
    if (r.ok) setServices((await r.json()).services);
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    setError(null);
    const r = await fetch("/api/admin/services", {
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

  async function patch(id: string, patch: Partial<Service>) {
    setServices((prev) =>
      prev ? prev.map((s) => (s.id === id ? { ...s, ...patch } : s)) : prev,
    );
    await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este servicio?")) return;
    setServices((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Servicios
          </h1>
          <p className="mt-1 text-sm text-muted">
            Precios y catálogo del cotizador. Los cambios impactan al instante.
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
          <Field label="Slug (único)">
            <input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              className={inputCls}
              placeholder="ej: app-mobile"
            />
          </Field>
          <Field label="Nombre">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Categoría">
            <input
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Precio ARS">
            <input
              type="number"
              value={draft.price_ars}
              onChange={(e) => setDraft({ ...draft, price_ars: Number(e.target.value) })}
              className={inputCls}
            />
          </Field>
          <Field label="Tipo">
            <select
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: e.target.value as Draft["type"] })
              }
              className={inputCls}
            >
              <option value="project">Proyecto (Paso 1)</option>
              <option value="addon">Adicional (Paso 3)</option>
            </select>
          </Field>
          <Field label="Orden">
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
              className={inputCls}
            />
          </Field>
          <Field label="Descripción" full>
            <input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className={inputCls}
            />
          </Field>
          {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button
              onClick={create}
              className="rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-2 text-sm font-semibold text-ink"
            >
              Crear servicio
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2.5">
        {services === null && <p className="text-sm text-faint">Cargando…</p>}
        {services?.map((s) => (
          <div
            key={s.id}
            className="grid items-center gap-3 rounded-2xl border border-line bg-surface/40 p-4 md:grid-cols-[1.6fr_1fr_auto_auto_auto]"
          >
            <div>
              <input
                value={s.name}
                onChange={(e) => patch(s.id, { name: e.target.value })}
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
              <div className="text-xs text-faint">
                {s.slug} · {s.type === "project" ? "Proyecto" : "Adicional"}
              </div>
            </div>

            <input
              value={s.category}
              onChange={(e) => patch(s.id, { category: e.target.value })}
              className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs outline-none"
            />

            <div className="flex items-center gap-1">
              <span className="text-xs text-faint">$</span>
              <input
                type="number"
                value={s.price_ars}
                onChange={(e) => patch(s.id, { price_ars: Number(e.target.value) })}
                className="w-28 rounded-lg border border-line bg-surface px-3 py-1.5 text-right text-xs tabular-nums outline-none"
              />
            </div>

            <button
              onClick={() => patch(s.id, { active: !s.active })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                s.active
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-white/[0.04] text-faint"
              }`}
            >
              {s.active ? "Activo" : "Inactivo"}
            </button>

            <button
              onClick={() => remove(s.id)}
              className="text-xs text-faint transition-colors hover:text-red-300"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-faint">
        Tip: el precio se guarda solo al editarlo. Ejemplo actual del catálogo:{" "}
        {services?.[0] ? formatARS(services[0].price_ars) : "—"}.
      </p>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-blue/60";

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
