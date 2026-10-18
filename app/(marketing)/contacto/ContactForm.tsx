"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/marketing/content";
import { track } from "@/lib/marketing/analytics";
import { fbTrack } from "@/lib/meta-pixel";

type Interest = "software" | "agentes" | "automatizacion" | "orientacion";
type Budget = "unsure" | "under_3000" | "3000_10000" | "over_10000";

const INTERESTS: { value: Interest; label: string }[] = [
  { value: "software", label: "Software a medida" },
  { value: "agentes", label: "Agente de IA" },
  { value: "automatizacion", label: "Integración y automatización" },
  { value: "orientacion", label: "Necesito orientación" },
];
const BUDGETS: { value: Budget; label: string }[] = [
  { value: "unsure", label: "Todavía necesito dimensionarla" },
  { value: "under_3000", label: "Hasta USD 3.000" },
  { value: "3000_10000", label: "USD 3.000 a 10.000" },
  { value: "over_10000", label: "Más de USD 10.000" },
];

export function ContactForm({ initialInterest }: { initialInterest?: Interest }) {
  const [interest, setInterest] = useState<Interest | "">(initialInterest ?? "");
  const [budget, setBudget] = useState<Budget | "">("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [netError, setNetError] = useState(false);
  const [result, setResult] = useState<{ id: string; email: string } | null>(null);
  const startedRef = useRef(false);
  const keyRef = useRef<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    keyRef.current = crypto.randomUUID();
  }, []);

  const onFirstInput = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      track("inquiry_started", { route: "/contacto" });
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    setErrors({});
    setNetError(false);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      interest,
      problem: String(fd.get("problem") ?? ""),
      systems: String(fd.get("systems") ?? ""),
      budget,
      privacy: fd.get("privacy") === "on",
      website: String(fd.get("website") ?? ""),
      idempotencyKey: keyRef.current,
      sourcePath: typeof window !== "undefined" ? window.location.pathname : "/contacto",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setState("error");
        setTimeout(() => summaryRef.current?.focus(), 0);
        return;
      }
      if (!res.ok) {
        setNetError(true);
        setState("error");
        setTimeout(() => summaryRef.current?.focus(), 0);
        return;
      }
      // Éxito confirmado por el servidor.
      setResult({ id: data.inquiryId, email: payload.email });
      setState("sent");
      track("inquiry_submitted", { route: "/contacto", solutionId: interest || undefined });
      fbTrack("Lead", { content_name: "Contacto a medida", content_category: interest || "orientacion" });
      // rotar clave tras éxito
      keyRef.current = crypto.randomUUID();
    } catch {
      setNetError(true);
      setState("error");
      setTimeout(() => summaryRef.current?.focus(), 0);
    }
  };

  if (state === "sent" && result) {
    return (
      <div className="ct-success" role="status" aria-live="polite">
        <h2 className="ct-success-title">Recibimos tu consulta.</h2>
        <p>
          Vamos a revisar el contexto y contactarte en <strong>{result.email}</strong>. Enviar una
          consulta no inicia producción ni confirma una contratación.
        </p>
        <p className="ct-success-id m-mono">Consulta #{result.id.slice(0, 8)}</p>
        <a href="/" className="m-btn-ghost">Volver al inicio</a>
      </div>
    );
  }

  const errCount = Object.keys(errors).length;

  return (
    <form ref={formRef} className="ct-form" onSubmit={submit} onInput={onFirstInput} noValidate>
      {(errCount > 0 || netError) && (
        <div ref={summaryRef} tabIndex={-1} className="ct-errsummary" role="alert">
          {netError
            ? "No pudimos confirmar el envío. Tus datos siguen en el formulario para que puedas volver a intentarlo."
            : "Revisá los campos marcados."}
          {netError && (
            <span>
              {" "}También podés escribir a <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </span>
          )}
        </div>
      )}

      <div className="ct-row2">
        <div className="ct-field">
          <label htmlFor="ct-name">Nombre</label>
          <input id="ct-name" name="name" type="text" autoComplete="name" required maxLength={120}
            aria-invalid={!!errors.name} aria-describedby={errors.name ? "ct-name-err" : undefined} />
          {errors.name && <p id="ct-name-err" className="ct-err">{errors.name}</p>}
        </div>
        <div className="ct-field">
          <label htmlFor="ct-email">Email</label>
          <input id="ct-email" name="email" type="email" autoComplete="email" required maxLength={254}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? "ct-email-err" : undefined} />
          {errors.email && <p id="ct-email-err" className="ct-err">{errors.email}</p>}
        </div>
      </div>

      <div className="ct-field">
        <label htmlFor="ct-company">Empresa <span className="ct-opt">(opcional)</span></label>
        <input id="ct-company" name="company" type="text" autoComplete="organization" maxLength={160} />
      </div>

      <fieldset className="ct-fieldset" aria-describedby={errors.interest ? "ct-interest-err" : undefined}>
        <legend>Qué querés mejorar</legend>
        <div className="ct-chips">
          {INTERESTS.map((o) => (
            <label key={o.value} className={`ct-chip ${interest === o.value ? "is-on" : ""}`}>
              <input type="radio" name="interest" value={o.value} checked={interest === o.value}
                onChange={() => setInterest(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
        {errors.interest && <p id="ct-interest-err" className="ct-err">{errors.interest}</p>}
      </fieldset>

      <div className="ct-field">
        <label htmlFor="ct-problem">El proceso y el resultado esperado</label>
        <textarea id="ct-problem" name="problem" rows={6} required minLength={20} maxLength={3000}
          aria-invalid={!!errors.problem} aria-describedby={errors.problem ? "ct-problem-err" : "ct-problem-help"} />
        <p id="ct-problem-help" className="ct-help">Contanos qué proceso querés mejorar y qué resultado buscás.</p>
        {errors.problem && <p id="ct-problem-err" className="ct-err">{errors.problem}</p>}
      </div>

      <div className="ct-field">
        <label htmlFor="ct-systems">Herramientas que usás <span className="ct-opt">(opcional)</span></label>
        <input id="ct-systems" name="systems" type="text" maxLength={500} />
      </div>

      <fieldset className="ct-fieldset">
        <legend>Inversión estimada <span className="ct-opt">(opcional)</span></legend>
        <div className="ct-chips">
          {BUDGETS.map((o) => (
            <label key={o.value} className={`ct-chip ${budget === o.value ? "is-on" : ""}`}>
              <input type="radio" name="budget" value={o.value} checked={budget === o.value}
                onChange={() => setBudget(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="ct-field ct-privacy">
        <label className="ct-check">
          <input type="checkbox" name="privacy" required aria-invalid={!!errors.privacy}
            aria-describedby={errors.privacy ? "ct-privacy-err" : undefined} />
          <span>Leí y acepto la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>. No me suscribe a comunicaciones de marketing.</span>
        </label>
        {errors.privacy && <p id="ct-privacy-err" className="ct-err">{errors.privacy}</p>}
      </div>

      {/* honeypot */}
      <div aria-hidden="true" className="ct-hp">
        <label htmlFor="ct-website">No completar</label>
        <input id="ct-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="m-btn ct-submit" disabled={state === "sending"} aria-busy={state === "sending"}>
        {state === "sending" ? "Enviando consulta…" : "Enviar consulta"}
      </button>
    </form>
  );
}
