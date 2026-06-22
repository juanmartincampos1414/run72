"use client";

import { motion } from "framer-motion";
import { QuoteButton } from "../ui/QuoteButton";

const ease = [0.16, 1, 0.3, 1] as const;

export function FinalCTA() {
  return (
    <section id="cotizar" className="relative py-24 md:py-32">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-[36px] border border-line bg-gradient-to-b from-surface/60 to-ink p-8 text-center md:p-16"
        >
          {/* Glow + grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.3),transparent_60%)] blur-2xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Tu proyecto puede estar funcionando en{" "}
              <span className="text-gradient">72 horas.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted md:text-lg">
              Contanos qué querés construir y prepararemos una propuesta
              personalizada.
            </p>

            <div className="mt-9 flex justify-center">
              <QuoteButton size="lg" className="w-full sm:w-auto" />
            </div>

            <p className="mt-6 text-xs text-faint">
              Respuesta en menos de 24 horas · Sin compromiso
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
