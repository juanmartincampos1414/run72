import { HOME } from "@/lib/marketing/content";
import { GradientText } from "@/components/marketing/GradientText";
import { HeroScene } from "@/components/marketing/HeroScene";

// Hero del Inicio. El titular es ESTÁTICO: se muestra completo desde el primer
// frame, sin depender de ninguna animación de entrada (auditoría). El
// movimiento vive en la escena del fondo. La bajada y el enlace también estáticos.
export function EditorialHero() {
  const { eyebrow, titleLines, gradientWord, subtitle, cta } = HOME.hero;
  const lastLine = titleLines[titleLines.length - 1];
  const before = lastLine.replace(gradientWord, "").trimEnd();
  const head = titleLines.slice(0, -1);

  return (
    <section className="m-hero" id="top">
      <HeroScene />
      <div className="m-container m-hero-inner">
        <p className="m-eyebrow m-hero-eyebrow">{eyebrow}</p>
        <h1 className="m-hero-title">
          {head.map((line) => (
            <span key={line} className="m-hero-line">{line}</span>
          ))}
          <span className="m-hero-line">
            {before}{" "}
            <GradientText>{gradientWord}</GradientText>
          </span>
        </h1>
        <p className="m-hero-sub">{subtitle}</p>
        <a href={cta.href} className="m-hero-link m-arrow-host">
          {cta.label}
          <span className="m-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </a>
      </div>
    </section>
  );
}
