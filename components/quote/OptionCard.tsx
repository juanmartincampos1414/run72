"use client";

import { cn } from "@/lib/cn";
import { CheckIcon } from "../icons";

type Props = {
  title: string;
  description?: string | null;
  price?: string;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
};

export function OptionCard({
  title,
  description,
  price,
  selected,
  multi = false,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-2 sm:p-5",
        selected
          ? "border-transparent bg-gradient-to-br from-brand-blue/[0.12] to-brand-violet/[0.08] ring-1 ring-brand-blue/50"
          : "border-line bg-surface/40 hover:border-line-strong hover:bg-surface-2/60",
      )}
    >
      {/* Indicador */}
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-all duration-300",
          multi ? "rounded-md" : "rounded-full",
          selected
            ? "border-transparent bg-gradient-to-br from-brand-cyan to-brand-violet text-ink"
            : "border-line-strong text-transparent",
        )}
      >
        <CheckIcon className="h-3 w-3" strokeWidth={3} />
      </span>

      <span className="flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-medium tracking-tight">{title}</span>
          {price && (
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                selected ? "text-fg" : "text-muted",
              )}
            >
              {price}
            </span>
          )}
        </span>
        {description && (
          <span className="mt-1 block text-sm leading-relaxed text-muted">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
