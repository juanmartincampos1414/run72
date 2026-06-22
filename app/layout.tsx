import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const SITE_URL = "https://run72.app";
const TITLE = "RUN72 — Tu negocio listo en 72 horas";
const DESCRIPTION =
  "Web, plataforma, marca y estrategia. RUN72 construye tu negocio digital completo y lo deja listo para vender en solo 72 horas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · RUN72",
  },
  description: DESCRIPTION,
  keywords: [
    "RUN72",
    "negocio digital en 72 horas",
    "desarrollo web rápido",
    "landing page",
    "ecommerce",
    "branding",
    "estrategia comercial",
    "startup",
  ],
  authors: [{ name: "RUN72" }],
  creator: "RUN72",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "RUN72",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/logo.png", width: 1240, height: 1240, alt: "RUN72" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "RUN72",
  description: DESCRIPTION,
  url: SITE_URL,
  slogan: "Tu negocio listo en 72 horas.",
  areaServed: "Global",
  serviceType: [
    "Desarrollo web",
    "Ecommerce",
    "Branding",
    "Estrategia comercial",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${display.variable}`}>
      <body className="bg-ink text-fg antialiased">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Saltar al contenido
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
