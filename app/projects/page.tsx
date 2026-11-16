import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proyectos · RUN",
  description: "Demostraciones de producto construidas por RUN.",
};

type Demo = {
  slug: string;
  nombre: string;
  tagline: string;
  estado: "demo" | "en-desarrollo";
};

// Agregá acá cada nuevo proyecto. El slug debe coincidir con el rewrite de next.config.ts.
const DEMOS: Demo[] = [
  {
    slug: "iprot",
    nombre: "IPROT · Salud conectada",
    tagline: "Turnero, portal paciente y medicina laboral para un centro médico.",
    estado: "demo",
  },
];

export default function ProjectsHub() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(1000px 500px at 20% -10%, #15202b 0%, transparent 55%), #0a0f14",
        color: "#e8eef2",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        padding: "clamp(2rem, 6vw, 5rem) 1.25rem",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "0.72rem", color: "#5fd0bb", fontWeight: 700 }}>
          RUN · Proyectos
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "0.6rem 0 0.8rem", letterSpacing: "-0.02em" }}>
          Demostraciones de producto
        </h1>
        <p style={{ color: "#9fb2bc", maxWidth: 560, lineHeight: 1.55 }}>
          Plataformas funcionales que construimos para mostrar el alcance real de cada
          proyecto. Entornos de demostración con datos ficticios.
        </p>

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", marginTop: "2.5rem" }}>
          {DEMOS.map((d) => (
            <a
              key={d.slug}
              href={`/projects/${d.slug}`}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                background: "#10242d",
                border: "1px solid rgba(173,214,219,0.12)",
                borderRadius: 16,
                padding: "1.4rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{d.nombre}</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: d.estado === "demo" ? "#56e0c5" : "#e3b341", border: `1px solid ${d.estado === "demo" ? "rgba(86,224,197,0.4)" : "rgba(227,179,65,0.4)"}`, borderRadius: 999, padding: "0.15rem 0.55rem" }}>
                  {d.estado === "demo" ? "DEMO" : "EN DESARROLLO"}
                </span>
              </div>
              <p style={{ color: "#9fb2bc", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>{d.tagline}</p>
              <span style={{ color: "#56e0c5", fontSize: "0.85rem", fontWeight: 600, display: "inline-block", marginTop: "1rem" }}>
                Abrir demostración →
              </span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
