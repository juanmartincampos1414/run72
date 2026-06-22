import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px] py-3.5",
};

const variants: Record<Variant, string> = {
  primary:
    "text-ink bg-white hover:scale-[1.02] active:scale-[0.99] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_40px_-8px_rgba(99,102,241,0.6)]",
  secondary:
    "text-fg glass hover:border-line-strong hover:bg-white/[0.06]",
  ghost: "text-muted hover:text-fg",
};

type ButtonAsLink = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className">;

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonAsLink) {
  const isHash = href.startsWith("#");
  const content = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-brand-cyan/0 via-brand-blue/0 to-brand-violet/0 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      {children}
    </>
  );

  if (isHash) {
    return (
      <a href={href} className={cn(base, sizes[size], variants[variant], className)}>
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {content}
    </Link>
  );
}
