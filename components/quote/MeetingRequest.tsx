"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";
import { ArrowRight, CheckIcon } from "../icons";
import { PROJECT_TYPES, STAGES, OBJECTIVES_V2 } from "@/lib/configurator";

const ease = [0.16, 1, 0.3, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEETING_EMAIL = "hola@run72.app";
const STEP_LABELS = ["Qué necesitás", "Tu negocio", "La reunión"];

type Contact = { name: string; email: string; whatsapp: string; company: string };

type MeetingState = {
  needs: string[];
  businessWhat: string;
  stage: string | null;
  objective: string | null;
  explain: string;
  availability: string;
  contact: Contact;
};

const INITIAL: MeetingState = {
  needs: [],
  businessWhat: "",
  stage: null,
  objective: null,
  explain: "",
  availability: "",
  contact: { name: "", email: "", whatsapp: "", company: "" },
};

function buildMailto(s: MeetingState): string {
  const needLabels =
    s.needs.map((slug) => PROJECT_TYPES.find((p) => p.slug === slug)?.label ?? slug).join(", ") || "—";
  const stageLabel = STAGES.find((x) => x.value === s.stage)?.label ?? "—";
  const objLabel = OBJECTIVES_V2.find((x) => x.value === s.objective)?.label ?? "—";
  const lines = [
    "Solicitud de reunión — RUN72",
    "",
    `Nombre: ${s.contact.name}`,
    `Email: ${s.contact.email}`,
    s.contact.whatsapp ? `WhatsApp: ${s.contact.whatsapp}` : "",
    s.contact.company ? `Empresa: ${s.contact.company}` : "",
    "",
    `Qué necesita: ${needLabels}`,
    `Negocio: ${s.businessWhat}`,
    `Etapa: ${stageLabel}`,
    `Objetivo: ${objLabel}`,
    "",
    "Qué quiere explicar en la reunión:",
    s.explain,
    s.availability ? `\nDisponibilidad: ${s.availability}` : "",
  ].filter((l) => l !== "");
  const subject = `Solicitud de reunión — ${s.contact.name || "RUN72"}`;
  return `mailto:${MEETING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export function MeetingRequest({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<MeetingState>(INITIAL);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [sent, setSent] = useState(false);

  const LAST_STEP = STEP_LABELS.length - 1;

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return state.needs.length > 0;
      case 1:
        return state.businessWhat.trim().length > 1 && state.stage !== null && state.objective !== null;
      case 2:
        return (
          state.explain.trim().length > 3 &&
          state.contact.name.trim().length > 1 &&
          EMAIL_RE.test(state.contact.email.trim())
        );
      default:
        return false;
    }
  }, [step, state]);

  function go(delta: number) {
    setDir(delta);
    setStep((s) => Math.max(0, Math.min(LAST_STEP, s + delta)));
  }

  function toggleNeed(slug: string) {
    setState((s) => ({
      ...s,
      needs: s.needs.includes(slug) ? s.needs.filter((x) => x !== slug) : [...s.needs, slug],
    }));
  }

  function send() {
    if (typeof window !== "undefined") window.location.href = buildMailto(state);
    setSent(true);
  }

  if (sent) {
    return (
      <Shell onBack={onBack}>
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface/40 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-violet text-ink">
            <CheckIcon className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">Abrimos tu correo</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Te preparamos un email a <span className="text-fg">{MEETING_EMAIL}</span> con toda tu info.
            Revisá que se haya abierto y enviálo — coordinamos la reunión a la brevedad.
          </p>
          <a
            href={buildMailto(state)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.02]"
          >
            ¿No se abrió? Abrir mi correo
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Shell>
    );
  }

  return (
    <Shell onBack={onBack}>
      <div className="mx-auto max-w-2xl">
        <ProgressBar step={step} />

        <div className="relative mt-8 min-h-[340px] overflow-hidden">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            {step === 0 && (
              <Step title="¿Qué necesitás?" subtitle="Elegí uno o varios. Nos ayuda a preparar la reunión.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {PROJECT_TYPES.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      role="checkbox"
                      aria-checked={state.needs.includes(p.slug)}
                      onClick={() => toggleNeed(p.slug)}
                      className={`group flex flex-col gap-1 rounded-2xl border p-5 text-left transition-all duration-300 ${
                        state.needs.includes(p.slug)
                          ? "border-transparent bg-gradient-to-br from-brand-blue/[0.14] to-brand-violet/[0.08] ring-1 ring-brand-blue/50"
                          : "border-line bg-surface/40 hover:border-line-strong hover:bg-surface-2/60"
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-medium tracking-tight">{p.label}</span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                            state.needs.includes(p.slug)
                              ? "border-transparent bg-gradient-to-br from-brand-cyan to-brand-violet text-ink"
                              : "border-line-strong text-transparent"
                          }`}
                        >
                          <CheckIcon className="h-3 w-3" strokeWidth={3} />
                        </span>
                      </span>
                      <span className="text-sm leading-relaxed text-muted">{p.tagline}</span>
                    </button>
                  ))}
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step title="Contanos de tu negocio" subtitle="Solo lo esencial para llegar a la reunión con contexto.">
                <div className="grid gap-6">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-muted">
                      ¿Qué hace tu empresa?<span className="text-brand-cyan"> *</span>
                    </span>
                    <input
                      type="text"
                      value={state.businessWhat}
                      onChange={(e) => setState((s) => ({ ...s, businessWhat: e.target.value }))}
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
                          selected={state.stage === o.value}
                          onClick={() => setState((s) => ({ ...s, stage: o.value }))}
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
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step
                title="Coordinemos la reunión"
                subtitle="Contanos qué querés explicarnos y cómo contactarte. Te llega todo a nosotros por mail."
              >
                <div className="grid gap-6">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-muted">
                      ¿Qué querés explicarnos en la reunión?<span className="text-brand-cyan"> *</span>
                    </span>
                    <textarea
                      value={state.explain}
                      onChange={(e) => setState((s) => ({ ...s, explain: e.target.value }))}
                      placeholder="Contanos tu necesidad, el contexto y lo que esperás lograr."
                      rows={4}
                      className={`${inputCls} h-auto py-3 leading-relaxed`}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-muted">Disponibilidad para la reunión</span>
                    <input
                      type="text"
                      value={state.availability}
                      onChange={(e) => setState((s) => ({ ...s, availability: e.target.value }))}
                      placeholder="Ej: martes o jueves a la tarde (opcional)"
                      className={inputCls}
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre" required>
                      <input
                        type="text"
                        value={state.contact.name}
                        autoComplete="name"
                        placeholder="Tu nombre"
                        onChange={(e) => setState((s) => ({ ...s, contact: { ...s.contact, name: e.target.value } }))}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Email" required>
                      <input
                        type="email"
                        value={state.contact.email}
                        autoComplete="email"
                        placeholder="tu@email.com"
                        onChange={(e) => setState((s) => ({ ...s, contact: { ...s.contact, email: e.target.value } }))}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="WhatsApp">
                      <input
                        type="tel"
                        value={state.contact.whatsapp}
                        autoComplete="tel"
                        placeholder="Opcional"
                        onChange={(e) => setState((s) => ({ ...s, contact: { ...s.contact, whatsapp: e.target.value } }))}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Empresa">
                      <input
                        type="text"
                        value={state.contact.company}
                        autoComplete="organization"
                        placeholder="Opcional"
                        onChange={(e) => setState((s) => ({ ...s, contact: { ...s.contact, company: e.target.value } }))}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              </Step>
            )}
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? onBack() : go(-1))}
            className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-fg"
          >
            {step === 0 ? "Volver" : "Atrás"}
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
              onClick={send}
              disabled={!stepValid}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-40"
            >
              Enviar a hola@run72.app
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */

function Shell({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN72 — inicio">
            <Logo />
          </Link>
          <button type="button" onClick={onBack} className="text-sm text-muted transition-colors hover:text-fg">
            Volver
          </button>
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

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-pretty text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
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

const inputCls =
  "h-12 rounded-xl border border-line bg-surface/60 px-4 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted">
        {label}
        {required && <span className="text-brand-cyan"> *</span>}
      </span>
      {children}
    </label>
  );
}
