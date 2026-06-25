"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "../Logo";
import { Confirmation } from "./Confirmation";
import { ArrowRight, CheckIcon, BoltIcon } from "../icons";
import { formatARS } from "@/lib/pricing";
import { track, getSessionId } from "@/lib/track";
import type { LineItem, QuoteResult } from "@/lib/types";
import type { ConciergeProposal } from "@/lib/concierge";

const ease = [0.16, 1, 0.3, 1] as const;

type Msg = { role: "user" | "assistant"; content: string };
type Contact = { name: string; email: string; whatsapp: string | null; company: string | null };
type Pricing = {
  lineItems: LineItem[];
  subtotal: number;
  iva: number;
  total: number;
  deposit: number;
  balance: number;
  depositPercent: number;
};

const GREETING =
  "¡Hola! Soy el asistente de RUN72 👋 Contame en una frase qué querés construir o qué problema querés resolver, y armamos juntos tu propuesta.";

export function ChatConcierge({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<ConciergeProposal | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [customerName, setCustomerName] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const proposalRef = useRef<ConciergeProposal | null>(null);
  proposalRef.current = proposal;

  useEffect(() => {
    track("chat_started");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, pricing]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading || creating) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, sessionId: getSessionId() }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.message ?? "…" }]);
      if (data.proposal && data.pricing) {
        setProposal(data.proposal as ConciergeProposal);
        setPricing(data.pricing as Pricing);
      }
      if (data.contact) {
        await finalize(data.contact as Contact);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Tuve un problema de conexión. ¿Probás de nuevo?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function finalize(contact: Contact) {
    const prop = proposalRef.current;
    if (!prop || creating || result) return;
    if (!contact.name || !contact.email) return;
    setCreating(true);
    setError(null);
    const summaryParts = [
      prop.summary,
      prop.detectedNeeds.length ? `Necesidades: ${prop.detectedNeeds.join(", ")}.` : "",
    ].filter(Boolean);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTypes: prop.projectTypes,
          brandStatus: null,
          addons: prop.addons,
          microservices: prop.microservices,
          objective: prop.objective,
          timing: "asap",
          urgencyNote: prop.summary,
          files: [],
          contact: {
            name: contact.name,
            company: contact.company ?? "",
            email: contact.email,
            whatsapp: contact.whatsapp ?? "",
          },
          intake: { businessWhat: prop.summary, source: "chat" },
          sourceType: "chat",
          conversationSummary: summaryParts.join(" "),
          sessionId: getSessionId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el presupuesto.");
      setCustomerName(contact.name);
      setResult(data as QuoteResult);
      track("checkout_started", { leadId: (data as QuoteResult).leadId, total: (data as QuoteResult).total, source: "chat" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "No pude generar el presupuesto. Escribinos a hola@run72.app y lo resolvemos." },
      ]);
    } finally {
      setCreating(false);
    }
  }

  function acceptProposal() {
    if (!proposal) return;
    track("proposal_accepted", { total: pricing?.total });
    send("Quiero avanzar con esta propuesta.");
  }

  function adjustProposal() {
    inputRef.current?.focus();
  }

  if (result) {
    return (
      <Shell onBack={onBack}>
        <Confirmation result={result} name={customerName} onRestart={onBack} />
      </Shell>
    );
  }

  return (
    <Shell onBack={onBack}>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
        {/* Columna del chat */}
        <div className="flex h-[60vh] flex-col lg:h-[calc(100vh-200px)]">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}

            {loading && <Typing />}

            {creating && (
              <div className="rounded-2xl border border-line bg-surface/40 p-4 text-sm text-muted">
                Generando tu presupuesto…
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-2 flex items-end gap-2 border-t border-line pt-4"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Escribí tu mensaje…"
              disabled={creating}
              className="max-h-32 flex-1 resize-none rounded-2xl border border-line bg-surface/60 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || creating}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet text-ink transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Enviar"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Panel de propuesta (fuera del chat) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {pricing && proposal && !creating ? (
            <ProposalCard
              proposal={proposal}
              pricing={pricing}
              onAccept={acceptProposal}
              onAdjust={adjustProposal}
            />
          ) : (
            <div className="hidden rounded-3xl border border-dashed border-line bg-surface/20 p-6 text-center lg:block">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-brand-cyan">
                <BoltIcon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium tracking-tight">Tu propuesta RUN72</p>
              <p className="mt-1 text-xs leading-relaxed text-faint">
                Acá vas a ver el detalle y el precio en cuanto definamos tu proyecto.
              </p>
            </div>
          )}
        </aside>
      </div>
    </Shell>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-brand-blue/20 to-brand-violet/10 text-fg"
            : "border border-line bg-surface/50 text-muted"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}

function Typing() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl border border-line bg-surface/50 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal,
  pricing,
  onAccept,
  onAdjust,
}: {
  proposal: ConciergeProposal;
  pricing: Pricing;
  onAccept: () => void;
  onAdjust: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="glass rounded-3xl p-5"
    >
      <div className="flex items-center gap-2">
        <BoltIcon className="h-4 w-4 text-brand-cyan" />
        <span className="text-sm font-medium tracking-tight">Tu propuesta RUN72</span>
      </div>

      {pricing.lineItems.length > 0 && (
        <ul className="mt-4 space-y-2 border-b border-line pb-4">
          {pricing.lineItems.map((it, i) => (
            <li key={`${it.name}-${i}`} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted">{it.name}</span>
              <span className="tabular-nums text-fg">{formatARS(it.price_ars)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Tile label="Total + IVA" value={formatARS(pricing.total)} />
        <Tile label={`Anticipo ${pricing.depositPercent}%`} value={formatARS(pricing.deposit)} highlight />
        <Tile label="Entrega" value="72 horas" />
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onAccept}
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.01]"
        >
          Continuar <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onAdjust}
          className="rounded-full border border-line px-5 py-3 text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          Ajustar propuesta
        </button>
      </div>
    </motion.div>
  );
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        highlight
          ? "border-brand-blue/30 bg-gradient-to-br from-brand-blue/[0.12] to-brand-violet/[0.06]"
          : "border-line bg-surface/40"
      }`}
    >
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`mt-1 font-display text-base font-semibold tabular-nums ${highlight ? "text-gradient" : "text-fg"}`}>
        {value}
      </p>
    </div>
  );
}

function Shell({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" aria-label="RUN72 — inicio">
            <Logo />
          </Link>
          <button onClick={onBack} className="text-sm text-muted transition-colors hover:text-fg">
            ← Cambiar modo
          </button>
        </div>
      </header>
      <main className="container-x py-8">{children}</main>
    </div>
  );
}
