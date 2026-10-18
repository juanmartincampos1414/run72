import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.run72.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // /mapa/ejemplo es público; el resto de /mapa/ son privados.
      allow: ["/", "/mapa/ejemplo"],
      // robots no sustituye autenticación; solo evita indexar rutas no públicas.
      disallow: ["/admin", "/hub", "/pago", "/cotizar", "/proyecto/", "/mapa/", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
