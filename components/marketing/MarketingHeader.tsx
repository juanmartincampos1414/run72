"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS, NAV_CTA } from "@/lib/marketing/content";
import { track } from "@/lib/marketing/analytics";
import { Wordmark } from "./Wordmark";

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Evita que al devolver el foco al enlace tras Escape, el onFocus reabra el menú.
  const suppressOpenRef = useRef(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Navegación por teclado del dropdown de escritorio (A06): ArrowDown/Up recorren
  // las opciones, Escape cierra y devuelve el foco al enlace. Tab/Shift+Tab fluyen
  // de forma natural (onBlur del contenedor cierra al salir).
  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, href: string) => {
    const container = e.currentTarget;
    const items = Array.from(container.querySelectorAll<HTMLElement>(".m-nav-dropitem"));
    const link = container.querySelector<HTMLElement>(".m-nav-link");
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (menu !== href) {
        setMenu(href);
        requestAnimationFrame(() => items[0]?.focus());
      } else {
        items[Math.min(idx + 1, items.length - 1)]?.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (menu === href && idx > 0) items[idx - 1]?.focus();
      else {
        setMenu(null);
        link?.focus();
      }
    } else if (e.key === "Escape") {
      if (menu === href) {
        e.preventDefault();
        setMenu(null);
        suppressOpenRef.current = true;
        link?.focus();
        requestAnimationFrame(() => { suppressOpenRef.current = false; });
      }
    } else if (e.key === "Home" && menu === href) {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End" && menu === href) {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  // Cerrar con Escape y restaurar foco (A06).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="m-header-wrap">
      <div className="m-header" role="navigation" aria-label="Principal">
        <Wordmark />

        <nav className="m-nav-desktop" aria-label="Secciones">
          {NAV_LINKS.map((l) =>
            l.sub ? (
              <div
                key={l.href}
                className="m-nav-item"
                onMouseEnter={() => setMenu(l.href)}
                onMouseLeave={() => setMenu(null)}
                onFocus={() => { if (!suppressOpenRef.current) setMenu(l.href); }}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMenu(null); }}
                onKeyDown={(e) => onMenuKeyDown(e, l.href)}
              >
                <Link href={l.href} className="m-nav-link" aria-current={isActive(l.href) ? "page" : undefined} aria-expanded={menu === l.href} aria-haspopup="true">
                  {l.label}
                  <span className="m-nav-caret" aria-hidden="true">▾</span>
                </Link>
                <div className={`m-nav-drop ${menu === l.href ? "is-open" : ""}`} hidden={menu !== l.href}>
                  {l.sub.map((s) => (
                    <Link key={s.href} href={s.href} className="m-nav-dropitem" onClick={() => setMenu(null)}>
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={l.href} href={l.href} className="m-nav-link" aria-current={isActive(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="m-header-cta">
          <Link href={NAV_CTA.href} className="m-btn m-btn--compact" onClick={() => track("cta_contact_click", { location: "header" })}>
            {NAV_CTA.label}
          </Link>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="m-burger"
          aria-expanded={open}
          aria-controls="m-mobile-panel"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`m-burger-ico ${open ? "is-open" : ""}`} aria-hidden="true">
            <i /><i /><i />
          </span>
        </button>
      </div>

      {/* Panel móvil real: oculto a Tab cuando está cerrado (A06) */}
      <div
        id="m-mobile-panel"
        ref={panelRef}
        className={`m-mobile ${open ? "is-open" : ""}`}
        hidden={!open}
      >
        <nav className="m-mobile-nav" aria-label="Menú móvil">
          {NAV_LINKS.map((l) => (
            <div key={l.href}>
              <Link
                href={l.href}
                className="m-mobile-link"
                aria-current={isActive(l.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
              {l.sub && (
                <div className="m-mobile-sub">
                  {l.sub.map((s) => (
                    <Link key={s.href} href={s.href} className="m-mobile-sublink" onClick={() => setOpen(false)}>
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href={NAV_CTA.href} className="m-btn m-mobile-ctabtn" onClick={() => { track("cta_contact_click", { location: "mobile_nav" }); setOpen(false); }}>
            {NAV_CTA.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
