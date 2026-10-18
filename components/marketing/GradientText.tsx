import type { ReactNode } from "react";

// Texto con gradiente animado (sección 4.1). Server component.
export function GradientText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`m-gradient-text ${className}`}>{children}</span>;
}
