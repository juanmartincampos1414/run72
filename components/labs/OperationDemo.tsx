"use client";

import { useEffect, useRef, useState } from "react";
import { DemoChrome } from "@/components/labs/DemoChrome";
import {
  LAB_PAGES,
  OP_EMPTY,
  OP_FILTERS,
  opApplyAction,
  opCounts,
  opFilterItems,
  opFilterMessage,
  opInitial,
  opNextAction,
  type OpFilter,
  type OpRequest,
  type OpStatus,
} from "@/lib/marketing/labs";

type Snap = {
  items: OpRequest[];
  filter: OpFilter;
  selectedId: string | null;
  touched: boolean;
  message: string;
};

const initialSnap = (): Snap => {
  const items = opInitial();
  return { items, filter: "Todos", selectedId: null, touched: false, message: opFilterMessage("Todos", items.length) };
};

const STATUS_TONE: Record<OpStatus, string> = {
  Pendiente: "warn",
  "En curso": "info",
  Finalizada: "ok",
};

function StatusChip({ status }: { status: OpStatus }) {
  return (
    <span className="lab-chip" data-tone={STATUS_TONE[status]}>
      {status}
    </span>
  );
}

// Demo 9.2: sistema interno con filtros, panel de detalle y cambio de estado.
export function OperationDemo() {
  const [snap, setSnap] = useState<Snap>(initialSnap);
  const [past, setPast] = useState<Snap[]>([]);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const filterBtns = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelHeading = useRef<HTMLHeadingElement | null>(null);

  const { items, filter, selectedId, touched } = snap;
  const visible = opFilterItems(items, filter);
  const counts = opCounts(items);
  const selected = items.find((r) => r.id === selectedId) ?? null;
  const step = touched ? 2 : selected ? 1 : 0;
  const action = selected ? opNextAction(selected.status) : null;

  // Al abrir el detalle, el foco pasa al encabezado del panel.
  useEffect(() => {
    if (selectedId) panelHeading.current?.focus();
  }, [selectedId]);

  const commit = (next: Snap) => {
    setPast((p) => [...p, snap]);
    setSnap(next);
  };

  const open = (id: string) => {
    commit({ ...snap, selectedId: id, message: `Detalle de ${id} abierto.` });
  };

  const close = () => {
    const id = selectedId;
    if (!id) return;
    commit({ ...snap, selectedId: null, message: `Detalle de ${id} cerrado.` });
    // Foco de vuelta al disparador; si la fila ya no es visible por el filtro, al filtro activo.
    window.requestAnimationFrame(() => {
      const t = triggers.current[id];
      if (t) t.focus();
      else filterBtns.current[filter]?.focus();
    });
  };

  const applyAction = () => {
    if (!selected || !action) return;
    const next = opApplyAction(items, selected.id);
    commit({ ...snap, items: next, touched: true, message: `${selected.id} pasó a ${action.to}.` });
  };

  const setFilter = (f: OpFilter) => {
    setSnap((s) => ({ ...s, filter: f, message: opFilterMessage(f, opFilterItems(s.items, f).length) }));
  };

  const back = () => {
    const prev = past[past.length - 1];
    if (!prev) return;
    setPast(past.slice(0, -1));
    setSnap({ ...prev, filter, message: "Volviste al paso anterior." });
  };

  const reset = () => {
    setSnap(initialSnap());
    setPast([]);
  };

  return (
    <DemoChrome
      label="Demo de sistema interno"
      current={step}
      onReset={reset}
      onBack={back}
      canBack={past.length > 0}
      status={snap.message}
      cta={LAB_PAGES.operacion.cta}
    >
      <dl className="lab-counters" aria-label="Contadores de la demo">
        {OP_FILTERS.map((f) => (
          <div key={f} className="lab-counter">
            <dt>{f === "Todos" ? "Total" : f}</dt>
            <dd>{counts[f]}</dd>
          </div>
        ))}
      </dl>
      <p className="lab-note">Los contadores se calculan sobre estos tres registros ficticios. No son métricas de RUN.</p>

      <div className="lab-op-grid" data-open={selected ? "true" : "false"}>
        <div className="lab-op-main">
          <div className="lab-filters" role="group" aria-label="Filtrar por estado">
            {OP_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className="lab-filter"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                ref={(el) => {
                  filterBtns.current[f] = el;
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="lab-table-wrap">
            <table className="lab-table">
              <caption className="sr-only">Solicitudes ficticias</caption>
              <thead>
                <tr>
                  <th scope="col">Solicitud</th>
                  <th scope="col">Descripción</th>
                  <th scope="col" className="lab-col-opt">
                    Área
                  </th>
                  <th scope="col" className="lab-col-opt">
                    Responsable
                  </th>
                  <th scope="col" className="lab-col-opt">
                    Prioridad
                  </th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="lab-table-empty">
                      {OP_EMPTY}
                    </td>
                  </tr>
                ) : (
                  visible.map((r) => (
                    <tr key={r.id} data-selected={r.id === selectedId ? "true" : "false"}>
                      <th scope="row">
                        <button
                          type="button"
                          className="lab-row-btn"
                          onClick={() => open(r.id)}
                          aria-expanded={r.id === selectedId}
                          aria-controls="lab-op-panel"
                          aria-label={`${r.id}: abrir detalle`}
                          ref={(el) => {
                            triggers.current[r.id] = el;
                          }}
                        >
                          {r.id}
                        </button>
                      </th>
                      <td>{r.title}</td>
                      <td className="lab-col-opt">{r.area}</td>
                      <td className="lab-col-opt">{r.owner}</td>
                      <td className="lab-col-opt">{r.priority}</td>
                      <td>
                        <StatusChip status={r.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected ? (
          <section
            id="lab-op-panel"
            className="lab-panel-detail"
            role="dialog"
            aria-modal="false"
            aria-labelledby="lab-op-panel-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                close();
              }
            }}
          >
            <div className="lab-panel-head">
              <div>
                <p className="m-eyebrow">{selected.id}</p>
                <h2 id="lab-op-panel-title" className="lab-panel-title" tabIndex={-1} ref={panelHeading}>
                  {selected.title}
                </h2>
              </div>
              <button type="button" className="lab-close" onClick={close} aria-label="Cerrar detalle">
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <p className="lab-panel-desc">{selected.description}</p>

            <dl className="lab-facts">
              <div>
                <dt>Área</dt>
                <dd>{selected.area}</dd>
              </div>
              <div>
                <dt>Responsable</dt>
                <dd>{selected.owner}</dd>
              </div>
              <div>
                <dt>Prioridad</dt>
                <dd>{selected.priority}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <StatusChip status={selected.status} />
                </dd>
              </div>
            </dl>

            <div className="lab-panel-actions">
              {action ? (
                <button type="button" className="m-btn" onClick={applyAction}>
                  {action.label}
                </button>
              ) : (
                <p className="lab-note">Esta solicitud ya está finalizada. No quedan acciones en la demo.</p>
              )}
              <button type="button" className="m-btn-ghost" onClick={close}>
                Cerrar
              </button>
            </div>

            <h3 className="lab-subhead">Historial</h3>
            <ol className="lab-history">
              {selected.history.map((h, i) => (
                <li key={`${h.text}-${i}`}>
                  <span>{h.text}</span>
                  <span className="lab-faint">{h.when}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <p className="lab-hint">Elegí una solicitud para abrir su detalle y cambiar su estado.</p>
        )}
      </div>
    </DemoChrome>
  );
}
