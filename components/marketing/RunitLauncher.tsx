"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RunMark } from "./RunMark";

// Lanzador discreto de Runit (§12.1). Sin zigzag, glitch fuerte ni promesas de
// 72h. Abre un panel accesible de orientación que conversa con /api/assistant.
// Runit no escribe leads ni envía emails; puede pasar un resumen al formulario.

type Msg = { role: "user" | "assistant"; content: string };

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
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("run:open-runit", onOpen);
    return () => window.removeEventListener("run:open-runit", onOpen);
  }, []);

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
        <RunMark size={34} />
      </button>

      {open && (
        <div ref={panelRef} className="rl-panel" role="dialog" aria-label="Runit · Orientación de proyectos">
          <div className="rl-head">
            <span className="rl-title">Runit · Orientación de proyectos</span>
            <button type="button" className="rl-close" aria-label="Minimizar asistente" onClick={() => { setOpen(false); launcherRef.current?.focus(); }}>✕</button>
          </div>

          <div ref={logRef} className="rl-log" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`rl-msg rl-${m.role}`}>{m.content}</div>
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
            <button type="submit" className="rl-send m-btn" disabled={busy || !input.trim()}>Enviar</button>
          </form>

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
