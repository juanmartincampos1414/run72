"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Activa el lenguaje editorial cálido (.run-warm) en las rutas ya migradas
// (Fase 2: Home se maneja aparte; Fase 3: Servicios, Soluciones, Trabajos +
// fichas, Contacto). El resto del sitio (Blog, Labs, Express, Cómo trabajamos)
// conserva su tema anterior hasta su fase. Centralizado en el layout (marketing).
const WARM_ROUTES = [/^\/servicios(\/|$)/, /^\/soluciones(\/|$)/, /^\/trabajos(\/|$)/, /^\/contacto(\/|$)/];

export function MarketingTheme() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.querySelector(".marketing");
    if (!root) return;
    const warm = WARM_ROUTES.some((re) => re.test(pathname));
    root.classList.toggle("run-warm", warm);
  }, [pathname]);
  return null;
}
