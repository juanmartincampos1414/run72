import "./marketing.css";
import "./hero/hero-v2.css";
import "./home-warm.css";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { HomeHero } from "@/components/marketing/home/HomeHero";
import { Principles } from "@/components/marketing/home/Principles";
import { CapabilitiesGrid } from "@/components/marketing/home/CapabilitiesGrid";
import { StickyProcess } from "@/components/marketing/home/StickyProcess";
import { WorkRows } from "@/components/marketing/home/WorkRows";
import { ExperienceBand } from "@/components/marketing/home/ExperienceBand";
import { ClosingCTA } from "@/components/marketing/home/ClosingCTA";

// Home de RUN (Fase 2): hero 3D aprobado + secciones en el lenguaje editorial
// cálido (theme="warm"). Orden: Hero → Principio → Capacidades → Proceso →
// Trabajos → Cierre → Footer. Mismo shell que las rutas (marketing); la URL "/"
// no cambia. El resto del sitio sigue con su tema anterior (solo la Home es warm).
export default function Home() {
  return (
    <MarketingShell theme="warm">
      <HomeHero />
      <Principles />
      <CapabilitiesGrid />
      <StickyProcess />
      <WorkRows />
      <ExperienceBand />
      <ClosingCTA />
    </MarketingShell>
  );
}
