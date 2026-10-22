"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroCoreScene } from "@/components/marketing/hero-v2/HeroCoreScene";
import { HeroCoreFallback } from "@/components/marketing/hero-v2/HeroCoreFallback";
import { RunWordmarkSvg } from "@/components/marketing/RunWordmarkSvg";

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

// Hero de la Home con la dirección aprobada: "RUN" grande al fondo, núcleo 3D
// protagonista delante, paleta cálida y texto estable. A diferencia de /hero
// aislado, NO usa recorrido de scroll (scrollDriven=false): ocupa una sola
// pantalla y da paso directo a Servicios. Reutiliza las clases hv2-* (definidas
// bajo .run-warm) + el respaldo con render real de la escena.
export function HomeHero() {
  const [mode, setMode] = useState<"pending" | "scene" | "static">("pending");

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("static") === "1";
    setMode(forced || !webglAvailable() ? "static" : "scene");
  }, []);

  return (
    <section className="home-hero" id="top">
      {mode === "static" ? (
        <HeroCoreFallback />
      ) : mode === "pending" ? null : (
        <HeroCoreScene scrollDriven={false} onError={() => setMode("static")} />
      )}
      <span className="hv2-watermark" aria-hidden="true">
        <RunWordmarkSvg className="hv2-watermark-svg" />
      </span>
      <div className="hv2-vignette" aria-hidden="true" />

      <div className="hv2-inner home-hero-inner">
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
          <Link href="#servicios" className="hv2-cta-ghost">
            Conocé lo que hacemos <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
