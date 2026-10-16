"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RunitFigure } from "@/components/runit/RunitFigure";
import { fbTrack } from "@/lib/meta-pixel";
import {
  QUESTIONS,
  STAGES,
  NIVEL,
  scoreRadar,
  type AreaScore,
  type RadarResult,
} from "@/lib/radar";

type Mode = "botones" | "chat" | "audio";
type Phase = "intro" | "quiz" | "result";

/* ---------- Runit avatar + línea ---------- */
function RunitAvatar({ size = 44 }: { size?: number }) {
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.55),transparent_70%)] blur-md" />
      <RunitFigure idp="rq" className="relative z-10" />
    </span>
  );
}
function RunitLine({ line }: { line: string }) {
  return (
    <div className="flex items-center gap-3">
      <RunitAvatar />
      <p className="font-mono text-sm leading-snug text-brand-violet/90">
        <span className="text-brand-violet">›</span> {line}
      </p>
    </div>
  );
}

/* ---------- Radar hexagonal ---------- */
function RadarChart({ areas }: { areas: AreaScore[] }) {
  const size = 300, c = size / 2, R = 96, n = areas.length;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  };
  const ring = (l: number) => areas.map((_, i) => pt(i, (l / 4) * R).join(",")).join(" ");
  const data = areas.map((a, i) => pt(i, (a.level / 4) * R).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[340px]" role="img" aria-label="Mapa de áreas">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {[1, 2, 3, 4].map((l) => <polygon key={l} points={ring(l)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />)}
      {areas.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />; })}
      <polygon points={data} fill="url(#radarFill)" fillOpacity="0.35" stroke="#a855f7" strokeWidth="2" />
      {areas.map((a, i) => { const [x, y] = pt(i, (a.level / 4) * R); return <circle key={i} cx={x} cy={y} r="3.5" fill="#dffaff" />; })}
      {areas.map((a, i) => { const [x, y] = pt(i, R + 20); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill="#9aa0ad">{a.short}</text>; })}
    </svg>
  );
}

/* ---------- Lead → videollamada ---------- */
function LeadForm({ result }: { result: RadarResult }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending"); setError("");
    try {
      const res = await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { name, email, whatsapp },
          stage: result.stage.name,
          stageLevel: result.stageLevel,
          areas: result.areas.map((a) => ({ name: a.name, level: a.level })),
          steps: result.steps.map((s) => ({ name: s.name, service: s.service })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "No pudimos enviarlo. Probá de nuevo."); setState("error"); return; }
      setState("sent");
      fbTrack("Lead", { content_name: "Runit Scan", content_category: result.stage.name });
    } catch { setError("No pudimos enviarlo. Probá de nuevo."); setState("error"); }
  };

  if (state === "sent") {
    return (
      <div className="rounded-3xl border border-brand-violet/30 bg-surface/50 p-8 text-center">
        <h3 className="font-display text-2xl font-semibold">¡Listo! Ya coordinamos.</h3>
        <p className="mt-2 text-muted">
          Te vamos a escribir para agendar la <strong className="text-fg">videollamada</strong>, profundizar en tu caso y armarte el presupuesto a medida. Te mandamos una copia de tu diagnóstico por mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-surface/50 p-6 sm:p-8">
      <h3 className="font-display text-xl font-semibold">Coordinemos una videollamada</h3>
      <p className="mt-1.5 text-sm text-muted">
        Dejanos tus datos: profundizamos en tu caso y te armamos un <strong className="text-fg">presupuesto a medida</strong>. Sin compromiso.
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
        {state === "sending" ? "Enviando…" : "Quiero la videollamada"}
      </button>
    </form>
  );
}

/* ---------- Resultado ---------- */
function Result({ result, onRestart }: { result: RadarResult | null; onRestart: () => void }) {
  if (!result) return null;
  const { stage, stageLevel, areas, steps } = result;
  return (
    <div className="flex flex-col gap-10">
      <RunitLine line={`Listo. Tu negocio está ${stage.name.toLowerCase()} con IA. Mirá tu mapa.`} />

      <div className="overflow-hidden rounded-3xl border border-line bg-[linear-gradient(180deg,#121218,#0b0b0f)] p-7 sm:p-9">
        <div className="mb-6 flex flex-wrap gap-1.5">
          {STAGES.map((s) => (
            <span key={s.key} className={`rounded-full px-3 py-1 text-xs font-medium ${
              s.level === stageLevel ? "bg-[linear-gradient(100deg,#38bdf8,#a855f7)] text-white"
                : s.level < stageLevel ? "bg-white/10 text-fg" : "bg-white/[0.03] text-faint"}`}>
              {s.name}
            </span>
          ))}
        </div>
        <p className="text-sm font-medium uppercase tracking-wider text-brand-violet">Dónde estás</p>
        <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Estás <span className="text-gradient">{stage.name.toLowerCase()}</span> con IA.
        </h2>
        <p className="mt-3 max-w-xl text-muted">{stage.desc}</p>
      </div>

      <div className="grid items-center gap-8 rounded-3xl border border-line bg-surface/40 p-7 sm:p-9 lg:grid-cols-[auto_1fr]">
        <div className="mx-auto"><RadarChart areas={areas} /></div>
        <div className="flex flex-col gap-2.5">
          <h3 className="font-display text-lg font-semibold">Tu mapa en 6 áreas</h3>
          {areas.map((a) => (
            <div key={a.code} className="flex items-center justify-between gap-3 border-b border-line/60 pb-2 text-sm">
              <span className="text-muted">{a.name}</span>
              <span className="flex items-center gap-2">
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4].map((l) => <span key={l} className={`h-1.5 w-4 rounded-full ${l <= a.level ? "bg-brand-violet" : "bg-white/10"}`} />)}
                </span>
                <span className="hidden w-28 text-right text-xs text-faint sm:inline">{NIVEL[a.level]}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-2xl font-semibold">Por dónde empezar</h3>
        <p className="mt-1 text-muted">Tus 3 áreas más flojas y cómo las resolvemos en RUN72.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.code} className="flex flex-col rounded-3xl border border-line bg-surface/40 p-6">
              <span className="mb-3 grid h-7 w-7 place-items-center rounded-full border border-brand-violet/40 font-mono text-sm text-brand-violet">{i + 1}</span>
              <h4 className="font-display text-base font-semibold">{s.name}</h4>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.tip}</p>
              <div className="mt-4 rounded-2xl border border-brand-violet/20 bg-brand-violet/[0.06] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-violet">Con RUN72</p>
                <p className="mt-1 text-sm text-fg">{s.service}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LeadForm result={result} />
      <div className="text-center">
        <button onClick={onRestart} className="text-sm text-faint underline hover:text-fg">Hacerlo de nuevo</button>
      </div>
    </div>
  );
}

/* ---------- Modo botones ---------- */
function ButtonsQuiz({ onDone }: { onDone: (a: Record<string, number>) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const q = QUESTIONS[idx];
  const progress = Math.round((idx / QUESTIONS.length) * 100);

  const choose = (level: number) => {
    const next = { ...answers, [q.area]: level };
    setAnswers(next);
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else onDone(next);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex justify-between font-mono text-xs text-faint">
          <span>Pregunta {idx + 1} de {QUESTIONS.length}</span><span>{progress}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(100deg,#38bdf8,#a855f7)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <RunitLine line={q.runit} />
      <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{q.q}</h2>
      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => choose(i + 1)}
            className="group flex items-center gap-3 rounded-2xl border border-line bg-surface/40 px-5 py-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-brand-violet/50 hover:bg-surface-2/60">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-faint transition-colors group-hover:border-brand-violet group-hover:text-brand-violet">{i + 1}</span>
            <span className="text-fg">{opt}</span>
          </button>
        ))}
      </div>
      {idx > 0 && <button onClick={() => setIdx(idx - 1)} className="mt-6 text-sm text-faint underline hover:text-fg">← Volver</button>}
    </div>
  );
}

/* ---------- Modo conversación (chat / audio) ---------- */
type Bubble = { who: "bot" | "me"; text: string };

function ChatQuiz({ withMic, onDone }: { withMic: boolean; onDone: (a: Record<string, number>) => void }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const answers = useRef<Record<string, number>>({});
  const recRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const posted = useRef<Set<number>>(new Set());

  const q = QUESTIONS[idx];

  // Postea la pregunta actual cuando cambia (una sola vez por índice).
  useEffect(() => {
    if (idx < QUESTIONS.length && !posted.current.has(idx)) {
      posted.current.add(idx);
      setBubbles((b) => [...b, { who: "bot", text: `${q.runit} ${q.q}` }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [bubbles, busy]);

  const advance = (level: number) => {
    answers.current[q.area] = level;
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else onDone({ ...answers.current });
  };

  // Responder tocando una opción (rápido, sin IA).
  const pickChip = (level: number, label: string) => {
    if (busy) return;
    setBubbles((b) => [...b, { who: "me", text: label }]);
    advance(level);
  };

  // Responder por texto/audio (Runit interpreta con IA).
  const sendText = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBubbles((b) => [...b, { who: "me", text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/radar/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaName: q.runit, question: q.q, options: q.options, userText: text,
          last: idx + 1 >= QUESTIONS.length,
        }),
      });
      const data = await res.json();
      if (data?.unavailable || data?.error || !data?.level) {
        setBubbles((b) => [...b, { who: "bot", text: "No pude leerlo bien. Tocá una de las opciones de abajo 👇" }]);
        setBusy(false);
        return;
      }
      setBubbles((b) => [...b, { who: "bot", text: data.reply }]);
      setBusy(false);
      advance(data.level);
    } catch {
      setBubbles((b) => [...b, { who: "bot", text: "Se me complicó. Tocá una opción de abajo." }]);
      setBusy(false);
    }
  };

  // Micrófono (Web Speech API).
  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setBubbles((b) => [...b, { who: "bot", text: "Tu navegador no soporta audio. Escribí o tocá una opción." }]); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = "es-AR"; rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setInput(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec; setListening(true); rec.start();
  };

  useEffect(() => {
    if (withMic) {
      const t = setTimeout(() => toggleMic(), 800);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.round((idx / QUESTIONS.length) * 100);
  const done = idx >= QUESTIONS.length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex justify-between font-mono text-xs text-faint">
          <span>{done ? "Completado" : `Pregunta ${idx + 1} de ${QUESTIONS.length}`}</span><span>{progress}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(100deg,#38bdf8,#a855f7)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div ref={scrollRef} className="flex max-h-[52vh] flex-col gap-3 overflow-y-auto rounded-3xl border border-line bg-surface/30 p-4 sm:p-6">
        {bubbles.map((b, i) => (
          <div key={i} className={`flex items-end gap-2 ${b.who === "me" ? "flex-row-reverse" : ""}`}>
            {b.who === "bot" ? <RunitAvatar size={30} /> : <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-steel font-mono text-[11px] text-ash">Vos</span>}
            <span className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${b.who === "me" ? "rounded-br-sm bg-[linear-gradient(135deg,#6366f1,#a855f7)] text-white" : "rounded-bl-sm bg-steel text-porcelain"}`}>{b.text}</span>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2"><RunitAvatar size={30} /><span className="rounded-2xl rounded-bl-sm bg-steel px-4 py-3 text-sm text-ash">Runit está pensando…</span></div>}
      </div>

      {/* Opciones rápidas de la pregunta actual */}
      {!done && !busy && (
        <div className="mt-4 flex flex-wrap gap-2">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => pickChip(i + 1, opt)}
              className="rounded-full border border-line bg-surface/40 px-3.5 py-2 text-left text-xs text-muted transition hover:border-brand-violet/50 hover:text-fg">
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Entrada de texto + micrófono */}
      {!done && (
        <div className="mt-4 flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendText(); }}
            placeholder={listening ? "Escuchando…" : "Escribí tu respuesta…"} disabled={busy}
            className="flex-1 rounded-full border border-line bg-ink px-4 py-3 text-sm outline-none focus:border-brand-violet" />
          <button type="button" onClick={toggleMic} aria-label="Hablar"
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition ${listening ? "border-brand-violet bg-brand-violet/20 text-brand-violet" : "border-line text-muted hover:text-fg"}`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
          </button>
          <button type="button" onClick={sendText} disabled={busy || !input.trim()} aria-label="Enviar"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#6366f1,#a855f7)] text-white transition hover:brightness-110 disabled:opacity-40">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Raíz ---------- */
export function RadarQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<Mode>("botones");
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const result = useMemo(() => (phase === "result" ? scoreRadar(answers) : null), [phase, answers]);

  const start = (m: Mode) => { setMode(m); setPhase("quiz"); };
  const finish = (a: Record<string, number>) => { setAnswers(a); setPhase("result"); };
  const restart = () => { setAnswers({}); setPhase("intro"); };

  if (phase === "result" && result) return <Result result={result} onRestart={restart} />;

  if (phase === "quiz") {
    return mode === "botones"
      ? <ButtonsQuiz onDone={finish} />
      : <ChatQuiz withMic={mode === "audio"} onDone={finish} />;
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <span className="relative mx-auto inline-grid h-28 w-28 place-items-center">
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.5),transparent_70%)] blur-xl" />
        <RunitFigure idp="rqintro" className="relative z-10 !w-24" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Runit <span className="text-gradient">Scan</span>
      </h1>
      <p className="mt-4 text-lg text-muted">
        Soy Runit. En 2 minutos te digo <strong className="text-fg">dónde está parado tu negocio con IA</strong> y por dónde conviene empezar.
      </p>
      <p className="mt-6 text-sm font-medium text-faint">¿Cómo preferís responder?</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <button onClick={() => start("botones")} className="rounded-2xl border border-line bg-surface/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-violet/50">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
          <p className="mt-2 font-semibold">A botones</p>
          <p className="text-xs text-muted">Lo más rápido: elegís y listo.</p>
        </button>
        <button onClick={() => start("chat")} className="rounded-2xl border border-line bg-surface/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-violet/50">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <p className="mt-2 font-semibold">Chateando</p>
          <p className="text-xs text-muted">Le contás a Runit y él interpreta.</p>
        </button>
        <button onClick={() => start("audio")} className="rounded-2xl border border-line bg-surface/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-violet/50">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
          <p className="mt-2 font-semibold">Por audio</p>
          <p className="text-xs text-muted">Hablás y Runit te escucha.</p>
        </button>
      </div>
      <p className="mt-5 text-xs text-faint">6 preguntas · sin registrarte para ver el resultado</p>
      <a href="/mapa/ejemplo" className="mt-4 inline-block text-sm text-muted underline underline-offset-4 transition hover:text-fg">
        ¿Querés ver qué te entregamos? Mirá un mapa de ejemplo →
      </a>
    </div>
  );
}
