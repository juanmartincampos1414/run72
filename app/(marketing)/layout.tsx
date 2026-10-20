import type { ReactNode } from "react";
import "../marketing.css";
import "../home-warm.css";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingTheme } from "@/components/marketing/MarketingTheme";

// Shell de las rutas públicas de RUN. No introduce <html>/<body>: hereda el
// root. El Home de raíz usa <MarketingShell> directamente (13.2). MarketingTheme
// activa el lenguaje cálido en las rutas ya migradas (Fase 3).
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingShell>
      <MarketingTheme />
      {children}
    </MarketingShell>
  );
}
