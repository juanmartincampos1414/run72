import type { Metadata } from "next";
import Link from "next/link";
import { SOLUTIONS } from "@/lib/marketing/solutions";
import { ARTICLES } from "@/lib/marketing/articles";
import { getPublishedWorks } from "@/lib/marketing/cases";

export const metadata: Metadata = {
  title: "Índice de páginas",
  description: "Índice público de las páginas de RUN y enlace a /llms.txt.",
  alternates: { canonical: "/agents" },
};

// /agents — índice público simple (§18.2). Solo contenido publicado y canónico.
export default function AgentsIndex() {
  const mono: React.CSSProperties = { fontFamily: "var(--font-run-mono), ui-monospace, monospace" };
  const link: React.CSSProperties = { color: "#9db7ff", textDecoration: "none" };
  return (
    <main id="main-content" style={{ minHeight: "100svh", background: "#000", color: "#fff", padding: "48px 20px", ...mono }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>RUN · índice de páginas</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 8 }}>
          Software a medida, agentes de IA e integraciones. Versión legible en{" "}
          <Link href="/llms.txt" style={link}>/llms.txt</Link>.
        </p>

        <h2 style={{ fontSize: 13, color: "#9CA3AF", marginTop: 28, textTransform: "uppercase", letterSpacing: "0.08em" }}>Servicios</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 6, marginTop: 10, fontSize: 14 }}>
          <li><Link href="/servicios" style={link}>/servicios</Link></li>
          {SOLUTIONS.map((s) => <li key={s.slug}><Link href={`/servicios/${s.slug}`} style={link}>/servicios/{s.slug}</Link></li>)}
        </ul>

        <h2 style={{ fontSize: 13, color: "#9CA3AF", marginTop: 24, textTransform: "uppercase", letterSpacing: "0.08em" }}>Trabajos</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 6, marginTop: 10, fontSize: 14 }}>
          <li><Link href="/trabajos" style={link}>/trabajos</Link></li>
          {getPublishedWorks().map((w) => <li key={w.slug}><Link href={`/trabajos/${w.slug}`} style={link}>/trabajos/{w.slug}</Link></li>)}
        </ul>

        <h2 style={{ fontSize: 13, color: "#9CA3AF", marginTop: 24, textTransform: "uppercase", letterSpacing: "0.08em" }}>Labs</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 6, marginTop: 10, fontSize: 14 }}>
          <li><Link href="/labs" style={link}>/labs</Link></li>
          <li><Link href="/labs/operacion" style={link}>/labs/operacion</Link></li>
          <li><Link href="/labs/agente" style={link}>/labs/agente</Link></li>
          <li><Link href="/labs/integraciones" style={link}>/labs/integraciones</Link></li>
        </ul>

        <h2 style={{ fontSize: 13, color: "#9CA3AF", marginTop: 24, textTransform: "uppercase", letterSpacing: "0.08em" }}>Blog</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 6, marginTop: 10, fontSize: 14 }}>
          <li><Link href="/blog" style={link}>/blog</Link></li>
          {ARTICLES.map((a) => <li key={a.slug}><Link href={`/blog/${a.slug}`} style={link}>/blog/{a.slug}</Link></li>)}
        </ul>

        <h2 style={{ fontSize: 13, color: "#9CA3AF", marginTop: 24, textTransform: "uppercase", letterSpacing: "0.08em" }}>Más</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 6, marginTop: 10, fontSize: 14 }}>
          <li><Link href="/como-trabajamos" style={link}>/como-trabajamos</Link></li>
          <li><Link href="/contacto" style={link}>/contacto</Link></li>
          <li><Link href="/runit-scan" style={link}>/runit-scan</Link></li>
          <li><Link href="/mapa/ejemplo" style={link}>/mapa/ejemplo</Link></li>
        </ul>
      </div>
    </main>
  );
}
