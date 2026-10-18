import localFont from "next/font/local";

// Switzer — titulares y cuerpo del sitio de marketing (RUN).
// Archivos propios con licencia en /public/fonts (ver LICENSES.md).
export const switzer = localFont({
  src: [
    { path: "../../public/fonts/switzer/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/switzer/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/switzer/Switzer-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/switzer/Switzer-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-run-display",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Geist Mono — navegación, numeración, categorías y metadatos.
export const geistMono = localFont({
  src: [
    { path: "../../public/fonts/geist-mono/GeistMono-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/geist-mono/GeistMono-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/geist-mono/GeistMono-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/geist-mono/GeistMono-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-run-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

// Clase que expone las variables de fuente al shell de marketing.
// --font-run-body apunta también a Switzer (sección 4.2).
export const marketingFontVars = `${switzer.variable} ${geistMono.variable}`;
