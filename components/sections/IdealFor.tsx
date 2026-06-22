"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "../ui/SectionHeading";
import { Icon } from "../icons";
import { IDEAL_FOR } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export function IdealFor() {
  return (
    <section id="ideal" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Ideal para"
          title={
            <>
              Pensado para quienes necesitan{" "}
              <span className="text-gradient">avanzar rápido.</span>
            </>
          }
          subtitle="Si tu prioridad es estar en el mercado cuanto antes, este proceso fue diseñado para vos."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IDEAL_FOR.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease }}
              className="ring-gradient group relative flex items-start gap-4 rounded-2xl border border-line bg-surface/40 p-5 transition-colors duration-500 hover:bg-surface-2/60"
            >
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-brand-cyan transition-colors duration-500 group-hover:text-brand-violet">
                <Icon name={card.icon} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium tracking-tight">{card.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
