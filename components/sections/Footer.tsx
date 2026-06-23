import Link from "next/link";
import { Logo } from "../Logo";
import { MailIcon, LinkedInIcon } from "../icons";
import { SITE, NAV_LINKS } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="container-x py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Tu negocio digital completo, listo para operar en 72 horas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <nav aria-label="Navegación">
              <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-faint">
                Navegación
              </h3>
              <ul className="flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-faint">
                Contacto
              </h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
                  >
                    <MailIcon className="h-4 w-4 text-brand-cyan" />
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <Link
                    href={SITE.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
                  >
                    <LinkedInIcon className="h-4 w-4 text-brand-cyan" />
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} RUN72. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/terminos" className="transition-colors hover:text-fg">
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="transition-colors hover:text-fg">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
