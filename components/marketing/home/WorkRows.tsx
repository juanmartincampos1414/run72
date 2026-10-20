import Link from "next/link";
import Image from "next/image";
import { HOME } from "@/lib/marketing/content";

// Trabajos seleccionados (5.5). Filas de ancho completo con una miniatura REAL
// del producto, visible siempre (no depende de hover → accesible por teclado y
// en pantallas táctiles). Al hover/foco la fila se realza levemente.
export function WorkRows() {
  const { eyebrow, rows, allLink, demosLink } = HOME.works;

  return (
    <section className="m-section m-works" id="experiencia" aria-labelledby="works-title">
      <div className="m-container">
        <p className="m-eyebrow">{eyebrow}</p>
        <h2 id="works-title" className="sr-only">Trabajos seleccionados</h2>
      </div>

      <div className="m-works-list">
        {rows.map((row) => (
          <Link key={row.slug} href={`/trabajos/${row.slug}`} className="m-work-row">
            <div className="m-container m-work-rowinner">
              <span className="m-work-text">
                <span className="m-work-meta">
                  <span className="m-work-badge m-eyebrow">{row.tag}</span>
                  {row.state && <span className="m-work-state">{row.state}</span>}
                </span>
                <span className="m-work-name">{row.title}</span>
                {row.desc && <span className="m-work-desc">{row.desc}</span>}
              </span>
              {row.img && (
                <span className="m-work-thumb">
                  <Image
                    src={row.img}
                    alt={row.alt ?? ""}
                    width={320}
                    height={180}
                    sizes="(min-width: 768px) 300px, 42vw"
                    className="m-work-thumbimg"
                  />
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="m-container m-works-ctas">
        <Link href={allLink.href} className="m-btn-ghost">{allLink.label}</Link>
        <Link href={demosLink.href} className="m-btn-ghost">{demosLink.label}</Link>
      </div>
      <span id="faq" aria-hidden="true" />
    </section>
  );
}
