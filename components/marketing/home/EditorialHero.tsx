import { Fragment } from "react";
import { HOME } from "@/lib/marketing/content";
import { WordReveal } from "@/components/marketing/WordReveal";
import { GradientText } from "@/components/marketing/GradientText";
import { RunMark } from "@/components/marketing/RunMark";

// Hero del Inicio (5.1). 100svh, rótulo mono, H1 por líneas, última palabra
// con gradiente + icono RUN; bajada y enlace discreto a #servicios.
export function EditorialHero() {
  const { eyebrow, titleLines, gradientWord, subtitle, cta } = HOME.hero;
  const lastLine = titleLines[titleLines.length - 1];
  const before = lastLine.replace(gradientWord, "").trimEnd();

  const lines = [
    ...titleLines.slice(0, -1),
    <Fragment key="last-line">
      {before}{" "}
      <GradientText>{gradientWord}</GradientText>
      <RunMark className="m-hero-mark" size={88} />
    </Fragment>,
  ];

  return (
    <section className="m-hero" id="top">
      <div className="m-home-bg" aria-hidden="true" />
      <div className="m-container m-hero-inner">
        <p className="m-eyebrow m-hero-eyebrow">{eyebrow}</p>
        <WordReveal as="h1" className="m-hero-title" lines={lines} />
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
