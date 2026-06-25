"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "../Logo";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "reset";

export function HubLogin() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const supabase = createSupabaseBrowser();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        window.location.href = "/hub";
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { company_name: company.trim() } },
        });
        if (error) throw error;
        if (data.session) {
          window.location.href = "/hub";
        } else {
          setInfo("Te enviamos un email para confirmar tu cuenta. Confirmalo y volvé a ingresar.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/hub/login`,
        });
        if (error) throw error;
        setInfo("Si el email existe, te enviamos un enlace para restablecer tu contraseña.");
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la acción.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN72 — inicio">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
            Volver al sitio
          </Link>
        </div>
      </header>

      <main className="container-x flex min-h-[calc(100vh-65px)] items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {mode === "login" && "Ingresá a tu Business Hub"}
              {mode === "signup" && "Creá tu Business Hub"}
              {mode === "reset" && "Recuperar contraseña"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              El centro de control de tu negocio, todo en un lugar.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
            {mode === "signup" && (
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de tu empresa"
                className={inp}
              />
            )}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={inp}
            />
            {mode !== "reset" && (
              <input
                type="password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className={inp}
              />
            )}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
            >
              {busy
                ? "Procesando…"
                : mode === "login"
                  ? "Ingresar"
                  : mode === "signup"
                    ? "Crear cuenta"
                    : "Enviar enlace"}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted">
            {mode === "login" && (
              <>
                <button onClick={() => setMode("reset")} className="hover:text-fg">
                  ¿Olvidaste tu contraseña?
                </button>
                <span>
                  ¿No tenés cuenta?{" "}
                  <button onClick={() => setMode("signup")} className="font-medium text-brand-cyan hover:underline">
                    Creala acá
                  </button>
                </span>
              </>
            )}
            {mode !== "login" && (
              <button onClick={() => setMode("login")} className="hover:text-fg">
                ← Volver a ingresar
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const inp =
  "h-12 rounded-xl border border-line bg-surface/60 px-4 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2";
