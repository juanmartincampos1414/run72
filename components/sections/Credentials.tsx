"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "../ui/SectionHeading";
import { CountUp } from "../ui/CountUp";
import { METRICS } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export function Credentials() {
  return (
    <section id="experiencia" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Experiencia"
          title={
            <>
              Experiencia <span className="text-gradient">ejecutando.</span>
            </>
          }
          subtitle="No improvisamos. Detrás de cada entrega en 72 horas hay más de una década construyendo negocios digitales en múltiples industrias."
        />

        {/* Dashboard-style metrics */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="ring-gradient relative mt-16 overflow-hidden rounded-3xl border border-line bg-surface/30 p-6 md:p-8"
        >
          <div
            aria-hidden
            className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16),transparent_60%)] blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_60%)] blur-2xl"
          />

          {/* Dashboard header */}
          <div className="relative mb-8 flex items-center justify-between border-b border-line pb-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-cyan/80" />
              <span className="text-sm font-medium text-muted">
                Track record · RUN72
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-faint">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Activo
            </span>
          </div>

          <div className="relative grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((metric) => (
              <div key={metric.label} className="bg-ink-soft p-6">
                <div className="font-display text-4xl font-semibold tracking-tight text-gradient md:text-5xl">
                  <CountUp value={metric.value} />
                </div>
                <p className="mt-2 text-sm leading-snug text-muted">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          <p className="relative mt-6 text-sm text-faint">
            Especialización en negocios digitales · Clientes en e-commerce, SaaS,
            servicios profesionales, retail y más.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
