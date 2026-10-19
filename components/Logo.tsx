import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 36, withWordmark = true, className }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden={withWordmark ? true : undefined}
        role={withWordmark ? undefined : "img"}
        aria-label={withWordmark ? undefined : "RUN"}
        className="inline-block shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background:
            "linear-gradient(135deg,#18ACFF,#5583FF 48%,#8960FF 70%,#FFD873)",
        }}
      />
      {withWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight">RUN</span>
      )}
    </span>
  );
}
