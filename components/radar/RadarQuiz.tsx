"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RunitFigure } from "@/components/runit/RunitFigure";
import {
  QUESTIONS,
  STAGES,
  scoreRadar,
  type DimScore,
  type RadarResult,
} from "@/lib/radar";

type Phase = "intro" | "quiz" | "result";

const DIM_TIP: Record<string, string> = {
  PO: "Elegí un proceso repetitivo y automatizalo de punta a punta con IA.",
  CO: "Sumá IA a tu canal de atención o a cómo captás clientes, y medí el resultado.",
  DT: "Ordená tus datos y pasá a herramientas de IA con accesos y seguridad.",
  PC: "Nombrá un responsable y armá una formación corta por área.",
  ES: "Poné la IA en la agenda del año con 2-3 prioridades y una métrica.",
  GR: "Escribí reglas mínimas de uso y definí qué datos no se cargan.",
};

/* ---------- Runit, presente como guía ---------- */
function RunitGuide({ line }: { line: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative inline-grid h-12 w-12 shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.55),transparent_70%)] blur-md" />
        <RunitFigure idp="rq" className="relative z-10 !w-11" />
      </span>
      <p className="font-mono text-sm leading-snug text-brand-violet/90">
        <span className="text-brand-violet">›</span> {line}
      </p>
    </div>
  );
}

/* ---------- Radar hexagonal ---------- */
function RadarChart({ dims }: { dims: DimScore[] }) {
  const size = 300;
  const c = size / 2;
  const R = 96;
  const n = dims.length;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  };
  const ring = (l: number) =>
    dims.map((_, i) => pt(i, (l / 4) * R).join(",")).join(" ");
  const dataPts = dims.map((d, i) => pt(i, (d.level / 4) * R).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[340px]" role="img" aria-label="Radar de dimensiones">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {[1, 2, 3, 4].map((l) => (
        <polygon key={l} points={ring(l)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {dims.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      <polygon points={dataPts} fill="url(#radarFill)" fillOpacity="0.35" stroke="#a855f7" strokeWidth="2" />
      {dims.map((d, i) => {
        const [x, y] = pt(i, (d.level / 4) * R);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#dffaff" />;
      })}
      {dims.map((d, i) => {
        const [x, y] = pt(i, R + 20);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontWeight="600" fill="#9aa0ad">
            {d.short}
          </text>
        );
      })}
    </svg>
  );
}

/* ---------- Captura de lead ---------- */
function LeadForm({ result }: { result: RadarResult }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { name, email, whatsapp },
          stage: result.stage.name,
          stageLevel: result.stageLevel,
          dims: result.dims.map((d) => ({ name: d.name, level: d.level })),
          moves: result.moves.map((m) => ({ name: m.name, from: m.level, service: m.service })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No pudimos enviarlo. Probá de nuevo.");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setError("No pudimos enviarlo. Probá de nuevo.");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-3xl border border-brand-violet/30 bg-surface/50 p-8 text-center">
        <h3 className="font-display text-2xl font-semibold">¡Listo! Te escribimos.</h3>
        <p className="mt-2 text-muted">
          Tu diagnóstico ya nos llegó. Te contactamos para coordinar la call y mostrarte cómo lo resolvemos en 72 horas.
        </p>
        <Link href="/cotizar" className="mt-6 inline-flex rounded-full bg-[linear-gradient(100deg,#38bdf8,#6366f1_48%,#a855f7)] px-6 py-3 text-sm font-medium text-white">
          Mientras tanto, cotizá tu proyecto →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-surface/50 p-6 sm:p-8">
      <h3 className="font-display text-xl font-semibold">Recibí el informe + coordiná una call</h3>
      <p className="mt-1.5 text-sm text-muted">
        Te mandamos el diagnóstico y te mostramos cómo RUN72 lo ejecuta. Sin compromiso.
      </p>
      <div className="mt-5 flex flex-col gap-3">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
          className="rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none focus:border-brand-violet" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu email"
          className="rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none focus:border-brand-violet" />
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp (opcional)"
          className="rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none focus:border-brand-violet" />
      </div>
      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      <button type="submit" disabled={state === "sending"}
        className="mt-5 w-full rounded-full bg-[linear-gradient(100deg,#38bdf8,#6366f1_48%,#a855f7)] px-6 py-3.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60">
        {state === "sending" ? "Enviando…" : "Enviar mi diagnóstico"}
      </button>
    </form>
  );
}

/* ---------- Resultado ---------- */
function Result({ result, onRestart }: { result: RadarResult; onRestart: () => void }) {
  const { stage, stageLevel, dims, moves } = result;
  return (
    <div className="flex flex-col gap-10">
      <RunitGuide line={`Listo. Tu negocio está ${stage.name.toLowerCase()} con IA. Acá va el detalle.`} />

      {/* Estadio */}
      <div className="overflow-hidden rounded-3xl border border-line bg-[linear-gradient(180deg,#121218,#0b0b0f)] p-7 sm:p-9">
        <div className="mb-6 flex flex-wrap gap-1.5">
          {STAGES.map((s) => (
            <span key={s.key}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                s.level === stageLevel
                  ? "bg-[linear-gradient(100deg,#38bdf8,#a855f7)] text-white"
                  : s.level < stageLevel
                    ? "bg-white/10 text-fg"
                    : "bg-white/[0.03] text-faint"
              }`}>
              {s.name}
            </span>
          ))}
        </div>
        <p className="text-sm font-medium uppercase tracking-wider text-brand-violet">Tu estadio</p>
        <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Estás <span className="text-gradient">{stage.name}</span> con IA.
        </h2>
        <p className="mt-3 max-w-xl text-muted">{stage.desc}</p>
      </div>

      {/* Radar + dims */}
      <div className="grid items-center gap-8 rounded-3xl border border-line bg-surface/40 p-7 sm:p-9 lg:grid-cols-[auto_1fr]">
        <div className="mx-auto"><RadarChart dims={dims} /></div>
        <div className="flex flex-col gap-2.5">
          <h3 className="font-display text-lg font-semibold">Tu perfil en 6 dimensiones</h3>
          {dims.map((d) => (
            <div key={d.code} className="flex items-center justify-between gap-3 border-b border-line/60 pb-2 text-sm">
              <span className="text-muted">{d.name}</span>
              <span className="flex items-center gap-2">
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4].map((l) => (
                    <span key={l} className={`h-1.5 w-4 rounded-full ${l <= d.level ? "bg-brand-violet" : "bg-white/10"}`} />
                  ))}
                </span>
                <span className="w-8 text-right font-mono text-xs text-fg">N{d.level}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Movidas */}
      <div>
        <h3 className="font-display text-2xl font-semibold">Tus 3 primeras movidas</h3>
        <p className="mt-1 text-muted">Empezá por tus dimensiones más flojas. Así lo resolvemos en RUN72.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {moves.map((m, i) => (
            <div key={m.code} className="flex flex-col rounded-3xl border border-line bg-surface/40 p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-brand-violet/40 font-mono text-sm text-brand-violet">{i + 1}</span>
                <span className="font-mono text-xs text-faint">N{m.level} → N{Math.min(4, m.level + 1)}</span>
              </div>
              <h4 className="font-display text-base font-semibold">{m.name}</h4>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{DIM_TIP[m.code]}</p>
              <div className="mt-4 rounded-2xl border border-brand-violet/20 bg-brand-violet/[0.06] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-violet">Con RUN72</p>
                <p className="mt-1 text-sm text-fg">{m.service}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead + CTAs */}
      <LeadForm result={result} />

      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link href="/cotizar" className="rounded-full border border-slate px-5 py-2.5 text-porcelain hover:border-porcelain">
          Cotizar mi proyecto
        </Link>
        <button onClick={onRestart} className="text-faint underline hover:text-fg">Rehacer el radar</button>
      </div>
    </div>
  );
}

/* ---------- Quiz ---------- */
export function RadarQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const result = useMemo(
    () => (phase === "result" ? scoreRadar(answers) : null),
    [phase, answers],
  );

  const q = QUESTIONS[idx];
  const progress = Math.round((idx / QUESTIONS.length) * 100);

  const choose = (level: number) => {
    const next = { ...answers, [q.id]: level };
    setAnswers(next);
    if (idx + 1 < QUESTIONS.length) {
      setIdx(idx + 1);
    } else {
      setPhase("result");
    }
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg text-center">
        <span className="relative mx-auto inline-grid h-28 w-28 place-items-center">
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.5),transparent_70%)] blur-xl" />
          <RunitFigure idp="rqintro" className="relative z-10 !w-24" />
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Radar de IA <span className="text-gradient">RUN72</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Soy Runit. En 3 minutos te digo <strong className="text-fg">dónde está parado tu negocio con IA</strong> y qué conviene hacer primero.
        </p>
        <p className="mt-2 text-sm text-faint">12 preguntas · sin registrarte para ver el resultado</p>
        <button onClick={() => setPhase("quiz")}
          className="mt-8 rounded-full bg-[linear-gradient(100deg,#38bdf8,#6366f1_48%,#a855f7)] px-8 py-4 text-base font-medium text-white shadow-[0_8px_30px_-10px_rgba(168,85,247,0.9)] transition hover:brightness-110">
          Empezar el radar
        </button>
      </div>
    );
  }

  if (phase === "result" && result) {
    return <Result result={result} onRestart={() => { setAnswers({}); setIdx(0); setPhase("intro"); }} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progreso */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between font-mono text-xs text-faint">
          <span>Pregunta {idx + 1} de {QUESTIONS.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(100deg,#38bdf8,#a855f7)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <RunitGuide line={q.runit} />

      <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{q.q}</h2>

      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => choose(i + 1)}
            className="group flex items-center gap-3 rounded-2xl border border-line bg-surface/40 px-5 py-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-brand-violet/50 hover:bg-surface-2/60">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-faint transition-colors group-hover:border-brand-violet group-hover:text-brand-violet">
              {i + 1}
            </span>
            <span className="text-fg">{opt}</span>
          </button>
        ))}
      </div>

      {idx > 0 && (
        <button onClick={() => setIdx(idx - 1)} className="mt-6 text-sm text-faint underline hover:text-fg">
          ← Volver
        </button>
      )}
    </div>
  );
}
