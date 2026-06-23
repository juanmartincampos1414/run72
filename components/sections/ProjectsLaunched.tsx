"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "../ui/SectionHeading";
import { BoltIcon } from "../icons";
import { PROJECTS, type Project } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

export function ProjectsLaunched() {
  return (
    <section id="proyectos" className="relative py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_65%)] blur-3xl"
      />
      <div className="container-x">
        <SectionHeading
          eyebrow="Portfolio"
          title={
            <>
              Proyectos <span className="text-gradient">lanzados.</span>
            </>
          }
          subtitle="Algunas de las empresas, plataformas y marcas que ayudamos a construir."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <motion.a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease }}
              className="ring-gradient group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface/40 transition-all duration-500 hover:-translate-y-1 hover:bg-surface-2/60"
            >
              <ProjectMockup project={project} />

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {project.name}
                  </h3>
                  <span className="mt-0.5 shrink-0 rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium tracking-tight text-muted">
                    {project.category}
                  </span>
                </div>

                <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted">
                  {project.description}
                </p>

                <div className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-gradient-to-r from-brand-cyan/[0.08] to-brand-violet/[0.08] px-3 py-1.5 text-xs font-medium text-fg">
                  <BoltIcon className="h-3.5 w-3.5 text-brand-cyan" />
                  Lanzado con RUN72
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Frase destacada */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="mx-auto mt-16 max-w-2xl text-balance text-center font-display text-xl font-medium leading-snug tracking-tight text-muted sm:text-2xl"
        >
          Todos comenzaron como una idea.{" "}
          <span className="text-gradient">Ejecutados por el equipo de RUN72.</span>
        </motion.p>
      </div>
    </section>
  );
}

/** Mockup de navegador con "screenshot" generado a partir del acento del proyecto. */
function ProjectMockup({ project }: { project: Project }) {
  const [from, to] = project.accent;
  const domain = project.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="relative border-b border-line bg-ink-soft p-3">
      <div className="overflow-hidden rounded-xl border border-line bg-ink">
        {/* Barra del navegador */}
        <div className="flex items-center gap-2 border-b border-line bg-white/[0.02] px-3 py-2">
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
          </span>
          <span className="ml-2 flex-1 truncate rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-faint">
            {domain}
          </span>
        </div>

        {/* "Screenshot" */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <div
            className="absolute inset-0 opacity-90 transition-transform duration-700 group-hover:scale-105"
            style={{
              background: `radial-gradient(120% 120% at 15% 10%, ${from}55, transparent 55%), radial-gradient(120% 120% at 90% 90%, ${to}55, transparent 55%), #0a0a0c`,
            }}
          />
          <div className="absolute inset-0 bg-grid opacity-[0.5] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" />

          {/* Wordmark del proyecto */}
          <div className="absolute inset-0 flex flex-col justify-center px-5">
            <span
              className="font-display text-2xl font-bold tracking-tight"
              style={{
                background: `linear-gradient(110deg, ${from}, ${to})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {project.name}
            </span>
            <span className="mt-2 h-1.5 w-24 rounded-full bg-white/15" />
            <span className="mt-1.5 h-1.5 w-16 rounded-full bg-white/10" />
            <span
              className="mt-4 inline-flex h-6 w-24 items-center rounded-md px-2 text-[9px] font-medium text-ink"
              style={{ background: `linear-gradient(110deg, ${from}, ${to})` }}
            >
              <span className="opacity-90">Ver más →</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
