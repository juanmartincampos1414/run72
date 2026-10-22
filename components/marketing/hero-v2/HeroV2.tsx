"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroCoreScene } from "./HeroCoreScene";
import { HeroCoreFallback } from "./HeroCoreFallback";
import { RunWordmarkSvg } from "@/components/marketing/RunWordmarkSvg";

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))) || null;
    // Liberar el contexto de prueba: en móviles el límite de contextos WebGL es bajo
    // y, si este queda tomado, el renderer real podía fallar y caer al respaldo.
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

// Propuesta de hero para RUN (dirección aprobada): escena 3D full-bleed con el
// núcleo conectado como objeto protagonista, "RUN" grande al fondo y titular +
// CTA por delante. Modo:
//   - "motion": WebGL disponible y sin reduced-motion → escena animada + recorrido
//     de scroll (185vh) que revela otra cara del objeto.
//   - "still":  WebGL con prefers-reduced-motion → escena ensamblada y quieta, SIN
//     recorrido extra (100svh).
//   - "static": sin WebGL (o ?static=1) → respaldo SVG fiel, SIN recorrido extra.
export function HeroV2() {
  const [mode, setMode] = useState<"pending" | "motion" | "still" | "static">("pending");

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("static") === "1";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (forced || !webglAvailable()) setMode("static");
    else if (reduced) setMode("still");
    else setMode("motion");
  }, []);

  const scroll = mode === "motion";

  return (
    <div className="hv2-scroll" data-scroll={scroll ? "on" : "off"}>
      <section className="hv2">
        {mode === "static" ? (
          <HeroCoreFallback />
        ) : mode === "pending" ? null : (
          <HeroCoreScene onError={() => setMode("static")} />
        )}
        <span className="hv2-watermark" aria-hidden="true">
          <RunWordmarkSvg className="hv2-watermark-svg" />
        </span>
        <div className="hv2-vignette" aria-hidden="true" />

        <header className="hv2-bar">
          <span className="hv2-logo">RUN</span>
          <Link href="/contacto" className="hv2-barcta">
            Contacto <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className="hv2-inner">
          <p className="hv2-eyebrow">Software a medida · Agentes de IA · Automatización</p>
          <h1 className="hv2-title">
            Tu operación,<br />
            <span className="hv2-title-em">conectada.</span>
          </h1>
          <p className="hv2-sub">
            Desarrollamos software a medida, agentes de inteligencia artificial e integraciones
            para que tu empresa trabaje con menos tareas manuales y mejor información.
          </p>
          <div className="hv2-ctas">
            <Link href="/contacto" className="hv2-cta">Contanos qué necesitás resolver</Link>
            <Link href="/servicios" className="hv2-cta-ghost">
              Conocé lo que hacemos <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="hv2-foot" aria-hidden="true">
          <span className="hv2-tag">RUN·01 — SISTEMA CONECTADO</span>
          <span className="hv2-scrollhint">{scroll ? "SCROLL" : ""}</span>
        </div>
      </section>
    </div>
  );
}
