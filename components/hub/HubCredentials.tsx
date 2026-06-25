"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HubShell } from "./HubShell";

type Cred = {
  id: string;
  service_name: string;
  username: string | null;
  email: string | null;
  url: string | null;
  hasPassword: boolean;
  hasNotes: boolean;
};

const empty = { service_name: "", username: "", email: "", url: "", password: "", notes: "" };

export function HubCredentials() {
  const [creds, setCreds] = useState<Cred[]>([]);
  const [vaultReady, setVaultReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ ...empty });
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<{ id: string } | null>(null);
  const [revealed, setRevealed] = useState<Record<string, { password: string; notes: string }>>({});

  async function load() {
    try {
      const d = await (await fetch("/api/hub/credentials")).json();
      setCreds(d.credentials ?? []);
      setVaultReady(d.vaultReady !== false);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    setError(null);
    if (!draft.service_name.trim()) {
      setError("El nombre del servicio es obligatorio.");
      return;
    }
    const res = await fetch("/api/hub/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error ?? "No se pudo guardar.");
      return;
    }
    setDraft({ ...empty });
    setAdding(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta credencial?")) return;
    setCreds((c) => c.filter((x) => x.id !== id));
    setRevealed((r) => {
      const n = { ...r };
      delete n[id];
      return n;
    });
    await fetch(`/api/hub/credentials?id=${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <HubShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Credenciales</h1>
          <p className="mt-1 text-sm text-muted">
            Tu bóveda privada. Las contraseñas se guardan cifradas y pedimos tu clave de cuenta
            para mostrarlas.
          </p>
        </div>
        {vaultReady && (
          <button
            onClick={() => setAdding((v) => !v)}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink"
          >
            {adding ? "Cancelar" : "+ Nueva"}
          </button>
        )}
      </div>

      {!vaultReady && (
        <div className="mt-6 rounded-3xl border border-amber-500/30 bg-amber-500/[0.06] p-6 text-sm text-muted">
          La bóveda todavía no está habilitada. (Falta configurar <code className="text-fg">HUB_VAULT_KEY</code>.)
        </div>
      )}

      {adding && (
        <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-surface/40 p-5 sm:grid-cols-2">
          <Field label="Servicio" v={draft.service_name} on={(v) => setDraft({ ...draft, service_name: v })} ph="Ej: Mercado Pago" />
          <Field label="Usuario" v={draft.username} on={(v) => setDraft({ ...draft, username: v })} />
          <Field label="Email" v={draft.email} on={(v) => setDraft({ ...draft, email: v })} />
          <Field label="URL" v={draft.url} on={(v) => setDraft({ ...draft, url: v })} />
          <Field label="Contraseña" v={draft.password} on={(v) => setDraft({ ...draft, password: v })} type="password" />
          <Field label="Notas" v={draft.notes} on={(v) => setDraft({ ...draft, notes: v })} />
          {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button onClick={create} className="rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-2 text-sm font-semibold text-ink">
              Guardar credencial
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="py-12 text-center text-sm text-faint">Cargando…</p>
        ) : creds.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface/20 py-12 text-center text-sm text-muted">
            Todavía no guardaste credenciales.
          </div>
        ) : (
          <ul className="space-y-2">
            {creds.map((c) => {
              const shown = revealed[c.id];
              return (
                <li key={c.id} className="rounded-2xl border border-line bg-surface/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium tracking-tight">{c.service_name}</p>
                      <p className="text-xs text-faint">
                        {[c.username, c.email].filter(Boolean).join(" · ") || "—"}
                        {c.url ? ` · ${c.url}` : ""}
                      </p>
                    </div>
                    <button onClick={() => remove(c.id)} className="shrink-0 text-xs text-faint hover:text-red-300">
                      Eliminar
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="font-mono text-sm text-fg">
                      {shown ? shown.password || "—" : "••••••••••"}
                    </span>
                    {c.hasPassword &&
                      (shown ? (
                        <button
                          onClick={() => setRevealed((r) => { const n = { ...r }; delete n[c.id]; return n; })}
                          className="text-xs text-muted hover:text-fg"
                        >
                          Ocultar
                        </button>
                      ) : (
                        <button onClick={() => setReveal({ id: c.id })} className="text-xs text-brand-cyan hover:underline">
                          Mostrar
                        </button>
                      ))}
                  </div>
                  {shown?.notes && <p className="mt-2 text-xs text-muted">📝 {shown.notes}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {reveal && (
        <RevealModal
          onClose={() => setReveal(null)}
          onReveal={(data) => {
            setRevealed((r) => ({ ...r, [reveal.id]: data }));
            setReveal(null);
          }}
          id={reveal.id}
        />
      )}
    </HubShell>
  );
}

function RevealModal({
  id,
  onReveal,
  onClose,
}: {
  id: string;
  onReveal: (d: { password: string; notes: string }) => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/hub/credentials/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No se pudo verificar.");
      onReveal({ password: d.password ?? "", notes: d.notes ?? "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-line bg-ink-soft p-6"
      >
        <p className="font-display text-lg font-semibold tracking-tight">Confirmá tu identidad</p>
        <p className="mt-1 text-sm text-muted">Reingresá la contraseña de tu cuenta para ver esta credencial.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Tu contraseña"
          className="mt-4 h-11 w-full rounded-xl border border-line bg-surface/60 px-4 text-sm outline-none focus:border-brand-blue/60"
        />
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !password}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
        >
          {busy ? "Verificando…" : "Ver credencial"}
        </button>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  v,
  on,
  ph,
  type,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  ph?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      <input
        type={type ?? "text"}
        value={v}
        placeholder={ph}
        onChange={(e) => on(e.target.value)}
        className="h-11 rounded-xl border border-line bg-surface/60 px-3 text-sm outline-none focus:border-brand-blue/60"
      />
    </label>
  );
}
