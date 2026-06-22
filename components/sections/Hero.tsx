"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { QuoteButton } from "../ui/QuoteButton";
import { PlayIcon, BoltIcon } from "../icons";
import { QUOTE } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 md:pt-40">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.28),transparent_60%)] blur-2xl" />
        <div className="absolute right-[10%] top-[20%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.22),transparent_60%)] blur-3xl" />
        <div className="absolute left-[8%] top-[35%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.2),transparent_60%)] blur-3xl" />
      </div>

      <div className="container-x">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium tracking-tight text-muted backdrop-blur">
              <BoltIcon className="h-3.5 w-3.5 text-brand-cyan" />
              Ejecución completa en 72 horas
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease }}
            className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl md:text-7xl"
          >
            Tu negocio listo en{" "}
            <span className="text-gradient">72 horas.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease }}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted md:text-lg"
          >
            Web, plataforma, marca y estrategia. Todo lo necesario para lanzar tu
            proyecto y empezar a vender en solo 72 horas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <QuoteButton
              label={QUOTE.labelShort}
              size="lg"
              className="w-full sm:w-auto"
            />
            <Button href="#proceso" variant="secondary" size="lg" className="w-full sm:w-auto">
              <PlayIcon className="h-4 w-4 text-brand-cyan" />
              Ver cómo funciona
            </Button>
          </motion.div>
        </div>

        {/* Isologo protagonist */}
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease }}
      className="relative mx-auto mt-16 flex max-w-4xl justify-center md:mt-20"
    >
      {/* Speed lines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent"
            style={{ top: `${38 + i * 9}%`, width: `${60 - i * 6}%`, right: "62%" }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: [0, 0.8, 0], x: [-10, -90] }}
            transition={{
              duration: 2.2 + i * 0.3,
              delay: i * 0.25,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <div className="relative">
        {/* Glow halo */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 scale-125 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.35),transparent_65%)] blur-2xl"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="glass relative overflow-hidden rounded-[32px] p-3 glow-violet"
        >
          <div className="rounded-[24px] bg-ink-soft p-8 sm:p-12">
            <Image
              src="/logo.png"
              alt="Isologo de RUN72"
              width={520}
              height={520}
              priority
              className="h-auto w-[260px] sm:w-[360px] md:w-[440px]"
            />
          </div>

          {/* Floating status chips */}
          <FloatingChip
            className="left-3 top-6 sm:left-4 sm:top-10"
            dot="bg-brand-cyan"
            label="Día 1 · Estrategia"
            delay={0.6}
          />
          <FloatingChip
            className="right-3 top-1/2 sm:right-5"
            dot="bg-brand-blue"
            label="Día 2 · Diseño + Dev"
            delay={0.9}
          />
          <FloatingChip
            className="bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8"
            dot="bg-brand-violet"
            label="Día 3 · Lanzamiento"
            delay={1.2}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function FloatingChip({
  className,
  dot,
  label,
  delay,
}: {
  className: string;
  dot: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease }}
      className={`absolute z-10 flex items-center gap-2 rounded-full border border-line bg-ink/80 px-3 py-1.5 text-xs font-medium text-fg backdrop-blur ${className}`}
    >
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${dot}`} />
      {label}
    </motion.div>
  );
}
