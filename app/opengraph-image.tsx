import { ImageResponse } from "next/og";

export const alt = "RUN · Software a medida y agentes de IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG propio 1200×630 (§4.5). Recurso generado con la paleta RUN, no el logo
// cuadrado como único recurso social.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(1200px 500px at 50% -10%, rgba(137,96,255,0.35), rgba(24,172,255,0.12) 40%, #050508 72%, #000 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg,#18ACFF,#5583FF 48%,#8960FF 70%,#FFD873)",
            }}
          />
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em" }}>RUN</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 940 }}>
            Software a medida. Agentes de IA. Tu operación, conectada.
          </div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,0.7)", maxWidth: 900 }}>
            Sistemas, agentes e integraciones para la operación de tu empresa.
          </div>
        </div>

        <div style={{ fontSize: 22, color: "#9CA3AF", fontFamily: "monospace" }}>run72.app</div>
      </div>
    ),
    { ...size },
  );
}
