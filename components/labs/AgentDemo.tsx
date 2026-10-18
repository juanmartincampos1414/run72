"use client";

import { useState } from "react";
import { DemoChrome } from "@/components/labs/DemoChrome";
import {
  AGENT_ACTION,
  AGENT_DRAFT,
  AGENT_NOT_A_MODEL,
  AGENT_SCENARIOS,
  AGENT_SCENARIO_ORDER,
  AGENT_SOURCE,
  LAB_PAGES,
  type AgentScenarioId,
} from "@/lib/marketing/labs";

type State = {
  scenario: AgentScenarioId | null;
  step: 0 | 1 | 2;
  max: 0 | 1 | 2;
  trace: boolean;
  message: string;
};

const INITIAL: State = {
  scenario: null,
  step: 0,
  max: 0,
  trace: false,
  message: "Elegí una de las dos consultas para empezar.",
};

// Demo 9.3: dos recorridos deterministas. No hay caja de chat ni modelo real.
export function AgentDemo() {
  const [s, setS] = useState<State>(INITIAL);
  const scenario = s.scenario ? AGENT_SCENARIOS[s.scenario] : null;

  const choose = (id: AgentScenarioId) => {
    setS({
      scenario: id,
      step: 1,
      max: 1,
      trace: false,
      message: `Consulta recibida. ${AGENT_SCENARIOS[id].processing}.`,
    });
  };

  const goResult = () => {
    if (!scenario) return;
    setS((p) => ({
      ...p,
      step: 2,
      max: 2,
      message:
        scenario.id === "consultar"
          ? "Resultado: pedido preparado. La entrega todavía no tiene fecha confirmada."
          : "Resultado: borrador local preparado, pendiente de aprobación. No se envió nada.",
    }));
  };

  const goStep = (i: number) => {
    setS((p) => {
      const step = i as 0 | 1 | 2;
      return { ...p, step, message: `Mirando el paso ${i + 1}.` };
    });
  };

  const back = () => {
    setS((p) => {
      if (p.step === 0) return p;
      const step = (p.step - 1) as 0 | 1;
      return { ...p, step, message: `Volviste al paso ${step + 1}.` };
    });
  };

  return (
    <DemoChrome
      label="Demo de agente"
      current={s.step}
      reachable={s.max}
      onStep={goStep}
      onReset={() => setS(INITIAL)}
      onBack={back}
      canBack={s.step > 0}
      status={s.message}
      cta={LAB_PAGES.agente.cta}
    >
      {s.step === 0 || !scenario ? (
        <div>
          <h2 className="lab-h2">Elegí una consulta</h2>
          <p className="lab-note">No hay caja de chat: cada botón recorre un caso preparado de antemano.</p>
          <ul className="lab-choices">
            {AGENT_SCENARIO_ORDER.map((id) => {
              const sc = AGENT_SCENARIOS[id];
              return (
                <li key={id}>
                  <button type="button" className="lab-choice" onClick={() => choose(id)}>
                    <span className="lab-choice-title">{sc.buttonLabel}</span>
                    <span className="lab-choice-hint">{sc.hint}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="lab-agent">
          <div className="lab-bubble" data-from="user">
            <p className="m-eyebrow">Entrada de ejemplo</p>
            <p className="lab-bubble-text">{scenario.input}</p>
          </div>

          {s.step === 1 ? (
            <div className="lab-bubble" data-from="agent">
              <p className="m-eyebrow">Agente · Proceso</p>
              <p className="lab-bubble-text">{scenario.processing}</p>
              <p className="lab-note">{scenario.reply}</p>
              <div className="lab-panel-actions">
                <button type="button" className="m-btn" onClick={goResult}>
                  {scenario.nextLabel}
                </button>
              </div>
            </div>
          ) : (
            <div className="lab-bubble" data-from="agent">
              <p className="m-eyebrow">Agente · Resultado</p>
              {scenario.id === "excepcion" ? <p className="lab-bubble-text">{scenario.reply}</p> : null}
              <h2 className="lab-result-title">{scenario.resultTitle}</h2>
              <p className="lab-bubble-text">{scenario.resultText}</p>

              {scenario.id === "consultar" ? (
                <dl className="lab-cards">
                  <div className="lab-card-mini">
                    <dt>{AGENT_SOURCE.label}</dt>
                    <dd>{AGENT_SOURCE.value}</dd>
                  </div>
                  <div className="lab-card-mini">
                    <dt>{AGENT_ACTION.label}</dt>
                    <dd>{AGENT_ACTION.value}</dd>
                  </div>
                </dl>
              ) : (
                <div className="lab-draft">
                  <p className="m-eyebrow">Borrador local</p>
                  <dl className="lab-facts">
                    <div>
                      <dt>{AGENT_DRAFT.subjectLabel}</dt>
                      <dd>{AGENT_DRAFT.subject}</dd>
                    </div>
                    <div>
                      <dt>{AGENT_DRAFT.statusLabel}</dt>
                      <dd>
                        <span className="lab-chip" data-tone="warn">
                          {AGENT_DRAFT.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt>{AGENT_DRAFT.bodyLabel}</dt>
                      <dd>{AGENT_DRAFT.body}</dd>
                    </div>
                  </dl>
                  <p className="lab-disclaimer">{AGENT_DRAFT.disclaimer}</p>
                </div>
              )}

              <div className="lab-panel-actions">
                <button
                  type="button"
                  className="m-btn-ghost"
                  aria-expanded={s.trace}
                  aria-controls="lab-agent-trace"
                  onClick={() => setS((p) => ({ ...p, trace: !p.trace }))}
                >
                  {s.trace ? "Ocultar trazabilidad" : "Ver trazabilidad"}
                </button>
              </div>

              {s.trace ? (
                <ol id="lab-agent-trace" className="lab-trace" aria-label="Registros locales de trazabilidad">
                  {scenario.trace.map((t, i) => (
                    <li key={t.title}>
                      <span className="lab-trace-n" aria-hidden="true">
                        {i + 1}
                      </span>
                      <span>
                        <strong>{t.title}</strong>
                        <span className="lab-trace-detail">{t.detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          )}

          <p className="lab-note">{AGENT_NOT_A_MODEL}</p>
        </div>
      )}
    </DemoChrome>
  );
}
