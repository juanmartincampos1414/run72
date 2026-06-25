"use client";

import { useEffect, useState } from "react";

type Partner = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  contact: string | null;
  website: string | null;
  whatsapp: string | null;
  notes: string | null;
  active: boolean;
  sort_order: number;
};

const EMPTY = { category: "", name: "", description: "", contact: "", website: "", whatsapp: "", notes: "" };

export default function AdminHubPartnersPage() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/hub/partners");
    if (r.ok) setPartners((await r.json()).partners);
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    setError(null);
    const r = await fetch("/api/admin/hub/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error ?? "Error al crear.");
      return;
    }
    setDraft({ ...EMPTY });
    setCreating(false);
    load();
  }

  async function patch(id: string, p: Partial<Partner>) {
    setPartners((prev) => (prev ? prev.map((x) => (x.id === id ? { ...x, ...p } : x)) : prev));
    await fetch(`/api/admin/hub/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este partner?")) return;
    setPartners((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
    await fetch(`/api/admin/hub/partners/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Hub — Partners</h1>
          <p className="mt-1 text-sm text-muted">Proveedores recomendados que ven los clientes del Hub.</p>
        </div>
        <button onClick={() => setCreating((v) => !v)} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink">
          {creating ? "Cancelar" : "+ Nuevo"}
        </button>
      </div>

      {creating && (
        <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-surface/40 p-5 sm:grid-cols-2">
          <F label="Categoría" v={draft.category} on={(v) => setDraft({ ...draft, category: v })} ph="Ej: Contadores" />
          <F label="Nombre" v={draft.name} on={(v) => setDraft({ ...draft, name: v })} />
          <F label="Descripción" v={draft.description} on={(v) => setDraft({ ...draft, description: v })} />
          <F label="Contacto" v={draft.contact} on={(v) => setDraft({ ...draft, contact: v })} />
          <F label="Sitio web" v={draft.website} on={(v) => setDraft({ ...draft, website: v })} />
          <F label="WhatsApp" v={draft.whatsapp} on={(v) => setDraft({ ...draft, whatsapp: v })} />
          <F label="Observaciones" v={draft.notes} on={(v) => setDraft({ ...draft, notes: v })} />
          {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button onClick={create} className="rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-2 text-sm font-semibold text-ink">
              Crear partner
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2.5">
        {partners === null && <p className="text-sm text-faint">Cargando…</p>}
        {partners?.length === 0 && <p className="text-sm text-faint">Todavía no hay partners.</p>}
        {partners?.map((p) => (
          <div key={p.id} className="grid items-center gap-3 rounded-2xl border border-line bg-surface/40 p-4 md:grid-cols-[auto_1.4fr_auto_auto]">
            <input
              value={p.category}
              onChange={(e) => patch(p.id, { category: e.target.value })}
              className="w-32 rounded-lg border border-line bg-surface px-2 py-1.5 text-xs outline-none"
            />
            <input
              value={p.name}
              onChange={(e) => patch(p.id, { name: e.target.value })}
              className="w-full bg-transparent text-sm font-medium outline-none"
            />
            <button
              onClick={() => patch(p.id, { active: !p.active })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${p.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.04] text-faint"}`}
            >
              {p.active ? "Activo" : "Inactivo"}
            </button>
            <button onClick={() => remove(p.id)} className="text-xs text-faint hover:text-red-300">
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function F({ label, v, on, ph }: { label: string; v: string; on: (v: string) => void; ph?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      <input
        value={v}
        placeholder={ph}
        onChange={(e) => on(e.target.value)}
        className="h-11 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-blue/60"
      />
    </label>
  );
}
