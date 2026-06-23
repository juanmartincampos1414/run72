"use client";

import { useEffect, useState } from "react";
import type { Faq } from "@/lib/types";

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ question: "", answer: "", sort_order: 0 });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/faqs");
    if (r.ok) setFaqs((await r.json()).faqs);
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    setError(null);
    const r = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await r.json();
    if (!r.ok) {
      setError(data.error ?? "Error al crear.");
      return;
    }
    setDraft({ question: "", answer: "", sort_order: 0 });
    setCreating(false);
    load();
  }

  async function patch(id: string, patch: Partial<Faq>) {
    setFaqs((prev) => (prev ? prev.map((f) => (f.id === id ? { ...f, ...patch } : f)) : prev));
    await fetch(`/api/admin/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta FAQ?")) return;
    setFaqs((prev) => (prev ? prev.filter((f) => f.id !== id) : prev));
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
  }

  function reorder(id: string, dir: -1 | 1) {
    const f = faqs?.find((x) => x.id === id);
    if (f) patch(id, { sort_order: f.sort_order + dir });
    setFaqs((prev) =>
      prev ? [...prev].sort((a, b) => a.sort_order - b.sort_order) : prev,
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">FAQs</h1>
          <p className="mt-1 text-sm text-muted">
            Se muestran en la pantalla de pago del cotizador. Ordená con el campo Orden.
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink"
        >
          {creating ? "Cancelar" : "+ Nueva"}
        </button>
      </div>

      {creating && (
        <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-surface/40 p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">Pregunta</span>
            <input
              value={draft.question}
              onChange={(e) => setDraft({ ...draft, question: e.target.value })}
              className={inp}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">Respuesta</span>
            <textarea
              value={draft.answer}
              onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
              rows={3}
              className={`${inp} h-auto py-2`}
            />
          </label>
          <label className="flex w-32 flex-col gap-1.5">
            <span className="text-xs text-muted">Orden</span>
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
              className={inp}
            />
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <div>
            <button
              onClick={create}
              className="rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-2 text-sm font-semibold text-ink"
            >
              Crear FAQ
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {faqs === null && <p className="text-sm text-faint">Cargando…</p>}
        {faqs?.length === 0 && (
          <p className="text-sm text-faint">Todavía no hay FAQs. Corré la migración de Fase D o creá una.</p>
        )}
        {faqs?.map((f) => (
          <div key={f.id} className="rounded-2xl border border-line bg-surface/40 p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <button onClick={() => reorder(f.id, -1)} className="text-xs text-faint hover:text-fg">▲</button>
                <span className="text-[11px] tabular-nums text-faint">{f.sort_order}</span>
                <button onClick={() => reorder(f.id, 1)} className="text-xs text-faint hover:text-fg">▼</button>
              </div>
              <div className="flex-1 space-y-2">
                <input
                  value={f.question}
                  onChange={(e) => patch(f.id, { question: e.target.value })}
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
                <textarea
                  value={f.answer}
                  onChange={(e) => patch(f.id, { answer: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted outline-none focus:border-brand-blue/60"
                />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  onClick={() => patch(f.id, { active: !f.active })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${f.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.04] text-faint"}`}
                >
                  {f.active ? "Activa" : "Inactiva"}
                </button>
                <button onClick={() => remove(f.id)} className="text-xs text-faint hover:text-red-300">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp = "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-blue/60";
