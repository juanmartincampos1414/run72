"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "../ui/SectionHeading";
import { STEPS } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export function HowItWorks() {
  return (
    <section id="proceso" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Cómo funciona"
          title={
            <>
              72 horas. <span className="text-gradient">Tres pasos.</span>
            </>
          }
          subtitle="Un proceso lineal y sin esperas. Cada día tiene un objetivo claro y un entregable concreto."
        />

        <div className="relative mt-16">
          {/* Progress track */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[42px] hidden h-px md:block"
          >
            <div className="relative h-full bg-line">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-violet"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.6, ease }}
              />
            </div>
          </div>

          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.day}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.25, ease }}
                className="relative flex flex-col items-start"
              >
                {/* Node */}
                <div className="relative z-10 mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-line-strong bg-ink">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-violet/20" />
                  <span className="relative font-display text-lg font-semibold text-gradient">
                    {i + 1}
                  </span>
                </div>

                <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  {step.day}
                </span>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
