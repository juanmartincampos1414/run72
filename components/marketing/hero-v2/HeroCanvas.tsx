"use client";

import { useCallback, useEffect, useState } from "react";
import { HeroCoreScene } from "./HeroCoreScene";
import { HeroCoreFallback } from "./HeroCoreFallback";

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

// Elige la escena 3D o el respaldo estático: usa el respaldo si WebGL no está
// disponible, si la escena falla en runtime (onError), o si se fuerza con
// ?static=1 (para captura/QA del respaldo). Evita un parpadeo: decide en el
// cliente tras montar; hasta entonces no renderiza el objeto (el fondo del hero
// y el texto ya están presentes).
export function HeroCanvas() {
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("static") === "1";
    if (forced || !webglAvailable()) setMode("static");
    else setMode("3d");
  }, []);

  const handleError = useCallback(() => setMode("static"), []);

  if (mode === "static") return <HeroCoreFallback />;
  if (mode === "3d") return <HeroCoreScene onError={handleError} />;
  return null;
}
