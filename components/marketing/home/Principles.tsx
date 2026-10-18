import { HOME } from "@/lib/marketing/content";
import { WordReveal } from "@/components/marketing/WordReveal";

// Principio (5.2). Columna izquierda 380px + tres piezas a la derecha.
export function Principles() {
  const { lead, secondary, accent, steps } = HOME.principle;
  return (
    <section className="m-section m-principle" id="ideal">
      <div className="m-container m-principle-grid">
        <div className="m-principle-left">
          <WordReveal
            as="h2"
            className="m-principle-lead"
            lines={[lead]}
          />
          <p className="m-principle-secondary">{secondary}</p>
          <p className="m-principle-accent">{accent}</p>
        </div>
        <ol className="m-principle-steps">
          {steps.map((s) => (
            <li key={s.n} className="m-principle-step">
              <span className="m-mono m-principle-n">{s.n}</span>
              <h3 className="m-principle-steptitle">{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
