import "./marketing.css";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { EditorialHero } from "@/components/marketing/home/EditorialHero";
import { Principles } from "@/components/marketing/home/Principles";
import { CapabilitiesGrid } from "@/components/marketing/home/CapabilitiesGrid";
import { StickyProcess } from "@/components/marketing/home/StickyProcess";
import { WorkRows } from "@/components/marketing/home/WorkRows";
import { ClosingCTA } from "@/components/marketing/home/ClosingCTA";

// Home de RUN (sección 5). Orden obligatorio:
// Hero → Principio → Capacidades → Proceso → Trabajos → Cierre → Footer.
// Usa el mismo shell que las rutas (marketing) sin mover la URL "/".
export default function Home() {
  return (
    <MarketingShell>
      <EditorialHero />
      <Principles />
      <CapabilitiesGrid />
      <StickyProcess />
      <WorkRows />
      <ClosingCTA />
    </MarketingShell>
  );
}
