import type { MetadataRoute } from "next";
import { SOLUTIONS } from "@/lib/marketing/solutions";
import { ARTICLES } from "@/lib/marketing/articles";
import { getPublishedWorks } from "@/lib/marketing/cases";
import { VERTICALS } from "@/lib/marketing/verticals";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.run72.app";
// Fecha de contenido (no new Date() por request): editar al publicar cambios.
const CONTENT_DATE = new Date("2026-10-18");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/servicios",
    "/soluciones",
    "/trabajos",
    "/blog",
    "/labs",
    "/labs/operacion",
    "/labs/agente",
    "/labs/integraciones",
    "/como-trabajamos",
    "/contacto",
    "/runit-scan",
    "/mapa/ejemplo",
    "/privacidad",
    "/terminos",
    "/agents",
    "/llms.txt",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    lastModified: CONTENT_DATE,
    changeFrequency: path === "/" ? "monthly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  for (const s of SOLUTIONS) {
    entries.push({ url: `${BASE}/servicios/${s.slug}`, lastModified: CONTENT_DATE, priority: 0.8 });
  }
  for (const v of VERTICALS) {
    entries.push({ url: `${BASE}/soluciones/${v.slug}`, lastModified: CONTENT_DATE, priority: 0.7 });
  }
  for (const a of ARTICLES) {
    entries.push({ url: `${BASE}/blog/${a.slug}`, lastModified: new Date(a.dateISO), priority: 0.6 });
  }
  for (const w of getPublishedWorks()) {
    entries.push({ url: `${BASE}/trabajos/${w.slug}`, lastModified: CONTENT_DATE, priority: 0.6 });
  }

  // Excluye explícitamente: /hub, /admin, /pago, /cotizar, /proyecto/[id],
  // mapas privados /mapa/[id] y previews (no se listan).
  return entries;
}
