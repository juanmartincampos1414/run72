"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "../ui/SectionHeading";
import { Icon, CheckIcon } from "../icons";
import { SERVICES } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export function Services() {
  return (
    <section id="servicios" className="relative py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_65%)] blur-3xl"
      />
      <div className="container-x">
        <SectionHeading
          eyebrow="Servicios"
          title={
            <>
              Todo lo que necesitás para{" "}
              <span className="text-gradient">salir al mercado.</span>
            </>
          }
          subtitle="Un solo equipo ejecuta cada pieza de tu negocio digital, en paralelo y sin fricción entre proveedores."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="ring-gradient group relative flex flex-col rounded-3xl border border-line bg-surface/40 p-6 transition-all duration-500 hover:-translate-y-1 hover:bg-surface-2/60"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-gradient-to-br from-white/[0.08] to-transparent text-brand-cyan transition-colors duration-500 group-hover:text-brand-violet">
                <Icon name={service.icon} className="h-6 w-6" />
              </div>

              <h3 className="font-display text-lg font-semibold tracking-tight">
                {service.title}
              </h3>

              <ul className="mt-4 flex flex-col gap-2.5">
                {service.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-muted"
                  >
                    <CheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
