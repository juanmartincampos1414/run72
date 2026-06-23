"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "../Logo";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Leads" },
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/microservicios", label: "Microservicios" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await createSupabaseBrowser().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-b border-line lg:border-b-0 lg:border-r lg:min-h-screen">
        <div className="flex items-center justify-between p-5">
          <Link href="/admin">
            <Logo size={30} />
          </Link>
          <button
            className="lg:hidden text-sm text-muted"
            onClick={() => setOpen((v) => !v)}
          >
            Menú
          </button>
        </div>
        <nav className={cn("px-3 pb-3 lg:block", open ? "block" : "hidden")}>
          {LINKS.map((l) => {
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-xl px-4 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/[0.06] text-fg"
                    : "text-muted hover:text-fg hover:bg-white/[0.03]",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="mt-4 border-t border-line px-4 pt-4">
            <p className="truncate text-xs text-faint">{email}</p>
            <button
              onClick={signOut}
              className="mt-2 text-sm text-muted transition-colors hover:text-fg"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>

      <main className="p-5 md:p-8">{children}</main>
    </div>
  );
}
