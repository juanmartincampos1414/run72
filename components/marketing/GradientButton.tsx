import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  "aria-busy"?: boolean;
};

// CTA de marketing. Enlace interno con next/link; externo o botón según props.
export function GradientButton({ children, href, variant = "primary", className = "", type = "button", disabled, ...rest }: Props) {
  const cls = `${variant === "primary" ? "m-btn" : "m-btn-ghost"} ${className}`;
  if (href) {
    const external = /^https?:\/\//.test(href) || href.startsWith("mailto:");
    if (external) {
      return (
        <a href={href} className={cls} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
