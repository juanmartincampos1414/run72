import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { CheckIcon } from "../icons";
import { OWNERSHIP_TEXT, OWNERSHIP_TITLE, TRUST_MESSAGE, DELIVERABLES } from "@/lib/content";

export function Ownership() {
  return (
    <section id="propiedad" className="relative py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Sin dependencia"
          title={
            <>
              Tu proyecto es <span className="text-gradient">100% tuyo.</span>
            </>
          }
          subtitle={OWNERSHIP_TEXT}
        />

        <Reveal>
          <div className="ring-gradient relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-line bg-surface/40 p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_60%)] blur-2xl"
            />
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-violet text-ink">
                <CheckIcon className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <p className="text-pretty text-base leading-relaxed text-muted">
                {TRUST_MESSAGE}
              </p>
            </div>

            <div className="mt-7 border-t border-line pt-7">
              <p className="text-sm font-medium tracking-tight">Qué recibís al finalizar</p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {DELIVERABLES.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" strokeWidth={2.5} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
