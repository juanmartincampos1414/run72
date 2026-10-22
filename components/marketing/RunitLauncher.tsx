"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RunDiamond } from "./RunDiamond";

// Lanzador discreto de Runit (§12.1). Sin zigzag, glitch fuerte ni promesas de
// 72h. Abre un panel accesible de orientación que conversa con /api/assistant.
// Runit no escribe leads ni envía emails; puede pasar un resumen al formulario.

type Msg = { role: "user" | "assistant"; content: string };

// Tipos mínimos de la Web Speech API (no estándar en lib.dom).
type SpeechRecEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecLike = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: SpeechRecEvent) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
  start: () => void; stop: () => void;
};
type SpeechRecCtor = new () => SpeechRecLike;

// Render mínimo de **negrita** para que los asteriscos no se muestren literales.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}

const FIRST: Msg = {
  role: "assistant",
  content:
    "Soy Runit. Puedo ayudarte a ubicar tu necesidad entre software a medida, agentes e integraciones. Contame qué tarea o proceso querés mejorar.",
};

const QUICK = [
  { label: "Ver soluciones", href: "/servicios" },
  { label: "Explorar demos", href: "/labs" },
  { label: "Hacer Runit Scan", href: "/runit-scan" },
];

export function RunitLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([FIRST]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRecLike | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("run:open-runit", onOpen);
    return () => window.removeEventListener("run:open-runit", onOpen);
  }, []);

  // Detener la escucha si se cierra el panel.
  useEffect(() => {
    if (!open && listening) recRef.current?.stop();
  }, [open, listening]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }].slice(-12);
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.role !== "assistant" || m !== FIRST) }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = typeof data.reply === "string" ? data.reply : "No pude responder en este momento. Podés contarnos tu proyecto por el formulario.";
      setMessages((m) => [...m, { role: "assistant" as const, content: reply }].slice(-14));
    } catch {
      setMessages((m) => [...m, { role: "assistant" as const, content: "No pude responder en este momento. Podés contarnos tu proyecto por el formulario." }]);
    } finally {
      setBusy(false);
    }
  };

  // Voz real (Web Speech API). Pide micrófono solo al pulsar; detiene/cancela;
  // si no hay soporte o se deniega, queda la alternativa por texto.
  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setVoiceMsg("Tu navegador no soporta voz. Escribí tu mensaje.");
      return;
    }
    try {
      const rec = new SR();
      rec.lang = "es-AR";
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (e: SpeechRecEvent) => {
        const t = Array.from(e.results).map((r) => r[0].transcript).join(" ");
        setInput(t);
      };
      rec.onend = () => { setListening(false); setVoiceMsg(""); };
      rec.onerror = () => { setListening(false); setVoiceMsg("No pude escuchar. Probá de nuevo o escribí."); };
      recRef.current = rec;
      setVoiceMsg("Escuchando… tocá el micrófono para detener.");
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      setVoiceMsg("No pude acceder al micrófono. Escribí tu mensaje.");
    }
  };

  const passToForm = () => {
    const summary = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ")
      .slice(0, 1000);
    try {
      sessionStorage.setItem("run-runit-summary", summary);
    } catch {
      /* ignore */
    }
    window.location.href = "/contacto";
  };

  const hasUserMsg = messages.some((m) => m.role === "user");

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="rl-fab"
        aria-label="Abrir asistente Runit"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <RunDiamond size={34} />
      </button>

      {open && (
        <div ref={panelRef} className="rl-panel" role="dialog" aria-label="Runit · Orientación de proyectos">
          <div className="rl-head">
            <span className="rl-title"><RunDiamond size={18} className="rl-title-mark" /> Runit · Orientación de proyectos</span>
            <button type="button" className="rl-close" aria-label="Minimizar asistente" onClick={() => { setOpen(false); launcherRef.current?.focus(); }}>✕</button>
          </div>

          <div ref={logRef} className="rl-log" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`rl-msg rl-${m.role}`}>
                {m.role === "assistant" ? renderInline(m.content) : m.content}
              </div>
            ))}
            {busy && <div className="rl-msg rl-assistant rl-typing">Pensando…</div>}
          </div>

          <div className="rl-quick">
            {QUICK.map((q) => (
              <Link key={q.href} href={q.href} className="rl-chip" onClick={() => setOpen(false)}>{q.label}</Link>
            ))}
            <button type="button" className="rl-chip" onClick={() => inputRef.current?.focus()}>Contar mi proyecto</button>
          </div>

          <form
            className="rl-form"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <textarea
              ref={inputRef}
              className="rl-input"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Contame qué proceso querés mejorar…"
              aria-label="Mensaje para Runit"
              maxLength={1500}
            />
            <button
              type="button"
              className={`rl-mic ${listening ? "is-on" : ""}`}
              aria-pressed={listening}
              aria-label={listening ? "Detener voz" : "Hablar por voz"}
              onClick={toggleMic}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </button>
            <button type="submit" className="rl-send m-btn" disabled={busy || !input.trim()}>Enviar</button>
          </form>

          {voiceMsg && <p className="rl-voice" role="status" aria-live="polite">{voiceMsg}</p>}

          {hasUserMsg && (
            <button type="button" className="rl-pass" onClick={passToForm}>
              Pasar este resumen al formulario →
            </button>
          )}
          <p className="rl-note">Runit orienta; no pide claves ni datos sensibles y no agenda reuniones.</p>
        </div>
      )}
    </>
  );
}
