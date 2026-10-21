"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Activa el lenguaje editorial cálido (.run-warm) en las rutas ya migradas.
// Fase 2: Home (aparte). Fase 3 · grupo 1: Servicios, Soluciones, Trabajos +
// fichas, Contacto. Grupo 2: Express (landing), Blog, Labs, Cómo trabajamos.
// Pendiente: el cotizador y demás herramientas usan otro sistema de tokens
// (brand-*) y se migran en un pase propio, cuidando su usabilidad.
const WARM_ROUTES = [
  /^\/servicios(\/|$)/,
  /^\/soluciones(\/|$)/,
  /^\/trabajos(\/|$)/,
  /^\/contacto(\/|$)/,
  /^\/express(\/|$)/,
  /^\/blog(\/|$)/,
  /^\/labs(\/|$)/,
  /^\/como-trabajamos(\/|$)/,
];

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
