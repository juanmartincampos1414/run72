import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const META_PIXEL_ID = "1125099563395216";

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
const TITLE = "RUN72 — Tu idea lista en 72 horas";
const DESCRIPTION =
  "Web, plataforma, marca, estrategia y automatización con IA. RUN72 ejecuta lo que tu negocio necesita —estés arrancando, creciendo o escalando— y te lo entrega funcionando en 72 horas.";

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
  other: {
    "facebook-domain-verification": "h0xe0a7tp2hivyyflukxgxhlf3480a",
  },
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
  slogan: "Tu necesidad lista en 72 horas.",
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
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
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
