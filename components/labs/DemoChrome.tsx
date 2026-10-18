"use client";

import type { ReactNode } from "react";
import { AnimatedArrow } from "@/components/marketing/AnimatedArrow";
import { GradientButton } from "@/components/marketing/GradientButton";
import { DEMO_BANNER, DEMO_BANNER_NOTE, DEMO_STEPS } from "@/lib/marketing/labs";

type Cta = { text: string; label: string; href: string };

type Props = {
  /** Paso actual (0 = Entrada, 1 = Proceso, 2 = Resultado). */
  current: number;
  /** Último paso al que se puede volver a mirar. Por defecto, el actual. */
  reachable?: number;
  /** Si se pasa, los pasos alcanzados son botones para inspeccionarlos. */
  onStep?: (index: number) => void;
  onReset: () => void;
  onBack?: () => void;
  canBack?: boolean;
  /** Mensaje de resultado anunciado con role="status" (no se anuncia cada cuadro). */
  status: string;
  cta: Cta;
  /** Nombre accesible de la demo. */
  label: string;
  children: ReactNode;
};

// Marco compartido de las tres demos (9.1): aviso de datos ficticios antes de
// cualquier resultado, indicador de tres pasos, reinicio y CTA contextual.
export function DemoChrome({
  current,
  reachable,
  onStep,
  onReset,
  onBack,
  canBack = false,
  status,
  cta,
  label,
  children,
}: Props) {
  const max = Math.max(reachable ?? current, current);

  return (
    <section className="lab-demo m-panel" aria-label={label}>
      <div className="lab-banner">
        <span className="lab-banner-dot" aria-hidden="true" />
        <p className="lab-banner-main">{DEMO_BANNER}</p>
        <p className="lab-banner-note">{DEMO_BANNER_NOTE}</p>
      </div>

      <div className="lab-toolbar">
        <ol className="lab-steps" aria-label="Pasos de la demo">
          {DEMO_STEPS.map((step, i) => {
            const isCurrent = i === current;
            const isDone = i < current;
            const canGo = Boolean(onStep) && i <= max && !isCurrent;
            const inner = (
              <>
                <span className="lab-step-n" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="lab-step-label">{step}</span>
              </>
            );
            return (
              <li key={step} className="lab-step" data-state={isCurrent ? "current" : isDone ? "done" : i <= max ? "seen" : "todo"}>
                {canGo ? (
                  <button
                    type="button"
                    className="lab-step-btn"
                    onClick={() => onStep?.(i)}
                    aria-label={`Paso ${i + 1}: ${step}. Volver a mirarlo`}
                  >
                    {inner}
                  </button>
                ) : (
                  <span className="lab-step-btn" aria-current={isCurrent ? "step" : undefined}>
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <div className="lab-actions">
          {onBack ? (
            <button type="button" className="m-btn-ghost lab-btn-sm" onClick={onBack} disabled={!canBack}>
              Volver atrás
            </button>
          ) : null}
          <button type="button" className="m-btn-ghost lab-btn-sm" onClick={onReset}>
            Reiniciar demo
          </button>
        </div>
      </div>

      <div className="lab-body">{children}</div>

      <p className="lab-status" role="status" aria-live="polite" aria-atomic="true">
        {status}
      </p>

      <div className="lab-cta">
        <p className="lab-cta-text">{cta.text}</p>
        <GradientButton href={cta.href}>
          {cta.label}
          <AnimatedArrow />
        </GradientButton>
      </div>
    </section>
  );
}
