/**
 * Feed de referencias reales de Refero (refero.design) para el generador de
 * previews. Refero expone un MCP HTTP (JSON-RPC) con un Bearer token estático,
 * así que lo llamamos server-side. Devuelve, para una búsqueda, pantallas reales
 * de productos top con su blueprint (layout/descripción) + screenshot pública.
 *
 * TODO resiliente: si falta el token o Refero falla, devolvemos [] y el generador
 * sigue sin referencias (nunca rompe la generación del preview).
 */

const MCP_URL = process.env.REFERO_MCP_URL || "https://api.refero.design/mcp";

export type ReferoRef = {
  domain: string;
  description: string;
  functions: string;
  layout: string;
  uxPatterns: string;
  imageUrl: string;
};

export type ReferoImage = { base64: string; mediaType: string };

function sseJson(text: string): unknown {
  const data = text
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.slice(5).trim())
    .join("");
  return JSON.parse(data || text);
}

/** Parsea el markdown que devuelve refero_search_screens en ReferoRef[]. */
function parseScreens(md: string, limit: number): ReferoRef[] {
  const blocks = md.split(/^## Screen:/m).slice(1);
  const refs: ReferoRef[] = [];
  for (const b of blocks.slice(0, limit)) {
    const field = (label: string) => {
      const m = b.match(new RegExp(`\\*\\*${label}\\*\\*:\\s*(.+)`));
      return m ? m[1].trim() : "";
    };
    refs.push({
      domain: field("Domain") || field("Name"),
      description: field("Description"),
      functions: field("Functions"),
      layout: field("Layout"),
      uxPatterns: field("UX Patterns"),
      imageUrl: field("Preview URL"),
    });
  }
  return refs.filter((r) => r.layout || r.description);
}

/** Busca referencias reales en Refero para una query. Nunca lanza: [] ante fallo. */
export async function getReferences(query: string, limit = 3): Promise<ReferoRef[]> {
  const token = process.env.REFERO_MCP_TOKEN;
  if (!token) return [];
  const H = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  try {
    // Handshake mínimo (initialize) — Refero no usa session id.
    await fetch(MCP_URL, {
      method: "POST",
      headers: H,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "run72", version: "1.0" } },
      }),
    });
    const r = await fetch(MCP_URL, {
      method: "POST",
      headers: H,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "refero_search_screens",
          arguments: { query, platform: "web", response_format: "md" },
        },
      }),
    });
    if (!r.ok) return [];
    const parsed = sseJson(await r.text()) as { result?: { content?: Array<{ type: string; text?: string }> } };
    const textBlock = parsed.result?.content?.find((c) => c.type === "text");
    if (!textBlock?.text) return [];
    return parseScreens(textBlock.text, limit);
  } catch {
    return [];
  }
}

/** Baja una screenshot de referencia y la devuelve en base64 (para vision). */
export async function fetchReferenceImage(url: string): Promise<ReferoImage | null> {
  if (!url || !/^https:\/\/images\.refero\.design\//.test(url)) return null;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const type = r.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 4_000_000) return null; // guardarraíl de tamaño
    return { base64: buf.toString("base64"), mediaType: type };
  } catch {
    return null;
  }
}

/** Texto compacto con el blueprint de las referencias, para inyectar en el prompt. */
export function referencesToPrompt(refs: ReferoRef[]): string {
  if (refs.length === 0) return "";
  const lines = refs.map((r, i) => {
    const parts = [
      `Referencia ${i + 1}${r.domain ? ` (${r.domain})` : ""}:`,
      r.description ? `  Qué es: ${r.description}` : "",
      r.layout ? `  Layout: ${r.layout}` : "",
    ].filter(Boolean);
    return parts.join("\n");
  });
  return [
    "REFERENCIAS REALES DE DISEÑO (Refero — productos top de verdad). Usalas como VARA de calidad y estructura: seguí su nivel de layout, jerarquía y pulido, PERO adaptá todo al rubro y la marca del cliente. NO copies su contenido ni su negocio:",
    ...lines,
  ].join("\n");
}
