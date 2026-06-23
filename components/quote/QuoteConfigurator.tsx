"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";
import { OptionCard } from "./OptionCard";
import { CostPanel } from "./CostPanel";
import { Confirmation } from "./Confirmation";
import { ArrowRight, CheckIcon } from "../icons";
import { computeTotals, formatARS } from "@/lib/pricing";
import { track, getSessionId } from "@/lib/track";
import {
  PROJECT_TYPES,
  STAGES,
  OBJECTIVES_V2,
  DELIVERABLES_V2,
  GUARANTEE_V2,
  EMPTY_INTAKE_V2,
  buildSummary,
  type IntakeV2,
  type IconKey,
} from "@/lib/configurator";
import type { LeadFile, LineItem, Microservice, QuoteResult, Service } from "@/lib/types";

const STORAGE_KEY = "run72_quote_v3";
const STEP_LABELS = ["Proyecto", "Tu negocio", "Funcionalidades", "Resumen y pago"];
const LAST_STEP = 3;
const ease = [0.16, 1, 0.3, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Contact = { name: string; company: string; email: string; whatsapp: string };

type State = {
  projectTypes: string[]; // slugs
  microservices: string[]; // claves "service_slug:slug"
  objective: string | null;
  files: LeadFile[];
  contact: Contact;
  intake: IntakeV2;
};

const INITIAL: State = {
  projectTypes: [],
  microservices: [],
  objective: null,
  files: [],
  contact: { name: "", company: "", email: "", whatsapp: "" },
  intake: EMPTY_INTAKE_V2,
};

export function QuoteConfigurator() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [allMicros, setAllMicros] = useState<Microservice[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<State>(INITIAL);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [infraOpen, setInfraOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/services")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "Error al cargar servicios");
        return r.json();
      })
      .then((d) => {
        if (!alive) return;
        setServices(d.services as Service[]);
        setAllMicros((d.microservices ?? []) as Microservice[]);
      })
      .catch((e) => alive && setLoadError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { state?: State; step?: number };
        if (saved.state) setState({ ...INITIAL, ...saved.state });
        if (typeof saved.step === "number") setStep(Math.min(saved.step, LAST_STEP));
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, step }));
  }, [state, step, hydrated]);

  useEffect(() => {
    track("cotizador_started");
  }, []);

  // Servicio DB por slug (de ahí salen precio y descripción).
  const serviceBySlug = useMemo(() => {
    const map = new Map<string, Service>();
    for (const s of services ?? []) map.set(s.slug, s);
    return map;
  }, [services]);

  const selectedDefs = useMemo(
    () => PROJECT_TYPES.filter((p) => state.projectTypes.includes(p.slug)),
    [state.projectTypes],
  );

  const lineItems = useMemo<LineItem[]>(() => {
    const items: LineItem[] = [];
    for (const slug of state.projectTypes) {
      const s = serviceBySlug.get(slug);
      const def = PROJECT_TYPES.find((p) => p.slug === slug);
      if (s) items.push({ name: def?.label ?? s.name, price_ars: s.price_ars });
      else if (def) items.push({ name: def.label, price_ars: 0 });
    }
    for (const key of state.microservices) {
      const m = allMicros.find((x) => `${x.service_slug}:${x.slug}` === key);
      if (m) items.push({ name: `↳ ${m.name}`, price_ars: m.price_ars });
    }
    return items;
  }, [state.projectTypes, state.microservices, serviceBySlug, allMicros]);

  // Funcionalidades (microservicios) de los tipos elegidos, agrupadas por servicio.
  const functionalityGroups = useMemo(() => {
    return selectedDefs
      .map((def) => ({
        def,
        micros: allMicros.filter((m) => m.service_slug === def.slug),
      }))
      .filter((g) => g.micros.length > 0);
  }, [selectedDefs, allMicros]);

  const functionalityNames = useMemo(() => {
    return state.microservices
      .map((key) => allMicros.find((m) => `${m.service_slug}:${m.slug}` === key)?.name)
      .filter((n): n is string => Boolean(n));
  }, [state.microservices, allMicros]);

  const anyNeedsInfra = selectedDefs.some((d) => d.needsInfra);

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return state.projectTypes.length > 0;
      case 1:
        return (
          state.intake.businessWhat.trim().length > 1 &&
          state.intake.stage !== null &&
          state.objective !== null
        );
      case 2:
        return true; // funcionalidades (opcional)
      case 3:
        return (
          state.contact.name.trim().length > 1 &&
          EMAIL_RE.test(state.contact.email.trim())
        );
      default:
        return false;
    }
  }, [step, state]);

  function patchIntake(patch: Partial<IntakeV2>) {
    setState((s) => ({ ...s, intake: { ...s.intake, ...patch } }));
  }

  function go(delta: number) {
    if (delta > 0) track("step_completed", { step, label: STEP_LABELS[step] });
    setDir(delta);
    setStep((s) => Math.max(0, Math.min(LAST_STEP, s + delta)));
  }

  function toggleType(slug: string) {
    setState((s) => {
      const isOn = s.projectTypes.includes(slug);
      if (!isOn) track("service_selected", { service: slug, list: "projectTypes" });
      return {
        ...s,
        projectTypes: isOn ? s.projectTypes.filter((x) => x !== slug) : [...s.projectTypes, slug],
        // al deseleccionar un tipo, quitamos sus funcionalidades
        microservices: isOn
          ? s.microservices.filter((k) => !k.startsWith(`${slug}:`))
          : s.microservices,
      };
    });
  }

  function toggleMicro(key: string) {
    setState((s) => {
      const on = !s.microservices.includes(key);
      track("microservice_toggled", { key, on });
      return {
        ...s,
        microservices: on
          ? [...s.microservices, key]
          : s.microservices.filter((k) => k !== key),
      };
    });
  }

  async function uploadFiles(fileList: FileList) {
    const form = new FormData();
    Array.from(fileList).forEach((f) => form.append("files", f));
    try {
      const res = await fetch("/api/leads/upload", { method: "POST", body: form });
      const data = await res.json();
      if (Array.isArray(data.files)) {
        setState((s) => ({ ...s, files: [...s.files, ...(data.files as LeadFile[])] }));
      }
    } catch {
      /* noop */
    }
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTypes: state.projectTypes,
          brandStatus: null,
          addons: [],
          microservices: state.microservices,
          objective: state.objective,
          timing: "asap",
          urgencyNote: state.intake.businessWhat,
          files: state.files,
          contact: state.contact,
          intake: state.intake,
          sessionId: getSessionId(),
          funnelStepReached: LAST_STEP + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el presupuesto.");
      setResult(data as QuoteResult);
      track("checkout_started", {
        leadId: (data as QuoteResult).leadId,
        total: (data as QuoteResult).total,
      });
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

  if (loadError) {
    const comingSoon = /no configurado/i.test(loadError);
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface/40 p-8 text-center">
          <p className="font-medium">
            {comingSoon ? "Estamos activando el cotizador." : "No pudimos cargar el configurador."}
          </p>
          <p className="mt-2 text-sm text-muted">
            {comingSoon
              ? "En unos minutos vas a poder armar tu proyecto y obtener tu presupuesto al instante."
              : loadError}
          </p>
          <Link href="/" className="mt-5 inline-block text-sm text-brand-cyan hover:underline">
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

  const summary = buildSummary({
    typeLabels: selectedDefs.map((d) => d.label),
    businessWhat: state.intake.businessWhat,
    stage: state.intake.stage,
    objective: state.objective,
    functionalityNames,
  });

  return (
    <Shell>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <ProgressBar step={step} />

          <div className="relative mt-8 min-h-[360px] overflow-hidden">
            {/* overflow-hidden: contiene el slide de entrada (framer) y evita scroll-x */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: dir * 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              {/* PASO 1 — Tipo de proyecto */}
              {step === 0 && (
                <Step
                  title="¿Qué querés construir?"
                  subtitle="Elegí uno o varios. Lo armás en pocos minutos y ves el precio al instante."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {!services && <SkeletonCards n={8} />}
                    {services &&
                      PROJECT_TYPES.map((p) => {
                        const svc = serviceBySlug.get(p.slug);
                        return (
                          <ProjectTypeCard
                            key={p.slug}
                            icon={p.icon}
                            label={p.label}
                            tagline={p.tagline}
                            price={svc ? formatARS(svc.price_ars) : "a definir"}
                            selected={state.projectTypes.includes(p.slug)}
                            onSelect={() => toggleType(p.slug)}
                          />
                        );
                      })}
                  </div>
                </Step>
              )}

              {/* PASO 2 — Contexto mínimo del negocio */}
              {step === 1 && (
                <Step
                  title="Contanos de tu negocio"
                  subtitle="Solo lo esencial para enfocar el proyecto. Tres respuestas rápidas."
                >
                  <div className="grid gap-6">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm text-muted">
                        ¿Qué hace tu empresa?<span className="text-brand-cyan"> *</span>
                      </span>
                      <input
                        type="text"
                        value={state.intake.businessWhat}
                        onChange={(e) => patchIntake({ businessWhat: e.target.value })}
                        placeholder="Ej: vendemos indumentaria deportiva online"
                        className={inputCls}
                      />
                    </label>

                    <div>
                      <p className="mb-2 text-sm text-muted">
                        Etapa del negocio<span className="text-brand-cyan"> *</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {STAGES.map((o) => (
                          <Chip
                            key={o.value}
                            label={o.label}
                            selected={state.intake.stage === o.value}
                            onClick={() => patchIntake({ stage: o.value })}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-muted">
                        Objetivo principal<span className="text-brand-cyan"> *</span>
                      </p>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {OBJECTIVES_V2.map((o) => (
                          <Chip
                            key={o.value}
                            label={o.label}
                            selected={state.objective === o.value}
                            onClick={() => setState((s) => ({ ...s, objective: o.value }))}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Opcional colapsado */}
                    <div className="rounded-2xl border border-line bg-surface/30">
                      <button
                        type="button"
                        onClick={() => setMoreOpen((v) => !v)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
                      >
                        Contanos más para mejorar la precisión
                        <span className="text-faint">{moreOpen ? "−" : "+"}</span>
                      </button>
                      {moreOpen && (
                        <div className="grid gap-4 border-t border-line p-4">
                          <MiniField label="Cliente ideal" value={state.intake.idealClient} onChange={(v) => patchIntake({ idealClient: v })} placeholder="¿A quién le vendés?" />
                          <MiniField label="Qué te diferencia" value={state.intake.differentiation} onChange={(v) => patchIntake({ differentiation: v })} placeholder="Tu ventaja frente a la competencia" />
                          <MiniField label="Mercado / contexto" value={state.intake.market} onChange={(v) => patchIntake({ market: v })} placeholder="Dónde operás, referencias, etc." />
                          <FileUpload files={state.files} onUpload={uploadFiles} onRemove={(url) =>
                            setState((s) => ({ ...s, files: s.files.filter((f) => f.url !== url) }))
                          } />
                        </div>
                      )}
                    </div>
                  </div>
                </Step>
              )}

              {/* PASO 3 — Funcionalidades */}
              {step === 2 && (
                <Step
                  title="¿Qué funcionalidades necesitás?"
                  subtitle="Sumá lo que quieras. El precio se actualiza en vivo."
                >
                  {functionalityGroups.length === 0 ? (
                    <p className="rounded-2xl border border-line bg-surface/30 p-5 text-sm text-muted">
                      Tu selección se entrega completa, sin extras para configurar. Podés
                      continuar al resumen.
                    </p>
                  ) : (
                    <div className="grid gap-7">
                      {functionalityGroups.map(({ def, micros }) => (
                        <div key={def.slug}>
                          <p className="mb-3 text-sm font-medium tracking-tight text-fg">
                            {def.label}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {micros.map((m) => {
                              const key = `${m.service_slug}:${m.slug}`;
                              return (
                                <OptionCard
                                  key={key}
                                  title={m.name}
                                  description={m.description}
                                  price={m.price_ars > 0 ? formatARS(m.price_ars) : undefined}
                                  multi
                                  selected={state.microservices.includes(key)}
                                  onSelect={() => toggleMicro(key)}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {anyNeedsInfra && (
                    <button
                      type="button"
                      onClick={() => setInfraOpen(true)}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-cyan transition-colors hover:text-fg"
                    >
                      ¿Ya tenés dominio, hosting, redes o marca? Contanos (opcional) →
                    </button>
                  )}
                </Step>
              )}

              {/* PASO 4 — Resumen y pago */}
              {step === 3 && (
                <Step
                  title="Tu proyecto, listo para arrancar"
                  subtitle="Revisá el resumen y dejanos tus datos para iniciar."
                >
                  <div className="grid gap-5">
                    {/* Resumen */}
                    <div className="glass rounded-3xl p-6">
                      <p className="text-xs font-medium uppercase tracking-wide text-faint">
                        Resumen del proyecto
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-fg">
                        {summary.resumen || "Definí tu proyecto en los pasos anteriores."}
                      </p>

                      {summary.construir.length > 0 && (
                        <>
                          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-faint">
                            Qué vamos a construir
                          </p>
                          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                            {summary.construir.map((c, i) => (
                              <li key={`${c}-${i}`} className="flex items-start gap-2 text-sm text-muted">
                                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" strokeWidth={2.5} />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      <div className="mt-5 flex items-center gap-2 rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.05] px-4 py-2.5 text-sm">
                        <span className="font-medium text-fg">Tiempo de entrega:</span>
                        <span className="text-brand-cyan">72 horas exactas</span>
                      </div>
                    </div>

                    {/* Precio */}
                    <PriceCard lineItems={lineItems} />

                    {/* Garantía */}
                    <div className="flex items-start gap-3 rounded-3xl border border-brand-cyan/25 bg-brand-cyan/[0.06] p-5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-violet text-ink">
                        <CheckIcon className="h-4 w-4" strokeWidth={2.5} />
                      </span>
                      <p className="text-sm font-medium leading-relaxed text-fg">{GUARANTEE_V2}</p>
                    </div>

                    {/* Entregables */}
                    <div className="rounded-3xl border border-line bg-surface/30 p-6">
                      <p className="text-sm font-medium tracking-tight">Qué recibís al finalizar</p>
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {DELIVERABLES_V2.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-sm text-muted">
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" strokeWidth={2.5} />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Contacto */}
                    <div className="rounded-3xl border border-line bg-surface/30 p-6">
                      <p className="text-sm font-medium tracking-tight">¿A dónde enviamos tu proyecto?</p>
                      <div className="mt-4">
                        <ContactForm
                          contact={state.contact}
                          onChange={(contact) => setState((s) => ({ ...s, contact }))}
                        />
                      </div>
                    </div>
                  </div>
                </Step>
              )}
            </motion.div>
          </div>

          {submitError && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {submitError}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={step === 0}
              className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-fg disabled:pointer-events-none disabled:opacity-0"
            >
              Atrás
            </button>

            {step < LAST_STEP ? (
              <button
                type="button"
                onClick={() => go(1)}
                disabled={!stepValid}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition-all duration-300 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-40"
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
                {submitting ? "Generando…" : "Quiero mi proyecto en 72 horas"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CostPanel lineItems={lineItems} pending={submitting} />
        </aside>
      </div>

      {lineItems.length > 0 && <MobileTotalBar lineItems={lineItems} />}

      {infraOpen && (
        <InfraModal
          infra={state.intake.infra}
          onChange={(infra) => patchIntake({ infra })}
          onClose={() => setInfraOpen(false)}
        />
      )}
    </Shell>
  );
}

/* ------------------------------------------------------------------ */

function ProjectTypeCard({
  icon,
  label,
  tagline,
  price,
  selected,
  onSelect,
}: {
  icon: IconKey;
  label: string;
  tagline: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className={`group relative flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all duration-300 ${
        selected
          ? "border-transparent bg-gradient-to-br from-brand-blue/[0.14] to-brand-violet/[0.08] ring-1 ring-brand-blue/50"
          : "border-line bg-surface/40 hover:border-line-strong hover:bg-surface-2/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            selected ? "bg-gradient-to-br from-brand-cyan to-brand-violet text-ink" : "bg-white/[0.05] text-brand-cyan"
          }`}
        >
          {ICONS[icon]}
        </span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
            selected ? "border-transparent bg-gradient-to-br from-brand-cyan to-brand-violet text-ink" : "border-line-strong text-transparent"
          }`}
        >
          <CheckIcon className="h-3 w-3" strokeWidth={3} />
        </span>
      </div>
      <div>
        <p className="font-medium tracking-tight">{label}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted">{tagline}</p>
      </div>
      <p className={`text-sm font-semibold tabular-nums ${selected ? "text-fg" : "text-muted"}`}>
        {price === "a definir" ? "a definir" : `Desde ${price}`}
      </p>
    </button>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all duration-200 ${
        selected
          ? "border-transparent bg-gradient-to-br from-brand-blue/[0.14] to-brand-violet/[0.08] text-fg ring-1 ring-brand-blue/50"
          : "border-line bg-surface/40 text-muted hover:border-line-strong hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}

function PriceCard({ lineItems }: { lineItems: LineItem[] }) {
  const { total, deposit, balance } = computeTotals(lineItems, 30);
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="text-xs text-muted">Total (IVA incl.)</p>
        <p className="mt-1 font-display text-xl font-semibold tabular-nums">{formatARS(total)}</p>
      </div>
      <div className="rounded-2xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue/[0.12] to-brand-violet/[0.06] p-4">
        <p className="text-xs text-muted">Adelanto 30% para iniciar</p>
        <p className="mt-1 font-display text-xl font-semibold tabular-nums text-gradient">{formatARS(deposit)}</p>
      </div>
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="text-xs text-muted">Saldo 70% al finalizar</p>
        <p className="mt-1 font-display text-xl font-semibold tabular-nums">{formatARS(balance)}</p>
      </div>
    </div>
  );
}

function InfraModal({
  infra,
  onChange,
  onClose,
}: {
  infra: IntakeV2["infra"];
  onChange: (i: IntakeV2["infra"]) => void;
  onClose: () => void;
}) {
  const rows: { key: keyof IntakeV2["infra"]; label: string }[] = [
    { key: "domain", label: "¿Tenés dominio?" },
    { key: "hosting", label: "¿Tenés hosting?" },
    { key: "instagram", label: "¿Tenés Instagram activo?" },
    { key: "branding", label: "¿Tenés branding existente?" },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-line bg-ink-soft p-6 sm:rounded-3xl"
      >
        <p className="font-display text-lg font-semibold tracking-tight">Lo que ya tenés</p>
        <p className="mt-1 text-sm text-muted">
          Opcional · si ya contás con esto, lo aprovechamos para avanzar más rápido.
        </p>
        <div className="mt-5 space-y-2.5">
          {rows.map((r) => (
            <label
              key={r.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3"
            >
              <span className="text-sm text-fg">{r.label}</span>
              <input
                type="checkbox"
                checked={infra[r.key]}
                onChange={(e) => onChange({ ...infra, [r.key]: e.target.checked })}
                className="h-5 w-5 accent-[var(--color-brand-violet)]"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-white py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.01]"
        >
          Listo
        </button>
      </motion.div>
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
          <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
            Volver al sitio
          </Link>
        </div>
      </header>
      <main className="container-x py-10 pb-28 md:py-14 lg:pb-14">{children}</main>
    </div>
  );
}

function MobileTotalBar({ lineItems }: { lineItems: LineItem[] }) {
  const { total, deposit } = computeTotals(lineItems, 30);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/90 backdrop-blur lg:hidden">
      <div className="container-x flex items-center justify-between py-3">
        <div>
          <p className="text-[11px] text-faint">Total (IVA incl.)</p>
          <p className="font-display text-base font-semibold tabular-nums">{formatARS(total)}</p>
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
        <div key={i} className="h-[140px] animate-pulse rounded-2xl border border-line bg-surface/40" />
      ))}
    </>
  );
}

function MiniField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

function FileUpload({
  files,
  onUpload,
  onRemove,
}: {
  files: LeadFile[];
  onUpload: (f: FileList) => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line-strong bg-surface/40 px-4 py-5 text-center transition-colors hover:bg-surface-2/60">
        <span className="text-sm font-medium">Adjuntar archivos</span>
        <span className="text-xs text-faint">Referencias, logo, documentos (opcional)</span>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,.txt,.fig,.ppt,.pptx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((f) => (
            <li
              key={f.url}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink/40 px-3 py-2 text-sm"
            >
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="truncate text-muted hover:text-fg">
                {f.name}
              </a>
              <button
                type="button"
                onClick={() => onRemove(f.url)}
                className="shrink-0 text-xs text-faint hover:text-red-300"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContactForm({
  contact,
  onChange,
}: {
  contact: Contact;
  onChange: (c: Contact) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre" required>
        <input
          type="text"
          value={contact.name}
          required
          autoComplete="name"
          placeholder="Tu nombre"
          onChange={(e) => onChange({ ...contact, name: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Email" required hint="A este email te enviamos la factura y la documentación.">
        <input
          type="email"
          value={contact.email}
          required
          autoComplete="email"
          placeholder="tu@email.com"
          onChange={(e) => onChange({ ...contact, email: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="WhatsApp">
        <input
          type="tel"
          value={contact.whatsapp}
          autoComplete="tel"
          placeholder="Opcional"
          onChange={(e) => onChange({ ...contact, whatsapp: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Empresa">
        <input
          type="text"
          value={contact.company}
          autoComplete="organization"
          placeholder="Opcional"
          onChange={(e) => onChange({ ...contact, company: e.target.value })}
          className={inputCls}
        />
      </Field>
    </div>
  );
}

const inputCls =
  "h-12 rounded-xl border border-line bg-surface/60 px-4 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted">
        {label}
        {required && <span className="text-brand-cyan"> *</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  );
}

/* ---- Iconos de tipos de proyecto (line, currentColor) ---- */
const ICONS: Record<IconKey, React.ReactNode> = {
  web: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" />
    </svg>
  ),
  landing: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
      <rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h3" />
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .7h8.2a1 1 0 0 0 1-.8L20 8H6" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" />
    </svg>
  ),
  saas: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  ),
  crm: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 11h5M16 15h5M16 19h5" />
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
    </svg>
  ),
  social: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
      <rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17" cy="7" r="1" />
    </svg>
  ),
  automation: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 3v3M12 18v3M5 12H2M22 12h-3M6 6l-2-2M20 20l-2-2M18 6l2-2M4 20l2-2" /><circle cx="12" cy="12" r="3.5" />
    </svg>
  ),
};
