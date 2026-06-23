"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Faq } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

export function FaqAccordion() {
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
    <div className="mt-5 rounded-3xl border border-line bg-surface/30 p-6">
      <h2 className="font-display text-lg font-semibold tracking-tight">Preguntas frecuentes</h2>
      <div className="mt-4 divide-y divide-line">
        {faqs.map((f) => {
          const isOpen = open === f.id;
          return (
            <div key={f.id} className="py-1">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="flex w-full items-center justify-between gap-4 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium">{f.question}</span>
                <span
                  className={`shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
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
                    <p className="pb-4 pr-8 text-sm leading-relaxed text-muted">{f.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
