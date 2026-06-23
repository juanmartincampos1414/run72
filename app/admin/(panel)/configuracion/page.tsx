"use client";

import { useEffect, useState } from "react";

type Config = {
  bank_cbu: string | null;
  bank_alias: string | null;
  bank_holder: string | null;
  mp_access_token: string | null;
  mp_public_key: string | null;
  deposit_percent: number;
};

export default function ConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => setConfig(d.config));
  }, []);

  async function save() {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!config) return <p className="text-sm text-faint">Cargando…</p>;

  const set = (patch: Partial<Config>) => setConfig({ ...config, ...patch });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Configuración
      </h1>
      <p className="mt-1 text-sm text-muted">
        Datos bancarios, credenciales de MercadoPago y parámetros del sistema.
      </p>

      <Section title="Datos bancarios (transferencia)">
        <Field label="CBU / CVU">
          <input
            value={config.bank_cbu ?? ""}
            onChange={(e) => set({ bank_cbu: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Alias">
          <input
            value={config.bank_alias ?? ""}
            onChange={(e) => set({ bank_alias: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Titular">
          <input
            value={config.bank_holder ?? ""}
            onChange={(e) => set({ bank_holder: e.target.value })}
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="MercadoPago">
        <Field label="Access Token (secreto)">
          <input
            type="password"
            value={config.mp_access_token ?? ""}
            onChange={(e) => set({ mp_access_token: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Public Key">
          <input
            value={config.mp_public_key ?? ""}
            onChange={(e) => set({ mp_public_key: e.target.value })}
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Parámetros">
        <Field label="Adelanto (%)">
          <input
            type="number"
            min={0}
            max={100}
            value={config.deposit_percent}
            onChange={(e) => set({ deposit_percent: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
      </Section>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {saved && <span className="text-sm text-emerald-400">Guardado ✓</span>}
      </div>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-blue/60";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface/40 p-5">
      <h2 className="mb-4 text-sm font-medium text-fg">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
