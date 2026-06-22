import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { ArrowRight, BoltIcon } from "../icons";
import { TRADITIONAL_FLOW, RUN72_FLOW } from "@/lib/content";

export function Problem() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="El problema"
          title={
            <>
              Las ideas avanzan lento.{" "}
              <span className="text-gradient">Nosotros no.</span>
            </>
          }
          subtitle="Lanzar un negocio normalmente significa coordinar diseñadores, programadores, estrategas, marketers y proveedores. Semanas de reuniones antes de vender el primer producto. RUN72 resuelve todo en un único proceso de ejecución."
        />

        <div className="mx-auto mt-16 max-w-4xl space-y-5">
          {/* Traditional */}
          <Reveal>
            <div className="rounded-3xl border border-line bg-surface/40 p-6 md:p-7">
              <div className="mb-5 flex items-center gap-2 text-sm font-medium text-faint">
                <span className="h-2 w-2 rounded-full bg-faint/60" />
                Proceso tradicional
                <span className="ml-auto text-xs text-faint">semanas / meses</span>
              </div>
              <FlowRow steps={[...TRADITIONAL_FLOW]} muted />
            </div>
          </Reveal>

          {/* RUN72 */}
          <Reveal delay={1}>
            <div className="ring-gradient relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand-blue/[0.08] to-brand-violet/[0.05] p-6 md:p-7">
              <div
                aria-hidden
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.25),transparent_60%)] blur-2xl"
              />
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
                <BoltIcon className="h-4 w-4 text-brand-cyan" />
                Con RUN72
                <span className="ml-auto rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-fg">
                  72 horas
                </span>
              </div>
              <FlowRow steps={[...RUN72_FLOW]} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FlowRow({ steps, muted = false }: { steps: string[]; muted?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {steps.map((step, i) => {
        const highlight = !muted && step === "RUN72";
        return (
          <div key={step} className="flex items-center gap-2 md:gap-3">
            <span
              className={[
                "rounded-xl px-3.5 py-2 text-sm font-medium tracking-tight md:px-4 md:py-2.5",
                highlight
                  ? "bg-gradient-to-r from-brand-cyan to-brand-violet text-ink shadow-[0_8px_30px_-8px_rgba(99,102,241,0.7)]"
                  : muted
                    ? "border border-line bg-white/[0.02] text-faint"
                    : "border border-line bg-white/[0.04] text-fg",
              ].join(" ")}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight
                className={`h-4 w-4 shrink-0 ${muted ? "text-faint/50" : "text-brand-blue"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
