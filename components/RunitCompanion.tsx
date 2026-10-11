"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Runit — personaje/compañero de IA del landing.
 * Recorre la página en distintas zonas (según el scroll), suelta micro-frases
 * tipo terminal por sección, te sigue con la mirada, glitchea y escanea.
 * Respeta prefers-reduced-motion (queda fijo abajo a la derecha, sin efectos).
 */

const BODY_D =
  "M110 14 C158 14 192 60 192 128 C192 188 158 222 110 222 C62 222 28 188 28 128 C28 60 62 14 110 14 Z";

// Micro-frases por sección (id del <section>).
const PHRASES: Record<string, string> = {
  top: "72:00:00 · en espera",
  servicios: "escaneando servicios…",
  proceso: "3 pasos. 3 días.",
  ideal: "¿es para vos? → sí",
  experiencia: "verificando la entrega…",
  proyectos: "cargando proyectos…",
  propiedad: "todo queda a tu nombre",
  faq: "preguntame lo que sea",
  cotizar: "¿arrancamos? →",
};
const SECTION_IDS = Object.keys(PHRASES);

export function RunitCompanion() {
  const fabRef = useRef<HTMLButtonElement>(null);
  const charRef = useRef<SVGSVGElement>(null);
  const gazeRef = useRef<SVGGElement>(null);
  const eyeRef = useRef<SVGGElement>(null);
  const [typed, setTyped] = useState("");
  const [bubbleOn, setBubbleOn] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fab = fabRef.current;
    if (!fab) return;

    // aparecer
    const showTO = window.setTimeout(() => fab.classList.add("rn-show"), reduce ? 0 : 1200);

    // ---------- posición: recorre la página ----------
    let lastY = window.scrollY;
    let tiltTO = 0;
    const place = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 720;
      const h = document.documentElement.scrollHeight - vh;
      const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;

      let x: number;
      let y: number;
      if (mobile) {
        x = vw - 46;
        y = vh * (0.72 + 0.1 * Math.cos(p * Math.PI * 2.4));
      } else {
        // zig-zag horizontal por toda la página, en la franja baja (no tapa titulares).
        // Fase 0.9 => arranca a la derecha, lejos del contenido centrado del hero.
        x = vw * (0.5 + 0.4 * Math.sin(p * Math.PI * 3.2 + 0.9));
        y = vh * (0.72 + 0.12 * Math.cos(p * Math.PI * 2.4));
      }
      const cw = mobile ? 40 : 64;
      x = Math.max(cw, Math.min(vw - cw, x));
      y = Math.max(vh * 0.56, Math.min(vh * 0.85, y));
      fab.style.transform = `translate3d(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%), 0)`;

      // inclinación según dirección/velocidad del scroll
      if (!reduce && charRef.current) {
        const dv = window.scrollY - lastY;
        const tilt = Math.max(-16, Math.min(16, dv * 0.5));
        const sc = 1 + Math.min(0.08, Math.abs(dv) / 900);
        charRef.current.style.transform = `rotate(${tilt.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
        window.clearTimeout(tiltTO);
        tiltTO = window.setTimeout(() => {
          if (charRef.current) charRef.current.style.transform = "rotate(0deg) scale(1)";
        }, 180);
      }
      lastY = window.scrollY;
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        place();
        ticking = false;
      });
    };

    if (reduce) {
      fab.style.transform = "none";
      fab.style.left = "auto";
      fab.style.right = "24px";
      fab.style.top = "auto";
      fab.style.bottom = "24px";
    } else {
      place();
      requestAnimationFrame(place);
      window.setTimeout(place, 600);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", place, { passive: true });
      window.addEventListener("load", place);
    }

    // ---------- mirada que sigue el cursor ----------
    const onPointer = (e: PointerEvent) => {
      const svg = charRef.current;
      const g = gazeRef.current;
      if (!svg || !g) return;
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height * 0.48;
      const dx = e.clientX - ex;
      const dy = e.clientY - ey;
      const d = Math.hypot(dx, dy) || 1;
      const m = Math.min(8, d / 18);
      g.setAttribute("transform", `translate(${((dx / d) * m).toFixed(1)},${((dy / d) * m).toFixed(1)})`);
    };
    if (!reduce && window.matchMedia("(pointer:fine)").matches) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    // ---------- parpadeo + glitch ----------
    let blinkTO = 0;
    let glitchTO = 0;
    const blink = () => {
      const eye = eyeRef.current;
      if (eye) {
        eye.classList.add("rn-blink");
        window.setTimeout(() => eye.classList.remove("rn-blink"), 150);
      }
      blinkTO = window.setTimeout(blink, 2600 + Math.random() * 3600);
    };
    const glitch = () => {
      const c = charRef.current;
      if (c) {
        c.classList.add("rn-glitch");
        window.setTimeout(() => c.classList.remove("rn-glitch"), 300);
      }
      glitchTO = window.setTimeout(glitch, 4200 + Math.random() * 6500);
    };
    if (!reduce) {
      blinkTO = window.setTimeout(blink, 2500);
      glitchTO = window.setTimeout(glitch, 3800);
    }

    // ---------- micro-frases por sección ----------
    let current = "";
    let typeTO = 0;
    let hideTO = 0;
    const ratios = new Map<string, number>();
    const speak = (text: string) => {
      window.clearTimeout(typeTO);
      window.clearTimeout(hideTO);
      setBubbleOn(true);
      if (reduce) {
        setTyped(text);
        hideTO = window.setTimeout(() => setBubbleOn(false), 3200);
        return;
      }
      let i = 0;
      const step = () => {
        i++;
        setTyped(text.slice(0, i));
        if (i < text.length) {
          typeTO = window.setTimeout(step, 36);
        } else {
          hideTO = window.setTimeout(() => setBubbleOn(false), 2400);
        }
      };
      setTyped("");
      step();
    };

    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best = "";
        let bestR = 0.28;
        ratios.forEach((r, id) => {
          if (r > bestR) {
            bestR = r;
            best = id;
          }
        });
        if (best && best !== current) {
          current = best;
          speak(PHRASES[best]);
        }
      },
      { threshold: [0.3, 0.55, 0.8], rootMargin: "-10% 0px -25% 0px" },
    );
    sections.forEach((s) => io.observe(s));

    return () => {
      window.clearTimeout(showTO);
      window.clearTimeout(blinkTO);
      window.clearTimeout(glitchTO);
      window.clearTimeout(typeTO);
      window.clearTimeout(hideTO);
      window.clearTimeout(tiltTO);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", place);
      window.removeEventListener("load", place);
      window.removeEventListener("pointermove", onPointer);
      io.disconnect();
    };
  }, []);

  const goQuote = () => {
    const el = document.getElementById("cotizar");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.location.href = "/cotizar";
  };

  return (
    <button ref={fabRef} className="rn-fab" aria-label="Hablar con Runit, asistente de IA" onClick={goQuote}>
      <span className={`rn-bubble${bubbleOn ? " rn-on" : ""}`} aria-hidden="true">
        <span className="rn-prompt">›</span>
        {typed}
      </span>
      <span className="rn-float">
        <span className="rn-aura" aria-hidden="true" />
        <svg ref={charRef} className="rn-char" viewBox="0 0 220 260" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="rnBody" cx="50%" cy="34%" r="72%">
              <stop offset="0%" stopColor="#2a1b4d" />
              <stop offset="42%" stopColor="#140b2a" />
              <stop offset="100%" stopColor="#050309" />
            </radialGradient>
            <linearGradient id="rnRim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <radialGradient id="rnEye" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#f2fbff" />
              <stop offset="30%" stopColor="#9fe0ff" />
              <stop offset="70%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#5b21b6" />
            </radialGradient>
            <pattern id="rnCrt" width="4" height="5" patternUnits="userSpaceOnUse">
              <rect width="4" height="1.5" fill="#bfeaff" />
            </pattern>
            <linearGradient id="rnRoll" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bfeaff" stopOpacity="0" />
              <stop offset=".5" stopColor="#bfeaff" stopOpacity=".5" />
              <stop offset="1" stopColor="#bfeaff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="rnBodyClip">
              <path d={BODY_D} />
            </clipPath>
            <clipPath id="rnLens">
              <circle cx="110" cy="126" r="25" />
            </clipPath>
          </defs>

          <g className="rn-wisps" stroke="url(#rnRim)" strokeWidth="5" strokeLinecap="round" opacity=".5" fill="none">
            <path d="M80 214 q-7 20 2 38" />
            <path d="M110 218 q0 22 0 40" />
            <path d="M140 214 q7 20 -2 38" />
          </g>

          <path className="rn-body" d={BODY_D} fill="url(#rnBody)" stroke="url(#rnRim)" strokeWidth="2.5" />
          <ellipse cx="110" cy="130" rx="60" ry="70" fill="#050309" opacity=".65" />

          <g clipPath="url(#rnBodyClip)">
            <rect className="rn-crt-lines" x="0" y="0" width="220" height="260" fill="url(#rnCrt)" />
            <rect className="rn-crt-roll" x="0" y="0" width="220" height="50" fill="url(#rnRoll)" />
          </g>

          <g className="rn-eye" ref={eyeRef}>
            <circle cx="110" cy="126" r="25" fill="#060412" />
            <circle cx="110" cy="126" r="25" fill="url(#rnEye)" opacity=".38" />
            <circle className="rn-iris" cx="110" cy="126" r="19" fill="none" stroke="url(#rnRim)" strokeWidth="2" strokeDasharray="6 7" opacity=".9" />
            <g className="rn-gaze" ref={gazeRef}>
              <circle cx="110" cy="126" r="13" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity=".65" />
              <circle className="rn-pupil" cx="110" cy="126" r="6.5" fill="#dffaff" />
            </g>
            <g clipPath="url(#rnLens)">
              <rect className="rn-scan" x="83" y="100" width="54" height="2.5" fill="#9fe7ff" opacity=".9" />
            </g>
          </g>
        </svg>
      </span>
    </button>
  );
}
