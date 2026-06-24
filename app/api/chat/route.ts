import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rate-limit";
import { logEvent } from "@/lib/audit";
import { computeTotals } from "@/lib/pricing";
import {
  buildCatalog,
  buildSystemPrompt,
  CONCIERGE_SCHEMA,
  type ConciergeOutput,
} from "@/lib/concierge";
import type { Service, Microservice, LineItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  const limited = await enforceRateLimit({ req, supabase, endpoint: "/api/chat", limit: 40 });
  if (limited) return limited;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      message:
        "El asistente no está disponible en este momento. Podés usar el formulario para cotizar tu proyecto.",
      proposal: null,
      pricing: null,
      contact: null,
      unavailable: true,
    });
  }

  let messages: ChatMessage[] = [];
  let sessionId: string | null = null;
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages : [];
    sessionId = body.sessionId ?? null;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // Saneamos: solo roles válidos, content string, y arrancamos desde el primer "user".
  const clean = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  const firstUser = clean.findIndex((m) => m.role === "user");
  const convo = firstUser === -1 ? [] : clean.slice(firstUser);
  if (convo.length === 0) {
    return NextResponse.json({ error: "Conversación vacía." }, { status: 400 });
  }

  // Catálogo desde la DB (única fuente de servicios y precios).
  const { data: svc } = await supabase
    .from("services")
    .select("id, slug, name, category, description, price_ars, type, active, sort_order")
    .eq("active", true);
  const services = (svc ?? []) as Service[];
  const { data: mic } = await supabase
    .from("microservices")
    .select("id, service_slug, group_name, slug, name, description, price_ars, active, default_on, sort_order")
    .eq("active", true);
  const micros = (mic ?? []) as Microservice[];

  let parsed: ConciergeOutput;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2000,
      output_config: { format: { type: "json_schema", schema: CONCIERGE_SCHEMA }, effort: "low" },
      system: buildSystemPrompt(buildCatalog(services, micros)),
      messages: convo,
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
    parsed = JSON.parse(raw) as ConciergeOutput;
  } catch {
    return NextResponse.json({
      message:
        "Tuve un problema para procesar eso. ¿Lo podés decir de otra forma? Si preferís, también podés usar el formulario.",
      proposal: null,
      pricing: null,
      contact: null,
    });
  }

  // Validación anti-alucinación: solo slugs/claves que existen en el catálogo.
  let pricing: null | (ReturnType<typeof computeTotals> & {
    lineItems: LineItem[];
    depositPercent: number;
  }) = null;
  let proposal = parsed.proposal;

  if (proposal) {
    const bySlug = new Map(services.map((s) => [s.slug, s]));
    const microKey = new Map(micros.map((m) => [`${m.service_slug}:${m.slug}`, m]));

    const projectTypes = (proposal.projectTypes ?? []).filter((s) => bySlug.has(s));
    const addons = (proposal.addons ?? []).filter((s) => bySlug.has(s));
    const microservices = (proposal.microservices ?? []).filter((k) => microKey.has(k));
    proposal = { ...proposal, projectTypes, addons, microservices };

    const { data: config } = await supabase
      .from("config")
      .select("deposit_percent")
      .eq("id", 1)
      .maybeSingle();
    const depositPercent = config?.deposit_percent ?? 30;

    const lineItems: LineItem[] = [];
    for (const slug of [...projectTypes, ...addons]) {
      const s = bySlug.get(slug);
      if (s) lineItems.push({ name: s.name, price_ars: s.price_ars });
    }
    for (const key of microservices) {
      const m = microKey.get(key);
      if (m) lineItems.push({ name: `↳ ${m.name}`, price_ars: m.price_ars });
    }
    pricing = { ...computeTotals(lineItems, depositPercent), lineItems, depositPercent };

    await logEvent(supabase, "proposal_generated", null, {
      sessionId,
      total: pricing.total,
      projectTypes,
      addons,
      microservices,
    });
  }

  return NextResponse.json({
    message: parsed.message,
    proposal,
    pricing,
    contact: parsed.contact,
  });
}
