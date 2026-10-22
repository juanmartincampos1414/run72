import { cn } from "@/lib/cn";
import { RunWordmarkSvg } from "@/components/marketing/RunWordmarkSvg";
import { RunDiamond } from "@/components/marketing/RunDiamond";

type Props = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

// Logo de marca unificado: wordmark vectorial definitivo (hereda el color del
// tema), o el núcleo facetado como isotipo cuando withWordmark es false.
// Reemplaza el isologo con gradiente azul/violeta anterior.
export function Logo({ size = 36, withWordmark = true, className }: Props) {
  if (!withWordmark) {
    return (
      <span className={cn("inline-flex items-center", className)} role="img" aria-label="RUN">
        <RunDiamond size={size} />
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center", className)} role="img" aria-label="RUN">
      <RunWordmarkSvg style={{ height: Math.round(size * 0.62), width: "auto" }} />
    </span>
  );
}
