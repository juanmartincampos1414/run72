import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center mx-auto max-w-2xl" : "items-start text-left max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={1}>
        <h2 className="text-balance font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={2}>
          <p className="text-pretty text-base leading-relaxed text-muted md:text-lg">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
