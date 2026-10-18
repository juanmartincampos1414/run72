import type { ReactNode } from "react";
import "../marketing.css";
import { MarketingShell } from "@/components/marketing/MarketingShell";

// Shell de las rutas públicas de RUN. No introduce <html>/<body>: hereda el
// root. El Home de raíz usa <MarketingShell> directamente (13.2).
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
