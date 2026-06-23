"use client";

import { computeSla, SLA_COLOR } from "@/lib/sla";

/** Barra de progreso del SLA 72h con color por urgencia. */
export function SlaBar({
  startedAt,
  deadlineAt,
  compact,
}: {
  startedAt: string | null | undefined;
  deadlineAt?: string | null;
  compact?: boolean;
}) {
  const sla = computeSla(startedAt, deadlineAt);
  if (!sla.active) {
    return <span className="text-[11px] text-faint">SLA sin iniciar</span>;
  }
  const c = SLA_COLOR[sla.bucket];

  return (
    <div className={compact ? "w-40" : "w-full"}>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className={c.text}>
          {sla.overdue
            ? "Fuera de SLA"
            : `${sla.elapsedH}h / ${sla.remainingH}h restantes`}
        </span>
        {!compact && <span className="text-faint">{sla.pct}%</span>}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${c.bar}`}
          style={{ width: `${Math.max(4, sla.pct)}%` }}
        />
      </div>
    </div>
  );
}
