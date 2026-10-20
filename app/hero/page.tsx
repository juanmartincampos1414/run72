import type { Metadata } from "next";
import "./hero-v2.css";
import { marketingFontVars } from "@/lib/marketing/fonts";
import { HeroV2 } from "@/components/marketing/hero-v2/HeroV2";

// Ruta AISLADA para revisar la propuesta de hero (no toca el Home ni ninguna otra
// página). Preview de la escena + su movimiento. noindex.
export const metadata: Metadata = {
  title: "RUN · Hero (propuesta)",
  robots: { index: false, follow: false },
};

export default function HeroProposalPage() {
  return (
    <main className={`hv2-root ${marketingFontVars}`}>
      <HeroV2 />
    </main>
  );
}
