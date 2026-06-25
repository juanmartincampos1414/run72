"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../Logo";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const NAV = [
  { href: "/hub", label: "Resumen" },
  { href: "/hub/documentos", label: "Documentos" },
  { href: "/hub/partners", label: "Partners" },
  { href: "/hub/credenciales", label: "Credenciales" },
];

export function HubShell({
  children,
  company,
}: {
  children: React.ReactNode;
  company?: string | null;
}) {
  const pathname = usePathname();

  async function logout() {
    await createSupabaseBrowser().auth.signOut();
    window.location.href = "/hub/login";
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="RUN72 — inicio">
              <Logo />
            </Link>
            <span className="hidden text-sm text-faint sm:inline">· Business Hub</span>
          </div>
          <div className="flex items-center gap-4">
            {company && <span className="hidden text-sm text-muted sm:inline">{company}</span>}
            <button onClick={logout} className="text-sm text-muted transition-colors hover:text-fg">
              Salir
            </button>
          </div>
        </div>
        <div className="container-x flex gap-1 pb-px">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-brand-violet font-medium text-fg"
                    : "border-transparent text-muted hover:text-fg"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </header>
      <main className="container-x py-8 md:py-10">{children}</main>
    </div>
  );
}
