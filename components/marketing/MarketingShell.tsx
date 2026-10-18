import type { ReactNode } from "react";
import { marketingFontVars } from "@/lib/marketing/fonts";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { RunitLauncher } from "./RunitLauncher";

// Shell visual de RUN (marketing). Aplica el namespace .marketing, las
// variables de fuente propias y monta header/footer. Lo usan tanto las rutas
// del grupo (marketing) como el Home de raíz, sin mover URLs ni duplicar
// <html>/<body> (sección 13.2).
export function MarketingShell({ children, withFooter = true }: { children: ReactNode; withFooter?: boolean }) {
  return (
    <div className={`marketing ${marketingFontVars}`}>
      <MarketingHeader />
      <main id="main-content">{children}</main>
      {withFooter && <MarketingFooter />}
      <RunitLauncher />
    </div>
  );
}
