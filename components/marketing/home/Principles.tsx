import { HOME } from "@/lib/marketing/content";
import { WordReveal } from "@/components/marketing/WordReveal";

// Principio (5.2). Tesis de RUN: una sola declaración, sin repetir los pasos del
// proceso (esos viven en la sección "Cómo trabajamos"). Aire y jerarquía.
export function Principles() {
  const { lead, secondary, accent } = HOME.principle;
  return (
    <section className="m-section m-principle" id="ideal">
      <div className="m-container m-principle-block">
        <WordReveal as="h2" className="m-principle-lead" lines={[lead]} />
        <p className="m-principle-secondary">
          {secondary} <span className="m-principle-accent">{accent}</span>
        </p>
      </div>
    </section>
  );
}
