"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RunWordmarkSvg } from "@/components/marketing/RunWordmarkSvg";
import { QuoteConfigurator } from "./QuoteConfigurator";
import { ChatConcierge } from "./ChatConcierge";
import { MeetingRequest } from "./MeetingRequest";
import { ArrowRight, BoltIcon } from "../icons";
import type { Service, Microservice } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

type Mode = "choose" | "form" | "chat" | "meeting";

export function QuoteEntry({ initialServices, initialMicros }: { initialServices?: Service[]; initialMicros?: Microservice[] } = {}) {
  const [mode, setMode] = useState<Mode>("choose");

  if (mode === "form") return <QuoteConfigurator initialServices={initialServices} initialMicros={initialMicros} />;
  if (mode === "chat") return <ChatConcierge onBack={() => setMode("choose")} />;
  if (mode === "meeting") return <MeetingRequest onBack={() => setMode("choose")} />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN — inicio">
            <RunWordmarkSvg className="h-6 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
            Volver al sitio
          </Link>
        </div>
      </header>

      <main className="container-x py-16 md:py-24">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto max-w-5xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-cyan">RUN Express</p>
          <h1 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Cotizá tu producto RUN Express
          </h1>
          <p className="mt-3 text-pretty text-muted">
            RUN Express son productos digitales con alcance y precio definidos (webs, ecommerce,
            identidad). Cotizá al instante, hablá con Runit o coordiná una reunión.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-faint">
            ¿Tu proyecto es software a medida, un agente de IA o integraciones? Eso necesita
            diagnóstico y alcance personalizado.{" "}
            <Link href="/contacto" className="text-brand-cyan hover:underline">Contanos qué necesitás resolver →</Link>
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <OptionCard
              icon={<BoltIcon className="h-6 w-6" />}
              title="Cotización rápida"
              text="Completá el formulario guiado de 4 pasos y obtené tu precio al instante."
              cta="Usar formulario"
              onClick={() => setMode("form")}
            />
            <OptionCard
              icon={<ChatIcon className="h-6 w-6" />}
              title="Hablar con Runit"
              text="Runit, nuestro asistente de IA, arma la propuesta con vos en una charla."
              cta="Hablar con Runit"
              highlight
              onClick={() => setMode("chat")}
            />
            <OptionCard
              icon={<MeetIcon className="h-6 w-6" />}
              title="Necesito una reunión"
              text="Para proyectos que se explican mejor en persona. Completás un proceso guiado y coordinamos una reunión — nos llega todo por mail."
              cta="Coordinar una reunión"
              onClick={() => setMode("meeting")}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function OptionCard({
  icon,
  title,
  text,
  cta,
  highlight,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: string;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-start gap-4 rounded-3xl border p-7 text-left transition-all duration-300 hover:-translate-y-1 ${
        highlight
          ? "border-transparent bg-gradient-to-br from-brand-blue/[0.12] to-brand-violet/[0.08] ring-1 ring-brand-blue/40"
          : "border-line bg-surface/40 hover:bg-surface-2/60"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-violet text-ink">
        {icon}
      </span>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
      </div>
      <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-fg">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" strokeLinejoin="round" />
      <path d="M8.5 11h7M8.5 14h4" strokeLinecap="round" />
    </svg>
  );
}

function MeetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="5" width="13" height="14" rx="2" />
      <path d="M16 10l5-3v10l-5-3" strokeLinejoin="round" />
    </svg>
  );
}
