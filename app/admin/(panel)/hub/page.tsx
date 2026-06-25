"use client";

import { useEffect, useState } from "react";

type Company = {
  user_id: string;
  company_name: string | null;
  email: string | null;
  subscription_status: string;
  score: number;
  created_at: string;
};

const STATUSES = ["active", "suspended", "cancelled"];
const LABEL: Record<string, string> = { active: "Activa", suspended: "Suspendida", cancelled: "Cancelada" };

export default function AdminHubPage() {
  const [companies, setCompanies] = useState<Company[] | null>(null);

  async function load() {
    const r = await fetch("/api/admin/hub");
    if (r.ok) setCompanies((await r.json()).companies);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(userId: string, subscription_status: string) {
    setCompanies((prev) =>
      prev ? prev.map((c) => (c.user_id === userId ? { ...c, subscription_status } : c)) : prev,
    );
    await fetch("/api/admin/hub", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subscription_status }),
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Business Hub — Empresas</h1>
      <p className="mt-1 text-sm text-muted">Clientes del portal, su score y estado de suscripción.</p>

      <div className="mt-6 space-y-2.5">
        {companies === null && <p className="text-sm text-faint">Cargando…</p>}
        {companies?.length === 0 && <p className="text-sm text-faint">Todavía no hay empresas registradas.</p>}
        {companies?.map((c) => (
          <div
            key={c.user_id}
            className="grid items-center gap-3 rounded-2xl border border-line bg-surface/40 p-4 md:grid-cols-[1.6fr_auto_auto]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{c.company_name || "—"}</p>
              <p className="truncate text-xs text-faint">{c.email}</p>
            </div>
            <div className="text-sm tabular-nums">
              <span className="text-faint">Score </span>
              <span className="font-semibold">{c.score}/100</span>
            </div>
            <select
              value={c.subscription_status}
              onChange={(e) => setStatus(c.user_id, e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-ink text-fg">
                  {LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
