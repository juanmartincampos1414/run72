import type { NextConfig } from "next";

// URL del deploy de cada demo (zona). Se puede sobrescribir con una env en Vercel.
const IPROT_ZONE_URL = process.env.IPROT_ZONE_URL ?? "https://iprot-demo.vercel.app";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [{ source: "/radar", destination: "/runit-scan", permanent: true }];
  },
  async rewrites() {
    return [
      // IPROT — la zona sirve con basePath /projects/iprot, así que se preserva el prefijo.
      { source: "/projects/iprot", destination: `${IPROT_ZONE_URL}/projects/iprot` },
      { source: "/projects/iprot/:path*", destination: `${IPROT_ZONE_URL}/projects/iprot/:path*` },
      // Para sumar otro proyecto: repetir con su slug y su *_ZONE_URL, y sumar una tarjeta en app/projects/page.tsx.
    ];
  },
};

export default nextConfig;
