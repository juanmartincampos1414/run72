import Link from "next/link";
import { HOME } from "@/lib/marketing/content";
import { PointerGlow } from "@/components/marketing/PointerGlow";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";

// Capacidades (5.3). Panel izquierdo + tres bandas dentro de una grilla con
// borde y halo (no tres tarjetas sueltas).
export function CapabilitiesGrid() {
  const { eyebrow, title, items } = HOME.capabilities;
  return (
    <section className="m-section m-caps" id="servicios">
      <div className="m-container m-caps-grid">
        <div className="m-caps-head">
          <p className="m-eyebrow">{eyebrow}</p>
          <h2 className="m-caps-title">{title}</h2>
        </div>
        <div className="m-caps-list">
          {items.map((it) => (
            <PointerGlow key={it.id} className="m-cap-band">
              <Link href={it.href} className="m-cap-link">
                <h3 className="m-cap-title">{it.title}</h3>
                <p className="m-cap-text">{it.text}</p>
                <span className="m-cap-cta m-mono">
                  Ver más <AnimatedArrow />
                </span>
              </Link>
            </PointerGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
