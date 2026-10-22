import type { Metadata } from "next";
import "../marketing.css";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { RadarQuiz } from "@/components/radar/RadarQuiz";

export const metadata: Metadata = {
  title: "Runit Scan — Diagnóstico de IA",
  description:
    "En 2 minutos, descubrí dónde está parado tu negocio con IA y por dónde empezar. Un diagnóstico guiado por Runit, el asistente de RUN.",
};

export default function RadarPage() {
  return (
    <MarketingShell withSmooth={false} theme="warm">
      <div className="run-warm-tool relative overflow-hidden pt-28 pb-24 md:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,106,42,0.18),transparent_60%)] blur-2xl" />
          <div className="absolute right-[6%] top-[25%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(255,138,76,0.14),transparent_60%)] blur-3xl" />
        </div>
        <div className="container-x">
          <RadarQuiz />
        </div>
      </div>
    </MarketingShell>
  );
}
