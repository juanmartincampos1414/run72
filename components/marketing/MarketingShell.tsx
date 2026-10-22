import type { ReactNode } from "react";
import "../../app/home-warm.css";
import { marketingFontVars } from "@/lib/marketing/fonts";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { RunitLauncher } from "./RunitLauncher";
import { SmoothScroll } from "./SmoothScroll";
import { AttributionTracker } from "./AttributionTracker";

// Shell visual de RUN (marketing). Aplica el namespace .marketing, las
// variables de fuente propias y monta header/footer. Lo usan tanto las rutas
// del grupo (marketing) como el Home de raíz, sin mover URLs ni duplicar
// <html>/<body> (sección 13.2).
// En páginas-herramienta (Scan, Mapa) se desactiva el smooth-scroll (Lenis
// interfiere con el wheel de React Flow) y, si hace falta, el launcher.
export function MarketingShell({
  children,
  withFooter = true,
  withSmooth = true,
  withRunit = true,
  theme,
}: {
  children: ReactNode;
  withFooter?: boolean;
  withSmooth?: boolean;
  withRunit?: boolean;
  /** "warm": lenguaje editorial cálido (hero aprobado). Solo donde se integra. */
  theme?: "warm";
}) {
  return (
    <div className={`marketing ${theme === "warm" ? "run-warm" : ""} ${marketingFontVars}`}>
      {withSmooth && <SmoothScroll />}
      <AttributionTracker />
      <MarketingHeader />
      <main id="main-content">{children}</main>
      {withFooter && <MarketingFooter />}
      {withRunit && <RunitLauncher />}
    </div>
  );
}
