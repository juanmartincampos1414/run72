import { Button } from "./Button";
import { ArrowRight } from "../icons";
import { QUOTE } from "@/lib/content";
import { cn } from "@/lib/cn";

type Props = {
  /** Texto del botón. Por defecto "Cotizar mi proyecto". */
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  withArrow?: boolean;
  className?: string;
};

/**
 * Único punto de conversión de la landing.
 *
 * Hoy apunta a `QUOTE.href` (email de fallback). Cuando el cotizador web
 * multi-paso esté listo, basta con actualizar `QUOTE.href` en lib/content.ts
 * y todos los CTAs de la página apuntarán automáticamente al nuevo flujo.
 */
export function QuoteButton({
  label = QUOTE.label,
  variant = "primary",
  size = "md",
  withArrow = true,
  className,
}: Props) {
  return (
    <Button href={QUOTE.href} variant={variant} size={size} className={className}>
      {label}
      {withArrow && (
        <ArrowRight
          className={cn(
            "h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5",
            variant === "secondary" && "text-brand-cyan",
          )}
        />
      )}
    </Button>
  );
}
