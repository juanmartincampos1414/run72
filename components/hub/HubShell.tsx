"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "../Logo";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const NAV = [
  { href: "/hub", label: "Resumen" },
  { href: "/hub/documentos", label: "Documentos" },
  { href: "/hub/partners", label: "Partners" },
  { href: "/hub/credenciales", label: "Credenciales" },
];

/**
 * Shell del Hub: header + navegación + gate de suscripción centralizado.
 * Si la suscripción no está activa, muestra la pantalla de suspensión en
 * CUALQUIER página del Hub (no solo en el Resumen).
 */
export function HubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [company, setCompany] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Vuelta de MercadoPago: confirmar la suscripción.
      const preapprovalId = new URLSearchParams(window.location.search).get("preapproval_id");
      if (preapprovalId) {
        await fetch("/api/hub/subscribe", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preapprovalId }),
        }).catch(() => {});
        window.history.replaceState({}, "", window.location.pathname);
      }
      try {
        const d = await (await fetch("/api/hub/me")).json();
        setCompany(d.company_name ?? null);
        setStatus(d.subscription_status ?? "suspended");
      } catch {
        setStatus("suspended");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function logout() {
    await createSupabaseBrowser().auth.signOut();
    window.location.href = "/hub/login";
  }

  const active = status === "active";

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
            <button onClick={logout} className="text-sm text-muted transition-colors hover:text-fg">
              Salir
            </button>
          </div>
        </div>
        <div className="container-x flex gap-1 pb-px">
          {NAV.map((n) => {
            const isActive = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "border-brand-violet font-medium text-fg"
                    : "border-transparent text-muted hover:text-fg"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="container-x py-8 md:py-10">
        {loading ? (
          <div className="py-20 text-center text-sm text-faint">Cargando…</div>
        ) : active ? (
          children
        ) : (
          <Suspended status={status ?? "suspended"} />
        )}
      </main>
    </div>
  );
}

function Suspended({ status }: { status: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/hub/subscribe", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.init_point) throw new Error(data.error ?? "No se pudo iniciar la suscripción.");
      window.location.href = data.init_point;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-amber-500/30 bg-amber-500/[0.06] p-8 text-center">
      <p className="text-3xl">🔒</p>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
        Tu acceso está {status === "cancelled" ? "cancelado" : "suspendido"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Tus datos están guardados y a salvo. Para volver a entrar, activá tu suscripción mensual.
      </p>
      <button
        type="button"
        onClick={subscribe}
        disabled={busy}
        className="mt-5 w-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.01] disabled:opacity-50"
      >
        {busy ? "Redirigiendo a MercadoPago…" : "Activar suscripción"}
      </button>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      <p className="mt-4 text-xs text-faint">
        ¿Dudas? Escribinos a{" "}
        <a href="mailto:hola@run72.app" className="text-brand-cyan hover:underline">hola@run72.app</a>.
      </p>
    </div>
  );
}
