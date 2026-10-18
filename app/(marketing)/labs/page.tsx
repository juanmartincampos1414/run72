import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { GradientText } from "@/components/marketing/GradientText";
import { LABS_INDEX } from "@/lib/marketing/labs";
import "./labs.css";

export const metadata: Metadata = {
  title: LABS_INDEX.meta.title,
  description: LABS_INDEX.meta.description,
  alternates: { canonical: "/labs" },
  openGraph: {
    title: LABS_INDEX.meta.title,
    description: LABS_INDEX.meta.description,
    url: "/labs",
  },
};

export default function LabsPage() {
  return (
    <div className="lab-page">
      <div className="m-container">
        <header className="lab-head">
          <p className="m-eyebrow">{LABS_INDEX.eyebrow}</p>
          <h1 className="lab-h1">
            {LABS_INDEX.h1Lead} <GradientText>{LABS_INDEX.h1Accent}</GradientText>
          </h1>
          <p className="lab-lede">{LABS_INDEX.bajada}</p>
        </header>

        <ul className="lab-cards-grid">
          {LABS_INDEX.cards.map((c) => (
            <li key={c.id}>
              <Link href={c.href} className="lab-index-card m-arrow-host">
                <span className="m-eyebrow">{c.kind}</span>
                <span className="lab-index-title">{c.title}</span>
                <p className="lab-index-text">{c.text}</p>
                <span className="lab-index-cta">
                  {c.cta}
                  <AnimatedArrow />
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={LABS_INDEX.map.href} className="lab-index-card lab-index-card--map m-arrow-host">
              <span className="m-eyebrow">Mapa</span>
              <span className="lab-index-title">{LABS_INDEX.map.title}</span>
              <p className="lab-index-text">{LABS_INDEX.map.text}</p>
              <span className="lab-index-cta">
                Abrir el mapa
                <AnimatedArrow />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
