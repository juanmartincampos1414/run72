"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { QuoteButton } from "./ui/QuoteButton";
import { NAV_LINKS, QUOTE } from "@/lib/content";
import { cn } from "@/lib/cn";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="container-x py-3">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full px-3 py-2 pl-4 transition-all duration-500",
            scrolled
              ? "glass shadow-[0_8px_40px_-16px_rgba(0,0,0,0.8)]"
              : "border border-transparent",
          )}
        >
          <a href="#top" aria-label="RUN72 — inicio">
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-fg"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <a
              href="/hub"
              className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-fg"
            >
              Business Hub
            </a>
            <QuoteButton label={QUOTE.labelShort} withArrow={false} size="md" />
          </div>

          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full glass md:hidden"
          >
            <span className="relative flex h-4 w-5 flex-col justify-between">
              <span
                className={cn(
                  "h-0.5 w-full bg-fg transition-transform duration-300",
                  open && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-full bg-fg transition-opacity duration-300",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-full bg-fg transition-transform duration-300",
                  open && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </nav>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden md:hidden"
        >
          <div className="glass mt-2 flex flex-col gap-1 rounded-3xl p-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/hub"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
            >
              Business Hub
            </a>
            <QuoteButton label={QUOTE.labelShort} className="mt-1 w-full" />
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
