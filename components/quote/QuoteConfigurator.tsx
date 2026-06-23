"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";
import { OptionCard } from "./OptionCard";
import { CostPanel } from "./CostPanel";
import { Confirmation } from "./Confirmation";
import { MicroserviceDrawer } from "./MicroserviceDrawer";
import { ArrowRight } from "../icons";
import { computeTotals, formatARS } from "@/lib/pricing";
import { BRAND_STATUS, OBJECTIVES, UNSURE_PROJECT } from "@/lib/quote-options";
import type { LeadFile, LineItem, Microservice, QuoteResult, Service } from "@/lib/types";
import type { Preview } from "@/app/api/preview/route";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "run72_quote_v2";
const STEP_LABELS = [
  "Proyecto",
  "Marca",
  "Servicios",
  "Objetivo",
  "Contexto",
  "Datos",
  "Preview",
];
const ease = [0.16, 1, 0.3, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LAST_STEP = 6;

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
  previewRating: number | null;
  previewComments: string;
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
  previewRating: null,
  previewComments: "",
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

  // Preview IA
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewFetched = useRef(false);

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
    setState((s) => ({
      ...s,
      microservices: s.microservices.includes(key)
        ? s.microservices.filter((k) => k !== key)
        : [...s.microservices, key],
    }));
  }

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return state.projectTypes.length > 0;
      case 1:
        return state.brandStatus !== null;
      case 2:
        return true;
      case 3:
        return state.objective !== null;
      case 4:
        return state.timingSelected && state.urgencyNote.trim().length > 0;
      case 5:
        return (
          state.contact.name.trim().length > 1 &&
          EMAIL_RE.test(state.contact.email.trim()) &&
          state.contact.whatsapp.trim().length >= 6
        );
      case 6:
        return state.previewRating !== null;
      default:
        return false;
    }
  }, [step, state]);

  // Generar el preview al entrar al paso 7
  useEffect(() => {
    if (step !== LAST_STEP || previewFetched.current || !services) return;
    previewFetched.current = true;
    setPreviewLoading(true);
    const projectNames = state.projectTypes.map(
      (slug) =>
        slug === "unsure"
          ? UNSURE_PROJECT.label
          : projects.find((p) => p.slug === slug)?.name ?? slug,
    );
    const addonNames = state.addons.map(
      (slug) => addonList.find((a) => a.slug === slug)?.name ?? slug,
    );
    fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projects: projectNames,
        addons: addonNames,
        brandStatus: state.brandStatus,
        objective: state.objective,
        urgencyNote: state.urgencyNote,
      }),
    })
      .then((r) => r.json())
      .then((d) => setPreview(d.preview as Preview))
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false));
  }, [step, services, projects, addonList, state]);

  function go(delta: number) {
    setDir(delta);
    setStep((s) => Math.max(0, Math.min(LAST_STEP, s + delta)));
  }

  function toggle(list: "projectTypes" | "addons", slug: string) {
    setState((s) => {
      const isOn = s[list].includes(slug);
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
          previewRating: state.previewRating,
          previewComments: state.previewComments,
          previewText: preview ? JSON.stringify(preview) : null,
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
    setPreview(null);
    setDrawerSlug(null);
    previewFetched.current = false;
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

              {step === 4 && (
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

              {step === 6 && (
                <Step title="Así imaginamos tu proyecto" subtitle="Una primera visión generada a partir de lo que nos contaste.">
                  <PreviewView
                    preview={preview}
                    loading={previewLoading}
                    rating={state.previewRating}
                    comments={state.previewComments}
                    onRating={(r) => setState((s) => ({ ...s, previewRating: r }))}
                    onComments={(c) => setState((s) => ({ ...s, previewComments: c }))}
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

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CostPanel lineItems={lineItems} pending={submitting} />
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

function PreviewView({
  preview,
  loading,
  rating,
  comments,
  onRating,
  onComments,
}: {
  preview: Preview | null;
  loading: boolean;
  rating: number | null;
  comments: string;
  onRating: (r: number) => void;
  onComments: (c: string) => void;
}) {
  return (
    <div>
      {loading || !preview ? (
        <div className="glass rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 h-1 w-40 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <p className="text-sm text-muted">Imaginando tu proyecto…</p>
        </div>
      ) : (
        <div className="glass rounded-3xl p-6 sm:p-7">
          <p className="text-pretty text-base leading-relaxed">{preview.interpretation}</p>

          {/* Layout conceptual */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-faint">
              Estructura sugerida
            </p>
            <div className="flex flex-col gap-2">
              {preview.structure.map((section, i) => (
                <div
                  key={`${section}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-ink/40 px-4 py-3"
                  style={{ opacity: 1 - i * 0.04 }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-cyan/30 to-brand-violet/30 text-xs font-medium text-gradient">
                    {i + 1}
                  </span>
                  <span className="text-sm">{section}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-surface/40 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">Enfoque visual</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{preview.visualApproach}</p>
          </div>

          <p className="mt-5 text-pretty font-display text-lg font-medium leading-snug text-gradient">
            “{preview.summary}”
          </p>
        </div>
      )}

      {/* Rating + comentarios */}
      <div className="mt-6 rounded-3xl border border-line bg-surface/30 p-6">
        <p className="text-sm font-medium">
          ¿Qué tan cerca está de lo que imaginabas?
          <span className="text-brand-cyan"> *</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onRating(n)}
                className={cn(
                  "h-10 w-10 rounded-xl border text-sm font-medium tabular-nums transition-all",
                  rating === n
                    ? "border-transparent bg-gradient-to-br from-brand-cyan to-brand-violet text-ink"
                    : "border-line bg-ink/40 text-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {n}
              </button>
            );
          })}
        </div>

        <label className="mt-5 flex flex-col gap-1.5">
          <span className="text-sm text-muted">Comentarios o ajustes (opcional)</span>
          <textarea
            value={comments}
            onChange={(e) => onComments(e.target.value)}
            rows={3}
            placeholder="¿Qué cambiarías o sumarías a esta visión?"
            className="rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2"
          />
        </label>
      </div>
    </div>
  );
}
