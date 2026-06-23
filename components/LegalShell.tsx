import Link from "next/link";
import { Logo } from "./Logo";
import { Footer } from "./sections/Footer";

/** Layout simple para páginas legales (términos, privacidad). Presentacional. */
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
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN72 — inicio">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-fg">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="container-x py-14 md:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-faint">Última actualización: {updated}</p>
          <div className="legal-prose mt-10 space-y-8">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/** Sección de un documento legal: título + contenido. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold tracking-tight text-fg">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
