"use client";

import { useState } from "react";
import { DemoChrome } from "@/components/labs/DemoChrome";
import {
  FLOW_EVENT,
  FLOW_NODES,
  FLOW_STATUS_LABEL,
  flowFail,
  flowInitial,
  flowRepeat,
  flowRetry,
  flowRun,
  flowStepIndex,
  LAB_PAGES,
  type FlowState,
} from "@/lib/marketing/labs";

// Demo 9.4: flujo de cuatro nodos, fallo temporal, reintento e idempotencia.
export function IntegrationDemo() {
  const [flow, setFlow] = useState<FlowState>(flowInitial);
  const [past, setPast] = useState<FlowState[]>([]);

  const apply = (fn: (s: FlowState) => FlowState) => {
    const next = fn(flow);
    if (next === flow) return;
    setPast((p) => [...p, flow]);
    setFlow(next);
  };

  const back = () => {
    const prev = past[past.length - 1];
    if (!prev) return;
    setPast(past.slice(0, -1));
    setFlow({ ...prev, message: "Volviste al paso anterior." });
  };

  const reset = () => {
    setFlow(flowInitial());
    setPast([]);
  };

  const { phase } = flow;
  const flowText = FLOW_NODES.map((n, i) => `${n.title}: ${FLOW_STATUS_LABEL[flow.nodes[i]]}`).join(" → ");

  return (
    <DemoChrome
      label="Demo de integración"
      current={flowStepIndex(phase)}
      onReset={reset}
      onBack={back}
      canBack={past.length > 0}
      status={flow.message}
      cta={LAB_PAGES.integraciones.cta}
    >
      <dl className="lab-facts lab-facts--row">
        <div>
          <dt>Evento</dt>
          <dd className="m-mono">{FLOW_EVENT.eventId}</dd>
        </div>
        <div>
          <dt>Pedido</dt>
          <dd className="m-mono">{FLOW_EVENT.orderId}</dd>
        </div>
        <div>
          <dt>Importe de ejemplo</dt>
          <dd>{FLOW_EVENT.amount}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <span
              className="lab-chip"
              data-tone={flow.eventStatus === "Finalizado" ? "ok" : flow.eventStatus === "Fallo temporal" ? "error" : "info"}
            >
              {flow.eventStatus}
            </span>
          </dd>
        </div>
      </dl>

      <div className="lab-controls" role="group" aria-label="Acciones del flujo">
        <button type="button" className="m-btn" onClick={() => apply(flowRun)} disabled={phase !== "inicial"}>
          Ejecutar flujo
        </button>
        <button type="button" className="m-btn-ghost" onClick={() => apply(flowFail)} disabled={phase !== "inicial"}>
          Simular fallo externo
        </button>
        <button type="button" className="m-btn-ghost" onClick={() => apply(flowRetry)} disabled={phase !== "fallo"}>
          Reintentar
        </button>
        <button type="button" className="m-btn-ghost" onClick={() => apply(flowRepeat)} disabled={phase !== "finalizado"}>
          Repetir evento
        </button>
      </div>
      <p className="lab-note">
        {phase === "inicial"
          ? "Ejecutá el flujo completo o simulá un fallo en el sistema interno."
          : phase === "fallo"
            ? "El tercer nodo falló. Reintentá para completar el flujo con el mismo evento."
            : "Flujo finalizado. Repetí el evento para ver la protección frente a duplicados."}
      </p>

      <h2 className="lab-subhead">Flujo</h2>
      <ol className="lab-flow" aria-label="Nodos del flujo y su estado">
        {FLOW_NODES.map((n, i) => {
          const st = flow.nodes[i];
          return (
            <li key={n.id} className="lab-node" data-status={st}>
              <span className="lab-node-n" aria-hidden="true">
                {i + 1}
              </span>
              <span className="lab-node-title">{n.title}</span>
              <span className="lab-node-text">{n.text}</span>
              <span className="lab-chip" data-tone={st === "ok" ? "ok" : st === "temp-fail" ? "error" : st === "pending" ? "warn" : "muted"}>
                {FLOW_STATUS_LABEL[st]}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="lab-flow-text">
        <span className="sr-only">Equivalente textual del diagrama: </span>
        {flowText}.
      </p>

      <div className="lab-split">
        <div>
          <h2 className="lab-subhead">Registros de ejecución</h2>
          {flow.logs.length === 0 ? (
            <p className="lab-note">Todavía no hay registros. Ejecutá el flujo para generarlos.</p>
          ) : (
            <ol className="lab-logs" aria-label="Registros de ejecución">
              {flow.logs.map((l) => (
                <li key={l.n} data-tone={l.tone}>
                  <span className="lab-log-n" aria-hidden="true">
                    {String(l.n).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{l.title}</strong>
                    <span className="lab-trace-detail">{l.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <h2 className="lab-subhead">Registros de pedido</h2>
          <div className="lab-table-wrap">
            <table className="lab-table">
              <caption className="sr-only">Pedidos creados por la demo</caption>
              <thead>
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Evento</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {flow.orders === 0 ? (
                  <tr>
                    <td colSpan={3} className="lab-table-empty">
                      Todavía no se creó ningún pedido.
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <th scope="row">{FLOW_EVENT.orderId}</th>
                    <td className="m-mono">{FLOW_EVENT.eventId}</td>
                    <td>
                      <span className="lab-chip" data-tone="ok">
                        Registrado
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="lab-note">
            Pedidos registrados: {flow.orders}. Un mismo evento nunca crea más de un pedido.
          </p>
        </div>
      </div>
    </DemoChrome>
  );
}
