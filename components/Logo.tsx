import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 36, withWordmark = true, className }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt="RUN72"
        width={size}
        height={size}
        priority
        className="rounded-lg"
      />
      {withWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight">
          RUN<span className="text-gradient">72</span>
        </span>
      )}
    </span>
  );
}
