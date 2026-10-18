import type { Metadata } from "next";
import { GradientText } from "@/components/marketing/GradientText";
import { getPublishedWorks } from "@/lib/marketing/cases";
import { WorksBrowser } from "./WorksBrowser";
import "./trabajos.css";

export const metadata: Metadata = {
  title: "Trabajos",
  description:
    "Ejemplos de software a medida, agentes de IA e integraciones. Tres demos conceptuales propias con datos ficticios, cada una con su demo funcional en Labs.",
  alternates: { canonical: "/trabajos" },
};

export default function TrabajosPage() {
  const works = getPublishedWorks();

  return (
    <div className="work-page">
      <section className="m-container work-index-head">
        <h1 className="work-index-title">
          <GradientText>Trabajos</GradientText>
        </h1>
        <p className="work-index-lede">
          Tres ejemplos propios, hechos con datos ficticios, que muestran cómo pensamos un sistema, un agente y una
          integración. Cada uno tiene su demo funcional en Labs.
        </p>
      </section>

      <section className="m-container work-index-list" aria-label="Listado de trabajos">
        <WorksBrowser works={works} />
      </section>
    </div>
  );
}
