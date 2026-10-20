import Link from "next/link";
import { HeroCanvas } from "./HeroCanvas";

// Propuesta nueva de hero para RUN (inspiración ORYZO, pieza propia).
// Composición recompuesta: escena 3D full-bleed con el núcleo conectado como
// objeto protagonista, tipografía integrada (marca de agua + titular superpuesto)
// y un CTA de contacto legible. El mensaje deja claro qué hace RUN.
export function HeroV2() {
  return (
    <div className="hv2-scroll">
    <section className="hv2">
      <HeroCanvas />
      <div className="hv2-grain" aria-hidden="true" />
      <span className="hv2-watermark" aria-hidden="true">RUN</span>
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
          <Link href="#que-hacemos" className="hv2-cta-ghost">
            Conocé lo que hacemos <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </div>

      <div className="hv2-foot" aria-hidden="true">
        <span className="hv2-tag">RUN·01 — SISTEMA CONECTADO</span>
        <span className="hv2-scrollhint">SCROLL</span>
      </div>
    </section>
    </div>
  );
}
