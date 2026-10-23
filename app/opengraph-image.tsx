import { ImageResponse } from "next/og";

export const alt = "RUN · Software a medida y agentes de IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG propio 1200×630 con la paleta de marca RUN (walnut / crema / ember), no el
// logo cuadrado como único recurso social. Al cambiar el contenido, Next genera
// una URL nueva (hash), lo que ayuda a que WhatsApp/Facebook re-lean la imagen.
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
            "radial-gradient(1200px 520px at 68% -8%, rgba(255,138,76,0.38), rgba(255,106,42,0.12) 40%, #140b05 72%, #0c0703 100%)",
          color: "#ffedd7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 36% 30%, #ffb27a, #ff6a2a 54%, #a3380f)",
              boxShadow: "0 0 26px rgba(255,106,42,0.65)",
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.05em", color: "#ffedd7" }}>RUN</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 66, fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 960, color: "#ffedd7" }}>
            Software a medida. Agentes de IA. Tu operación, conectada.
          </div>
          <div style={{ fontSize: 26, color: "rgba(255,237,215,0.72)", maxWidth: 900 }}>
            Sistemas, agentes e integraciones para la operación de tu empresa.
          </div>
        </div>

        <div style={{ fontSize: 22, color: "rgba(255,210,154,0.85)", fontFamily: "monospace", letterSpacing: "0.02em" }}>run72.app</div>
      </div>
    ),
    { ...size },
  );
}
