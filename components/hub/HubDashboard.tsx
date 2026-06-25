"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "../Logo";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import {
  HUB_AREAS,
  STATUS_ORDER,
  STATUS_LABEL,
  LEVEL_META,
  areaProgress,
  overallScore,
  levelOf,
  type HubStatus,
} from "@/lib/hub";

const ease = [0.16, 1, 0.3, 1] as const;

type Profile = { company_name: string | null; subscription_status: string } | null;

export function HubDashboard() {
  const [statuses, setStatuses] = useState<Record<string, HubStatus>>({});
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [openArea, setOpenArea] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hub/checklist")
      .then((r) => r.json())
      .then((d) => {
        setStatuses(d.statuses ?? {});
        setProfile(d.profile ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const score = useMemo(() => overallScore(statuses), [statuses]);
  const scoreLevel = levelOf(score);

  function setItem(itemKey: string, status: HubStatus) {
    setStatuses((s) => ({ ...s, [itemKey]: status }));
    fetch("/api/hub/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemKey, status }),
    }).catch(() => {});
  }

  async function logout() {
    await createSupabaseBrowser().auth.signOut();
    window.location.href = "/hub/login";
  }

  if (loading) {
    return (
      <Shell onLogout={logout} company={null}>
        <div className="py-20 text-center text-sm text-faint">Cargando tu panel…</div>
      </Shell>
    );
  }

  if (profile && profile.subscription_status !== "active") {
    return (
      <Shell onLogout={logout} company={profile.company_name}>
        <Suspended status={profile.subscription_status} />
      </Shell>
    );
  }

  return (
    <Shell onLogout={logout} company={profile?.company_name ?? null}>
      {/* Hero: score general */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="glass rounded-3xl p-6 sm:p-8"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted">Estado general de tu negocio</p>
            <div className="mt-1 flex items-end gap-3">
              <span className="font-display text-5xl font-semibold tabular-nums text-gradient sm:text-6xl">
                {score}
              </span>
              <span className="mb-1.5 text-lg text-muted">/100</span>
            </div>
            <p className={`mt-1 text-sm font-medium ${LEVEL_META[scoreLevel].text}`}>
              {LEVEL_META[scoreLevel].dot} {LEVEL_META[scoreLevel].label}
            </p>
          </div>
          <div className="w-full max-w-xs">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${LEVEL_META[scoreLevel].bar}`}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.6, ease }}
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-faint">
              Entrá una vez por semana y resolvé lo que esté en rojo o amarillo. Todo lo
              importante de tu negocio, en un solo lugar.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Áreas */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HUB_AREAS.map((a) => {
          const p = areaProgress(a, statuses);
          const open = openArea === a.key;
          return (
            <div
              key={a.key}
              className={`rounded-3xl border bg-surface/40 transition-colors ${open ? "border-line-strong sm:col-span-2 lg:col-span-3" : "border-line hover:border-line-strong"}`}
            >
              <button
                type="button"
                onClick={() => setOpenArea(open ? null : a.key)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-xl">
                  {a.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium tracking-tight">{a.label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${LEVEL_META[p.level].text}`}>
                      {p.pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${LEVEL_META[p.level].bar}`}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-faint">
                    {LEVEL_META[p.level].dot} {p.done}/{p.applicable} completados
                    {p.pendientes > 0 ? ` · ${p.pendientes} pendientes` : ""}
                  </p>
                </div>
              </button>

              {open && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-line px-5 pb-5 pt-4"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    {a.items.map((item) => {
                      const st = statuses[item.key] ?? "pendiente";
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink/40 px-3 py-2"
                        >
                          <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
                          <select
                            value={st}
                            onChange={(e) => setItem(item.key, e.target.value as HubStatus)}
                            className={`shrink-0 rounded-lg border border-line bg-surface px-2 py-1 text-xs outline-none ${stColor(st)}`}
                          >
                            {STATUS_ORDER.map((s) => (
                              <option key={s} value={s} className="bg-ink text-fg">
                                {STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function stColor(st: HubStatus): string {
  if (st === "completado") return "text-emerald-300";
  if (st === "en_proceso") return "text-amber-300";
  if (st === "no_aplica") return "text-faint";
  return "text-muted";
}

function Suspended({ status }: { status: string }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-amber-500/30 bg-amber-500/[0.06] p-8 text-center">
      <p className="text-3xl">🔒</p>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
        Tu acceso está {status === "cancelled" ? "cancelado" : "suspendido"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Tus datos están guardados y a salvo. Para volver a entrar, regularizá tu suscripción
        mensual. Cualquier duda, escribinos a{" "}
        <a href="mailto:hola@run72.app" className="text-brand-cyan hover:underline">hola@run72.app</a>.
      </p>
    </div>
  );
}

function Shell({
  children,
  onLogout,
  company,
}: {
  children: React.ReactNode;
  onLogout: () => void;
  company: string | null;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="RUN72 — inicio">
              <Logo />
            </Link>
            <span className="hidden text-sm text-faint sm:inline">· Business Hub</span>
          </div>
          <div className="flex items-center gap-4">
            {company && <span className="hidden text-sm text-muted sm:inline">{company}</span>}
            <button onClick={onLogout} className="text-sm text-muted transition-colors hover:text-fg">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="container-x py-8 md:py-10">{children}</main>
    </div>
  );
}
