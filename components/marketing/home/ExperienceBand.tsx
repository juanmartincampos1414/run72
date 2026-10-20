import { HOME } from "@/lib/marketing/content";

// Franja "Experiencia detrás de RUN": tres cifras grandes en crema, etiquetas
// discretas, separadores finos. Sin tarjeta, sin gradientes, sin contador animado.
// Representa la experiencia acumulada del equipo, no la antigüedad de la marca.
export function ExperienceBand() {
  const { title, stats } = HOME.experience;
  return (
    <section className="m-section exp" aria-labelledby="exp-title">
      <div className="m-container">
        <p className="m-eyebrow" id="exp-title">{title}</p>
        <dl className="exp-grid">
          {stats.map((s) => (
            <div key={s.label} className="exp-item">
              <dt className="exp-value">{s.value}</dt>
              <dd className="exp-label m-mono">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
