"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";
import { OptionCard } from "./OptionCard";
import { CostPanel } from "./CostPanel";
import { Confirmation } from "./Confirmation";
import { ArrowRight } from "../icons";
import { computeTotals, formatARS } from "@/lib/pricing";
import {
  BRAND_STATUS,
  OBJECTIVES,
  TIMINGS,
  UNSURE_PROJECT,
} from "@/lib/quote-options";
import type { LineItem, QuoteResult, Service } from "@/lib/types";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "run72_quote_v1";
const STEP_LABELS = ["Proyecto", "Marca", "Servicios", "Objetivo", "Timing", "Datos"];
const ease = [0.16, 1, 0.3, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Contact = { name: string; company: string; email: string; phone: string };

type State = {
  projectType: string | null;
  brandStatus: string | null;
  addons: string[];
  objective: string | null;
  timing: string | null;
  contact: Contact;
};

const INITIAL: State = {
  projectType: null,
  brandStatus: null,
  addons: [],
  objective: null,
  timing: null,
  contact: { name: "", company: "", email: "", phone: "" },
};

export function QuoteConfigurator() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<State>(INITIAL);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // --- Cargar servicios (precios desde la DB) ---
  useEffect(() => {
    let alive = true;
    fetch("/api/services")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Error al cargar servicios");
        return r.json();
      })
      .then((d) => alive && setServices(d.services as Service[]))
      .catch((e) => alive && setLoadError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  // --- Restaurar desde localStorage ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { state?: State; step?: number };
        if (saved.state) setState({ ...INITIAL, ...saved.state });
        if (typeof saved.step === "number") setStep(Math.min(saved.step, 5));
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  // --- Persistir ---
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, step }));
  }, [state, step, hydrated]);

  const projects = useMemo(
    () => (services ?? []).filter((s) => s.type === "project"),
    [services],
  );
  const addonList = useMemo(
    () => (services ?? []).filter((s) => s.type === "addon"),
    [services],
  );

  // --- Line items en vivo para el panel de costos ---
  const lineItems = useMemo<LineItem[]>(() => {
    const items: LineItem[] = [];
    if (state.projectType === "unsure") {
      items.push({ name: UNSURE_PROJECT.label, price_ars: 0 });
    } else if (state.projectType) {
      const p = projects.find((s) => s.slug === state.projectType);
      if (p) items.push({ name: p.name, price_ars: p.price_ars });
    }
    for (const slug of state.addons) {
      const a = addonList.find((s) => s.slug === slug);
      if (a) items.push({ name: a.name, price_ars: a.price_ars });
    }
    return items;
  }, [state.projectType, state.addons, projects, addonList]);

  // --- Validación por paso ---
  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return state.projectType !== null;
      case 1:
        return state.brandStatus !== null;
      case 2:
        return true; // addons opcionales
      case 3:
        return state.objective !== null;
      case 4:
        return state.timing !== null;
      case 5:
        return (
          state.contact.name.trim().length > 1 &&
          EMAIL_RE.test(state.contact.email.trim())
        );
      default:
        return false;
    }
  }, [step, state]);

  function go(delta: number) {
    setDir(delta);
    setStep((s) => Math.max(0, Math.min(5, s + delta)));
  }

  function toggleAddon(slug: string) {
    setState((s) => ({
      ...s,
      addons: s.addons.includes(slug)
        ? s.addons.filter((a) => a !== slug)
        : [...s.addons, slug],
    }));
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: state.projectType,
          brandStatus: state.brandStatus,
          addons: state.addons,
          objective: state.objective,
          timing: state.timing,
          contact: state.contact,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el presupuesto.");
      setResult(data as QuoteResult);
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setState(INITIAL);
    setStep(0);
    setResult(null);
    setDir(-1);
  }

  // --- Estados de carga / error de servicios ---
  if (loadError) {
    const comingSoon = /no configurado/i.test(loadError);
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface/40 p-8 text-center">
          <p className="font-medium">
            {comingSoon
              ? "Estamos activando el cotizador."
              : "No pudimos cargar el configurador."}
          </p>
          <p className="mt-2 text-sm text-muted">
            {comingSoon
              ? "En unos minutos vas a poder armar tu proyecto y obtener tu presupuesto al instante."
              : loadError}
          </p>
          <Link
            href="/"
            className="mt-5 inline-block text-sm text-brand-cyan hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </Shell>
    );
  }

  if (result) {
    return (
      <Shell>
        <Confirmation result={result} name={state.contact.name} onRestart={restart} />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Columna principal */}
        <div>
          <ProgressBar step={step} />

          <div className="relative mt-8 min-h-[340px]">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: dir * 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease }}
              >
                {step === 0 && (
                  <Step
                    title="¿Qué querés construir?"
                    subtitle="Elegí el tipo de proyecto. Si no estás seguro, lo definimos juntos."
                  >
                    <div className="grid gap-3">
                      {!services && <SkeletonCards n={4} />}
                      {projects.map((p) => (
                        <OptionCard
                          key={p.slug}
                          title={p.name}
                          description={p.description}
                          price={formatARS(p.price_ars)}
                          selected={state.projectType === p.slug}
                          onSelect={() => setState((s) => ({ ...s, projectType: p.slug }))}
                        />
                      ))}
                      {services && (
                        <OptionCard
                          title={UNSURE_PROJECT.label}
                          description={UNSURE_PROJECT.hint}
                          price="a definir"
                          selected={state.projectType === "unsure"}
                          onSelect={() =>
                            setState((s) => ({ ...s, projectType: "unsure" }))
                          }
                        />
                      )}
                    </div>
                  </Step>
                )}

                {step === 1 && (
                  <Step
                    title="¿Ya tenés marca?"
                    subtitle="Así sabemos desde dónde partimos con el diseño."
                  >
                    <div className="grid gap-3">
                      {BRAND_STATUS.map((o) => (
                        <OptionCard
                          key={o.value}
                          title={o.label}
                          selected={state.brandStatus === o.value}
                          onSelect={() =>
                            setState((s) => ({ ...s, brandStatus: o.value }))
                          }
                        />
                      ))}
                    </div>
                  </Step>
                )}

                {step === 2 && (
                  <Step
                    title="¿Qué necesitás además?"
                    subtitle="Sumá servicios para potenciar tu lanzamiento. Podés elegir varios."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {!services && <SkeletonCards n={6} />}
                      {addonList.map((a) => (
                        <OptionCard
                          key={a.slug}
                          title={a.name}
                          description={a.description}
                          price={formatARS(a.price_ars)}
                          multi
                          selected={state.addons.includes(a.slug)}
                          onSelect={() => toggleAddon(a.slug)}
                        />
                      ))}
                    </div>
                  </Step>
                )}

                {step === 3 && (
                  <Step
                    title="¿Cuál es el objetivo del proyecto?"
                    subtitle="Enfocamos la estrategia según lo que querés lograr."
                  >
                    <div className="grid gap-3">
                      {OBJECTIVES.map((o) => (
                        <OptionCard
                          key={o.value}
                          title={o.label}
                          selected={state.objective === o.value}
                          onSelect={() => setState((s) => ({ ...s, objective: o.value }))}
                        />
                      ))}
                    </div>
                  </Step>
                )}

                {step === 4 && (
                  <Step
                    title="¿Cuándo querés lanzar?"
                    subtitle="Tu urgencia define cómo organizamos la ejecución."
                  >
                    <div className="grid gap-3">
                      {TIMINGS.map((o) => (
                        <OptionCard
                          key={o.value}
                          title={o.label}
                          description={o.hint}
                          selected={state.timing === o.value}
                          onSelect={() => setState((s) => ({ ...s, timing: o.value }))}
                        />
                      ))}
                    </div>
                  </Step>
                )}

                {step === 5 && (
                  <Step
                    title="¿A dónde te enviamos la propuesta?"
                    subtitle="Con estos datos generamos tu presupuesto y abrimos tu proyecto."
                  >
                    <ContactForm
                      contact={state.contact}
                      onChange={(contact) => setState((s) => ({ ...s, contact }))}
                    />
                  </Step>
                )}
              </motion.div>
          </div>

          {submitError && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {submitError}
            </p>
          )}

          {/* Navegación */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={step === 0}
              className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-fg disabled:pointer-events-none disabled:opacity-0"
            >
              Atrás
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => go(1)}
                disabled={!stepValid}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition-all duration-300 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-40",
                )}
              >
                Continuar
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!stepValid || submitting}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-40"
              >
                {submitting ? "Generando…" : "Generar mi presupuesto"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Panel de costos (sticky en desktop, detalle abajo en mobile) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CostPanel lineItems={lineItems} pending={submitting} />
        </aside>
      </div>

      {/* Barra inferior fija (mobile) — resumen persistente */}
      {lineItems.length > 0 && <MobileTotalBar lineItems={lineItems} />}
    </Shell>
  );
}

function MobileTotalBar({ lineItems }: { lineItems: LineItem[] }) {
  const { total, deposit } = computeTotals(lineItems, 30);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/90 backdrop-blur lg:hidden">
      <div className="container-x flex items-center justify-between py-3">
        <div>
          <p className="text-[11px] text-faint">Total</p>
          <p className="font-display text-base font-semibold tabular-nums">
            {formatARS(total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-faint">Adelanto 30%</p>
          <p className="font-display text-base font-semibold tabular-nums text-gradient">
            {formatARS(deposit)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN72 — inicio">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-fg"
          >
            Volver al sitio
          </Link>
        </div>
      </header>
      <main className="container-x py-10 pb-28 md:py-14 lg:pb-14">{children}</main>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = ((step + 1) / STEP_LABELS.length) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-medium text-fg">
          Paso {step + 1} de {STEP_LABELS.length}
        </span>
        <span>{STEP_LABELS[step]}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease }}
        />
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-pretty text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SkeletonCards({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="h-[76px] animate-pulse rounded-2xl border border-line bg-surface/40"
        />
      ))}
    </>
  );
}

function ContactForm({
  contact,
  onChange,
}: {
  contact: Contact;
  onChange: (c: Contact) => void;
}) {
  const fields: Array<{
    key: keyof Contact;
    label: string;
    type: string;
    required?: boolean;
    placeholder: string;
    autoComplete: string;
  }> = [
    { key: "name", label: "Nombre", type: "text", required: true, placeholder: "Tu nombre", autoComplete: "name" },
    { key: "company", label: "Empresa", type: "text", placeholder: "Opcional", autoComplete: "organization" },
    { key: "email", label: "Email", type: "email", required: true, placeholder: "tu@email.com", autoComplete: "email" },
    { key: "phone", label: "Teléfono", type: "tel", placeholder: "Opcional", autoComplete: "tel" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <label key={f.key} className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">
            {f.label}
            {f.required && <span className="text-brand-cyan"> *</span>}
          </span>
          <input
            type={f.type}
            value={contact[f.key]}
            required={f.required}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            onChange={(e) => onChange({ ...contact, [f.key]: e.target.value })}
            className="h-12 rounded-xl border border-line bg-surface/60 px-4 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2"
          />
        </label>
      ))}
    </div>
  );
}
