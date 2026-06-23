"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import type { Faq } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

export function Faq() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs ?? []))
      .catch(() => setFaqs([]));
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Preguntas <span className="text-gradient">frecuentes.</span>
            </>
          }
          subtitle="Lo que necesitás saber antes de lanzar tu proyecto con RUN72."
        />

        <Reveal>
          <div className="mx-auto mt-12 max-w-2xl divide-y divide-line rounded-3xl border border-line bg-surface/40 px-6">
            {faqs.map((f) => {
              const isOpen = open === f.id;
              return (
                <div key={f.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium tracking-tight">{f.question}</span>
                    <span
                      className={`shrink-0 text-xl text-muted transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-8 text-pretty leading-relaxed text-muted">
                          {f.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
