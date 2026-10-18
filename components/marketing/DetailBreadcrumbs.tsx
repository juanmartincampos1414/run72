import Link from "next/link";
// Los estilos viven en el CSS scoped de Servicios (clases `svc-crumbs*`);
// se importan acá para que cualquier ficha de detalle los reciba al usar el componente.
import "@/app/(marketing)/servicios/servicios.css";

export type Crumb = { label: string; href?: string };

// Cápsula flotante de breadcrumb para fichas de detalle (3.2). Server component.
// El último ítem es la página actual (sin enlace, aria-current) con línea superior en gradiente.
export function DetailBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="svc-crumbs" aria-label="Breadcrumb">
      <ol className="svc-crumbs-list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className={`svc-crumb ${last ? "is-current" : ""}`}>
              {last || !item.href ? (
                <span className="svc-crumb-label" aria-current={last ? "page" : undefined} title={item.label}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="svc-crumb-label svc-crumb-link" title={item.label}>
                  {item.label}
                </Link>
              )}
              {!last && (
                <span className="svc-crumb-sep" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
