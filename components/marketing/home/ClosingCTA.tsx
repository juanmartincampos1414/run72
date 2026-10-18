import { HOME } from "@/lib/marketing/content";
import { GradientButton } from "@/components/marketing/GradientButton";

// Cierre (5.6). Dos líneas centradas + CTA gradiente. id cotizar (ancla legacy).
export function ClosingCTA() {
  const { muted, strong, cta } = HOME.closing;
  return (
    <section className="m-section m-closing" id="cotizar">
      <div className="m-container m-closing-inner">
        <span className="m-closing-mark" aria-hidden="true">✦</span>
        <p className="m-closing-lines">
          <span className="m-closing-muted">{muted}</span>{" "}
          <span className="m-closing-strong">{strong}</span>
        </p>
        <GradientButton href={cta.href} className="m-closing-cta">{cta.label}</GradientButton>
        <span className="m-closing-mark" aria-hidden="true">✦</span>
      </div>
    </section>
  );
}
