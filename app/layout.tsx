import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ConsentManager } from "@/components/marketing/ConsentManager";

// Fuentes legacy: se conservan para módulos operativos (Hub, cotizador, admin).
// El marketing usa Switzer/Geist Mono vía su propio shell.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["500", "600", "700"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.run72.app";
const TITLE = "RUN · Software a medida y agentes de IA";
const DESCRIPTION =
  "Desarrollamos software a medida, agentes de inteligencia artificial e integraciones para mejorar la operación de tu empresa. Contanos qué necesitás resolver.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · RUN" },
  description: DESCRIPTION,
  keywords: [
    "RUN",
    "software a medida",
    "agentes de IA",
    "inteligencia artificial para empresas",
    "integraciones",
    "automatización",
    "desarrollo de software",
  ],
  authors: [{ name: "RUN" }],
  creator: "RUN",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "RUN",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  robots: { index: true, follow: true },
  other: {
    "facebook-domain-verification": "h0xe0a7tp2hivyyflukxgxhlf3480a",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RUN",
  description: DESCRIPTION,
  url: SITE_URL,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hola@run72.app",
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Software a medida" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Agentes de inteligencia artificial" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Integraciones y automatización" } },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${display.variable}`}>
      <body className="bg-ink text-fg antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Saltar al contenido
        </a>
        {children}
        {/* Consentimiento + Pixel de Meta (solo con consentimiento de Marketing) */}
        <ConsentManager />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
