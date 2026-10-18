import { SITE } from "@/lib/marketing/content";
import { SOLUTIONS } from "@/lib/marketing/solutions";
import { ARTICLES } from "@/lib/marketing/articles";
import { getPublishedWorks } from "@/lib/marketing/cases";

export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.run72.app";

// /llms.txt — índice legible por máquinas del contenido público publicado y
// canónico (§18.2). Sin datos privados, leads, prompts internos ni contratos.
export function GET() {
  const lines: string[] = [];
  lines.push("# RUN");
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push("## Servicios");
  lines.push(`- [Servicios](${BASE}/servicios)`);
  for (const s of SOLUTIONS) lines.push(`- [${s.navTitle}](${BASE}/servicios/${s.slug})`);
  lines.push("");
  lines.push("## Trabajos");
  lines.push(`- [Trabajos](${BASE}/trabajos)`);
  for (const w of getPublishedWorks()) lines.push(`- [${w.title}](${BASE}/trabajos/${w.slug})`);
  lines.push("");
  lines.push("## Labs");
  lines.push(`- [Labs](${BASE}/labs)`);
  lines.push(`- [Demo de operación](${BASE}/labs/operacion)`);
  lines.push(`- [Demo de agente](${BASE}/labs/agente)`);
  lines.push(`- [Demo de integración](${BASE}/labs/integraciones)`);
  lines.push("");
  lines.push("## Blog");
  lines.push(`- [Blog](${BASE}/blog)`);
  for (const a of ARTICLES) lines.push(`- [${a.title}](${BASE}/blog/${a.slug})`);
  lines.push("");
  lines.push("## Más");
  lines.push(`- [Cómo trabajamos](${BASE}/como-trabajamos)`);
  lines.push(`- [Contacto](${BASE}/contacto)`);
  lines.push(`- [Runit Scan](${BASE}/runit-scan)`);
  lines.push(`- [Mapa de ejemplo](${BASE}/mapa/ejemplo)`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
