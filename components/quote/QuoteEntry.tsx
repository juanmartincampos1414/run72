"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";
import { QuoteConfigurator } from "./QuoteConfigurator";
import { ChatConcierge } from "./ChatConcierge";
import { ArrowRight, BoltIcon } from "../icons";

const ease = [0.16, 1, 0.3, 1] as const;

type Mode = "choose" | "form" | "chat";

export function QuoteEntry() {
  const [mode, setMode] = useState<Mode>("choose");

  if (mode === "form") return <QuoteConfigurator />;
  if (mode === "chat") return <ChatConcierge onBack={() => setMode("choose")} />;

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

      <main className="container-x py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            ¿Cómo preferís cotizar?
          </h1>
          <p className="mt-3 text-pretty text-muted">
            Las dos opciones llegan al mismo presupuesto, listo para pagar en minutos.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <OptionCard
              icon={<BoltIcon className="h-6 w-6" />}
              title="Cotización rápida"
              text="Completá el formulario guiado de 4 pasos y obtené tu precio al instante."
              cta="Usar formulario"
              onClick={() => setMode("form")}
            />
            <OptionCard
              icon={<ChatIcon className="h-6 w-6" />}
              title="Hablar con un asistente"
              text="Contanos qué querés construir y nuestro asistente arma la propuesta por vos."
              cta="Hablar con Claude"
              highlight
              onClick={() => setMode("chat")}
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
