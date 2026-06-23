"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";
import { OptionCard } from "./OptionCard";
import { CostPanel } from "./CostPanel";
import { Confirmation } from "./Confirmation";
import { MicroserviceDrawer } from "./MicroserviceDrawer";
import { ArrowRight } from "../icons";
import { computeTotals, formatARS } from "@/lib/pricing";
import { track, getSessionId } from "@/lib/track";
import { BRAND_STATUS, OBJECTIVES, UNSURE_PROJECT } from "@/lib/quote-options";
import {
  EMPTY_INTAKE,
  computePreparation,
  functionalitiesFor,
  PREP_LABEL,
  type IntakeData,
} from "@/lib/intake";
import {
  IntakeFunctionalities,
  IntakeInfra,
  IntakeMaterial,
} from "./IntakeSteps";
import type { LeadFile, LineItem, Microservice, QuoteResult, Service } from "@/lib/types";

const STORAGE_KEY = "run72_quote_v2";
const STEP_LABELS = [
  "Proyecto",
  "Marca",
  "Servicios",
  "Funcionalidades",
  "Objetivo",
  "Lo que ya tenés",
  "Marca y referencias",
  "Contexto",
  "Datos",
];
const ease = [0.16, 1, 0.3, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LAST_STEP = 8;

type Contact = { name: string; company: string; email: string; whatsapp: string };

type State = {
  projectTypes: string[];
  brandStatus: string | null;
  addons: string[];
  microservices: string[]; // claves "service_slug:slug"
  objective: string | null;
  timingSelected: boolean;
  urgencyNote: string;
  files: LeadFile[];
  contact: Contact;
  intake: IntakeData;
};

const INITIAL: State = {
  projectTypes: [],
  brandStatus: null,
  addons: [],
  microservices: [],
  objective: null,
  timingSelected: false,
  urgencyNote: "",
  files: [],
  contact: { name: "", company: "", email: "", whatsapp: "" },
  intake: EMPTY_INTAKE,
};

export function QuoteConfigurator() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [allMicros, setAllMicros] = useState<Microservice[]>([]);
  const [drawerSlug, setDrawerSlug] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<State>(INITIAL);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
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

  // Tracking: inicio del cotizador (una vez por sesión de carga)
  useEffect(() => {
    track("cotizador_started");
  }, []);

  const projects = useMemo(
    () => (services ?? []).filter((s) => s.type === "project"),
    [services],
  );
  const addonList = useMemo(
    () => (services ?? []).filter((s) => s.type === "addon"),
    [services],
  );

  const lineItems = useMemo<LineItem[]>(() => {
    const items: LineItem[] = [];
    for (const slug of state.projectTypes) {
      if (slug === "unsure") {
        items.push({ name: UNSURE_PROJECT.label, price_ars: 0 });
        continue;
      }
      const p = projects.find((s) => s.slug === slug);
      if (p) items.push({ name: p.name, price_ars: p.price_ars });
    }
    for (const slug of state.addons) {
      const a = addonList.find((s) => s.slug === slug);
      if (a) items.push({ name: a.name, price_ars: a.price_ars });
    }
    for (const key of state.microservices) {
      const m = allMicros.find((x) => `${x.service_slug}:${x.slug}` === key);
      if (m) items.push({ name: `↳ ${m.name}`, price_ars: m.price_ars });
    }
    return items;
  }, [state.projectTypes, state.addons, state.microservices, projects, addonList, allMicros]);

  const selectedMicroSet = useMemo(
    () => new Set(state.microservices),
    [state.microservices],
  );

  function microsFor(serviceSlug: string) {
    return allMicros.filter((m) => m.service_slug === serviceSlug);
  }
  function microCountFor(serviceSlug: string) {
    return state.microservices.filter((k) => k.startsWith(`${serviceSlug}:`)).length;
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

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return state.projectTypes.length > 0;
      case 1:
        return state.brandStatus !== null;
      case 2:
        return true; // servicios (opcional)
      case 3:
        return true; // funcionalidades (opcional)
      case 4:
        return state.objective !== null;
      case 5:
        return true; // lo que ya tenés (opcional)
      case 6:
        return true; // marca y referencias (opcional)
      case 7:
        return state.timingSelected && state.urgencyNote.trim().length > 0;
      case 8:
        return (
          state.contact.name.trim().length > 1 &&
          EMAIL_RE.test(state.contact.email.trim()) &&
          state.contact.whatsapp.trim().length >= 6
        );
      default:
        return false;
    }
  }, [step, state]);

  function patchIntake(patch: Partial<IntakeData>) {
    setState((s) => ({ ...s, intake: { ...s.intake, ...patch } }));
  }

  const functionalityOptions = useMemo(
    () => functionalitiesFor(state.projectTypes.filter((p) => p !== "unsure")),
    [state.projectTypes],
  );

  const prep = useMemo(() => computePreparation(state.intake), [state.intake]);

  function go(delta: number) {
    if (delta > 0) track("step_completed", { step, label: STEP_LABELS[step] });
    setDir(delta);
    setStep((s) => Math.max(0, Math.min(LAST_STEP, s + delta)));
  }

  function toggle(list: "projectTypes" | "addons", slug: string) {
    setState((s) => {
      const isOn = s[list].includes(slug);
      if (!isOn) track("service_selected", { service: slug, list });
      return {
        ...s,
        [list]: isOn ? s[list].filter((x) => x !== slug) : [...s[list], slug],
        // al deseleccionar un servicio, quitamos sus microservicios
        microservices: isOn
          ? s.microservices.filter((k) => !k.startsWith(`${slug}:`))
          : s.microservices,
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
          brandStatus: state.brandStatus,
          addons: state.addons,
          microservices: state.microservices,
          objective: state.objective,
          timing: "asap",
          urgencyNote: state.urgencyNote,
          files: state.files,
          contact: state.contact,
          intake: state.intake,
          preparationLevel: prep.level,
          sessionId: getSessionId(),
          funnelStepReached: LAST_STEP + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el presupuesto.");
      setResult(data as QuoteResult);
      track("checkout_started", { leadId: (data as QuoteResult).leadId, total: (data as QuoteResult).total });
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
    setDrawerSlug(null);
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

  return (
    <Shell>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
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
                  subtitle="Elegí uno o varios. Podés combinar desarrollo, branding y estrategia."
                >
                  <div className="grid gap-3">
                    {!services && <SkeletonCards n={4} />}
                    {projects.map((p) => (
                      <div key={p.slug}>
                        <OptionCard
                          title={p.name}
                          description={p.description}
                          price={formatARS(p.price_ars)}
                          multi
                          selected={state.projectTypes.includes(p.slug)}
                          onSelect={() => toggle("projectTypes", p.slug)}
                        />
                        {state.projectTypes.includes(p.slug) &&
                          microsFor(p.slug).length > 0 && (
                            <ConfigureButton
                              count={microCountFor(p.slug)}
                              onClick={() => setDrawerSlug(p.slug)}
                            />
                          )}
                      </div>
                    ))}
                    {services && (
                      <OptionCard
                        title={UNSURE_PROJECT.label}
                        description={UNSURE_PROJECT.hint}
                        price="a definir"
                        multi
                        selected={state.projectTypes.includes("unsure")}
                        onSelect={() => toggle("projectTypes", "unsure")}
                      />
                    )}
                  </div>
                </Step>
              )}

              {step === 1 && (
                <Step title="¿Ya tenés marca?" subtitle="Así sabemos desde dónde partimos con el diseño.">
                  <div className="grid gap-3">
                    {BRAND_STATUS.map((o) => (
                      <OptionCard
                        key={o.value}
                        title={o.label}
                        selected={state.brandStatus === o.value}
                        onSelect={() => setState((s) => ({ ...s, brandStatus: o.value }))}
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
                      <div key={a.slug}>
                        <OptionCard
                          title={a.name}
                          description={a.description}
                          price={formatARS(a.price_ars)}
                          multi
                          selected={state.addons.includes(a.slug)}
                          onSelect={() => toggle("addons", a.slug)}
                        />
                        {state.addons.includes(a.slug) &&
                          microsFor(a.slug).length > 0 && (
                            <ConfigureButton
                              count={microCountFor(a.slug)}
                              onClick={() => setDrawerSlug(a.slug)}
                            />
                          )}
                      </div>
                    ))}
                  </div>
                </Step>
              )}

              {step === 3 && (
                <Step
                  title="¿Qué funcionalidades necesitás?"
                  subtitle="Opcional · cuanto más definas, más rápido construimos."
                >
                  <IntakeFunctionalities
                    options={functionalityOptions}
                    intake={state.intake}
                    onChange={patchIntake}
                  />
                </Step>
              )}

              {step === 4 && (
                <Step title="¿Cuál es el objetivo del proyecto?" subtitle="Enfocamos la estrategia según lo que querés lograr.">
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

              {step === 5 && (
                <Step
                  title="Lo que ya tenés disponible"
                  subtitle="Opcional · si ya tenés infraestructura, la aprovechamos para avanzar más rápido."
                >
                  <IntakeInfra intake={state.intake} onChange={patchIntake} />
                </Step>
              )}

              {step === 6 && (
                <Step
                  title="Tu marca y referencias"
                  subtitle="Opcional · material, referencias visuales y todo lo que nos ayude a entender tu visión."
                >
                  <IntakeMaterial intake={state.intake} onChange={patchIntake} />
                </Step>
              )}

              {step === 7 && (
                <Step title="¿Cuándo querés lanzar?" subtitle="Contanos el contexto y sumá referencias si tenés.">
                  <div className="grid gap-4">
                    <OptionCard
                      title="Lo antes posible (por algo estoy acá)"
                      selected={state.timingSelected}
                      onSelect={() => setState((s) => ({ ...s, timingSelected: true }))}
                    />

                    {state.timingSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="grid gap-4"
                      >
                        <label className="flex flex-col gap-1.5">
                          <span className="text-sm text-muted">
                            Contanos más sobre urgencia o contexto del proyecto
                            <span className="text-brand-cyan"> *</span>
                          </span>
                          <textarea
                            value={state.urgencyNote}
                            onChange={(e) => setState((s) => ({ ...s, urgencyNote: e.target.value }))}
                            rows={4}
                            placeholder="Ej: necesito lanzar antes de fin de mes, ya tengo el dominio y referencias de diseño…"
                            className="rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2"
                          />
                        </label>

                        <FileUpload files={state.files} onUpload={uploadFiles} onRemove={(url) =>
                          setState((s) => ({ ...s, files: s.files.filter((f) => f.url !== url) }))
                        } />
                      </motion.div>
                    )}
                  </div>
                </Step>
              )}

              {step === 8 && (
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
                {submitting ? "Generando…" : "Generar mi presupuesto"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start lg:space-y-4">
          <CostPanel lineItems={lineItems} pending={submitting} />
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium tracking-tight">Nivel de Preparación</span>
              <span className="text-lg">{PREP_LABEL[prep.level].dot}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet"
                animate={{ width: `${prep.score}%` }}
                transition={{ duration: 0.5, ease }}
              />
            </div>
            <p className={`mt-2 text-xs ${PREP_LABEL[prep.level].text}`}>
              {PREP_LABEL[prep.level].label}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-faint">
              Cuanta más información compartas, más rápido y mejor construimos tu proyecto en 72 horas.
            </p>
          </div>
        </aside>
      </div>

      {lineItems.length > 0 && <MobileTotalBar lineItems={lineItems} />}

      <MicroserviceDrawer
        open={drawerSlug !== null}
        serviceName={
          [...projects, ...addonList].find((s) => s.slug === drawerSlug)?.name ?? ""
        }
        micros={drawerSlug ? microsFor(drawerSlug) : []}
        selected={selectedMicroSet}
        onToggle={toggleMicro}
        onClose={() => setDrawerSlug(null)}
      />
    </Shell>
  );
}

function ConfigureButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1.5 ml-1 inline-flex items-center gap-1.5 text-xs font-medium text-brand-cyan transition-colors hover:text-fg"
    >
      {count > 0 ? `Configurado · ${count} microservicios` : "Configurar microservicios"} →
    </button>
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
        <div key={i} className="h-[76px] animate-pulse rounded-2xl border border-line bg-surface/40" />
      ))}
    </>
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
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line-strong bg-surface/40 px-4 py-6 text-center transition-colors hover:bg-surface-2/60">
        <span className="text-sm font-medium">Adjuntar archivos</span>
        <span className="text-xs text-faint">PDFs, imágenes, documentos o referencias (opcional)</span>
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
      <Field label="Email" required hint="A este email te enviaremos la factura y documentación del proyecto.">
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
      <Field label="WhatsApp" required>
        <input
          type="tel"
          value={contact.whatsapp}
          required
          autoComplete="tel"
          placeholder="Ej: +54 9 11 1234 5678"
          onChange={(e) => onChange({ ...contact, whatsapp: e.target.value })}
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
