import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { RadarQuiz } from "@/components/radar/RadarQuiz";

export const metadata: Metadata = {
  title: "Radar de IA — RUN72",
  description:
    "En 3 minutos, descubrí dónde está parado tu negocio con IA y qué hacer primero. Un diagnóstico de Runit, el asistente de RUN72.",
};

export default function RadarPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden pt-28 pb-24 md:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.22),transparent_60%)] blur-2xl" />
          <div className="absolute right-[6%] top-[25%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_60%)] blur-3xl" />
        </div>
        <div className="container-x">
          <RadarQuiz />
        </div>
      </main>
      <Footer />
    </>
  );
}
