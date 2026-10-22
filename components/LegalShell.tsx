import "../app/marketing.css";
import { MarketingShell } from "./marketing/MarketingShell";

/** Layout para páginas legales (términos, privacidad). Usa el shell RUN. */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <MarketingShell withSmooth={false} theme="warm">
      <div className="run-warm-tool container-x pt-28 pb-24 md:pt-36">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-faint">Última actualización: {updated}</p>
          <div className="legal-prose mt-10 space-y-8">{children}</div>
        </div>
      </div>
    </MarketingShell>
  );
}

/** Sección de una página legal: encabezado + contenido. */
export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold tracking-tight">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
