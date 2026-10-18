"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  getNodesBounds,
  getViewportForBounds,
  type Node,
  type Edge,
} from "@xyflow/react";
import { toPng } from "html-to-image";

export type Celda = { accion: string; responsable?: string; herramienta?: string; tipo?: string };
export type MapArea = {
  area: string; short?: string; service: string; resultado?: string;
  celdas?: Celda[]; acciones?: string[]; // acciones = compat con mapas viejos
};
export type MapFase = { nombre: string; objetivo: string };
export type MapMember = { nombre: string; rol: string };
export type MapConexion = { desde: string; hasta: string; etiqueta: string };
export type MapData = { negocio: string; resumen: string; equipo?: MapMember[]; fases: MapFase[]; areas: MapArea[]; conexiones?: MapConexion[] };

const COLORS = ["#38bdf8", "#a855f7", "#22c55e", "#f59e0b", "#ec4899", "#6366f1"];

/* ---------- Íconos por tipo ---------- */
const I = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const TIPO_ICON: Record<string, ReactNode> = {
  agente: I(<><rect x="5" y="8" width="14" height="10" rx="2" /><path d="M12 8V5M12 5a1 1 0 100-2 1 1 0 000 2z" /><path d="M9 13h.01M15 13h.01M2 12v3M22 12v3" /></>),
  chatbot: I(<path d="M21 15a2 2 0 01-2 2H8l-4 4V5a2 2 0 012-2h13a2 2 0 012 2z" />),
  automatizacion: I(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>),
  datos: I(<><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>),
  analitica: I(<><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="5" width="3" height="13" /></>),
  contenido: I(<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6M9 13h6M9 17h6" /></>),
  integracion: I(<><path d="M10 8V6a2 2 0 10-4 0v2H4v4a2 2 0 002 2h2" /><path d="M14 16v2a2 2 0 104 0v-2h2v-4a2 2 0 00-2-2h-2" /></>),
  capacitacion: I(<><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5" /></>),
  gobernanza: I(<path d="M12 3l8 4v5c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V7z" />),
  default: I(<circle cx="12" cy="12" r="8" />),
};

function initials(name: string) {
  const p = (name || "").trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "·";
}

/* ---------- Nodos ---------- */
function RootNode({ data }: { data: { negocio: string } }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-[linear-gradient(135deg,#0b1220,#1a0f2e)] px-5 py-4 text-center shadow-[0_0_40px_-10px_rgba(168,85,247,0.6)]">
      <div className="mx-auto mb-1.5 h-6 w-6 rounded-md bg-[conic-gradient(from_210deg,#38bdf8,#6366f1,#a855f7)]" />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-violet">Mapa de IA</p>
      <p className="mt-0.5 max-w-[160px] font-display text-sm font-semibold leading-tight text-white">{data.negocio || "Tu negocio"}</p>
      <Handle type="source" position={Position.Right} className="!bg-brand-violet" />
    </div>
  );
}
function AreaNode({ data }: { data: { name: string; service: string; color: string } }) {
  return (
    <div className="w-[180px] rounded-xl border px-3 py-2.5" style={{ borderColor: data.color + "66", background: data.color + "1f" }}>
      <Handle id="in" type="target" position={Position.Left} className="!bg-white/40" />
      <Handle id="xt" type="target" position={Position.Top} className="!bg-white/30" />
      <p className="font-display text-[13px] font-semibold leading-tight text-white">{data.name}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-white/60">{data.service}</p>
      <Handle id="out" type="source" position={Position.Right} style={{ background: data.color }} />
      <Handle id="xb" type="source" position={Position.Bottom} className="!bg-white/30" />
    </div>
  );
}
function CellNode({ data }: { data: Celda & { color: string } }) {
  const color = data.color;
  return (
    <div className="w-[238px] rounded-xl border border-white/10 bg-[#0d0d12] px-3 py-2.5" style={{ borderLeft: `3px solid ${color}` }}>
      <Handle type="target" position={Position.Left} className="!bg-white/30" />
      <div className="mb-1.5 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md p-1" style={{ color, background: color + "24" }}>
          {TIPO_ICON[data.tipo ?? "default"] ?? TIPO_ICON.default}
        </span>
        {data.herramienta && (
          <span className="truncate rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/70">
            {data.herramienta}
          </span>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-white/90">{data.accion}</p>
      {data.responsable && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-white/[0.06] pt-2">
          <span className="grid h-4 w-4 place-items-center rounded-full text-[7px] font-bold text-ink" style={{ background: color }}>
            {initials(data.responsable)}
          </span>
          <span className="truncate text-[9px] text-white/55">{data.responsable}</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-white/30" />
    </div>
  );
}
function FaseHeadNode({ data }: { data: { nombre: string; objetivo: string } }) {
  return (
    <div className="w-[238px] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="font-display text-[12px] font-semibold text-white">{data.nombre}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-white/55">{data.objetivo}</p>
    </div>
  );
}
function ResultNode({ data }: { data: { text: string; color: string } }) {
  return (
    <div className="w-[200px] rounded-xl border px-3 py-2.5" style={{ borderColor: data.color + "88", background: `linear-gradient(135deg, ${data.color}2e, ${data.color}0d)` }}>
      <Handle type="target" position={Position.Left} className="!bg-white/40" />
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: data.color }}>★ Resultado</p>
      <p className="mt-1 text-[11px] leading-relaxed text-white/90">{data.text}</p>
    </div>
  );
}
const nodeTypes = { root: RootNode, area: AreaNode, cell: CellNode, faseHead: FaseHeadNode, result: ResultNode };

/* ---------- Grafo ---------- */
function cells(a: MapArea): Celda[] {
  if (a.celdas?.length) return a.celdas;
  return (a.acciones ?? []).map((x) => ({ accion: x }));
}

function buildGraph(data: MapData): { nodes: Node[]; edges: Edge[] } {
  const AREA_X = 320, F0 = 600, DX = 300, ROW = 190;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const n = data.areas.length || 1;
  const centerY = ((n - 1) * ROW) / 2;

  nodes.push({ id: "root", type: "root", position: { x: 0, y: centerY }, data: { negocio: data.negocio }, draggable: false });
  data.fases.slice(0, 4).forEach((f, fi) => {
    nodes.push({ id: `fh${fi}`, type: "faseHead", position: { x: F0 + fi * DX, y: -150 }, data: f, draggable: false, selectable: false });
  });
  const hasResult = data.areas.some((a) => (a.resultado ?? "").trim());
  if (hasResult) {
    nodes.push({ id: "fhR", type: "faseHead", position: { x: F0 + 4 * DX, y: -150 }, data: { nombre: "El resultado", objetivo: "Lo que gana tu negocio." }, draggable: false, selectable: false });
  }

  data.areas.forEach((a, ai) => {
    const y = ai * ROW;
    const color = COLORS[ai % COLORS.length];
    nodes.push({ id: `a${ai}`, type: "area", position: { x: AREA_X, y }, data: { name: a.area, service: a.service, color } });
    edges.push({ id: `e-root-a${ai}`, source: "root", target: `a${ai}`, targetHandle: "in", type: "smoothstep", style: { stroke: "rgba(255,255,255,0.18)", strokeWidth: 1.5 } });
    cells(a).slice(0, 4).forEach((cel, fi) => {
      const id = `a${ai}f${fi}`;
      nodes.push({ id, type: "cell", position: { x: F0 + fi * DX, y }, data: { ...cel, color } });
      const src = fi === 0 ? `a${ai}` : `a${ai}f${fi - 1}`;
      const srcHandle = fi === 0 ? "out" : undefined;
      edges.push({ id: `e-${src}-${id}`, source: src, sourceHandle: srcHandle, target: id, type: "smoothstep", style: { stroke: color, strokeWidth: 2, opacity: 0.7 } });
    });
    const resultado = (a.resultado ?? "").trim();
    if (resultado) {
      const rid = `a${ai}r`;
      nodes.push({ id: rid, type: "result", position: { x: F0 + 4 * DX, y }, data: { text: resultado, color } });
      edges.push({ id: `e-a${ai}f3-${rid}`, source: `a${ai}f3`, target: rid, type: "smoothstep", style: { stroke: color, strokeWidth: 2 }, animated: true });
    }
  });

  // Conexiones cruzadas entre áreas (intercambio de información).
  const areaIdx = new Map(data.areas.map((a, i) => [a.area.toLowerCase().trim(), i]));
  (data.conexiones ?? []).forEach((c, ci) => {
    const i = areaIdx.get((c.desde ?? "").toLowerCase().trim());
    const j = areaIdx.get((c.hasta ?? "").toLowerCase().trim());
    if (i == null || j == null || i === j) return;
    // Enrutamos siempre de arriba hacia abajo para que las curvas se lean prolijas.
    const [top, bot] = i < j ? [i, j] : [j, i];
    const forward = i < j; // la flecha apunta a "hasta"
    edges.push({
      id: `x-${i}-${j}-${ci}`,
      source: `a${top}`,
      sourceHandle: "xb",
      target: `a${bot}`,
      targetHandle: "xt",
      type: "bezier",
      label: c.etiqueta,
      labelShowBg: true,
      labelStyle: { fill: "#e5e7eb", fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: "#0d0d12", fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
      style: { stroke: "rgba(226,232,240,0.5)", strokeWidth: 1.4, strokeDasharray: "5 4" },
      markerEnd: forward ? { type: MarkerType.ArrowClosed, color: "rgba(226,232,240,0.7)", width: 16, height: 16 } : undefined,
      markerStart: forward ? undefined : { type: MarkerType.ArrowClosed, color: "rgba(226,232,240,0.7)", width: 16, height: 16 },
    });
  });

  return { nodes, edges };
}

/* ---------- Vista ---------- */
export function MapaView({ data, print = false, cta = false }: { data: MapData; print?: boolean; cta?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"diagram" | "list">("diagram");
  useEffect(() => setMounted(true), []);
  const { nodes, edges } = useMemo(() => buildGraph(data), [data]);

  const download = async () => {
    const bounds = getNodesBounds(nodes);
    const pad = 90;
    const w = Math.min(4800, Math.round(bounds.width + pad * 2));
    const h = Math.min(4800, Math.round(bounds.height + pad * 2 + 170));
    const vp = getViewportForBounds(bounds, w, h, 0.2, 2, 0.12);
    const el = document.querySelector(".react-flow__viewport") as HTMLElement | null;
    if (!el) return;
    try {
      const url = await toPng(el, {
        backgroundColor: "#060608", width: w, height: h,
        style: { width: `${w}px`, height: `${h}px`, transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` },
      });
      const a = document.createElement("a");
      a.download = `mapa-ia-${(data.negocio || "run72").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.href = url; a.click();
    } catch { /* ignore */ }
  };

  const equipo = data.equipo ?? [];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-violet">
            <span className="inline-block h-4 w-4 rounded bg-[conic-gradient(from_210deg,#38bdf8,#6366f1,#a855f7)]" />
            Mapa de IA · RUN
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold">{data.negocio || "Tu negocio"}</h2>
          {data.resumen && <p className="mt-1 max-w-2xl text-sm text-muted">{data.resumen}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div role="tablist" aria-label="Vista del mapa" className="flex rounded-full border border-line p-1 text-sm">
            <button role="tab" aria-selected={view === "diagram"} onClick={() => setView("diagram")}
              className={`rounded-full px-3.5 py-1.5 transition ${view === "diagram" ? "bg-white/10 text-fg" : "text-muted hover:text-fg"}`}>
              Diagrama
            </button>
            <button role="tab" aria-selected={view === "list"} onClick={() => setView("list")}
              className={`rounded-full px-3.5 py-1.5 transition ${view === "list" ? "bg-white/10 text-fg" : "text-muted hover:text-fg"}`}>
              Lista
            </button>
          </div>
          {print && (
            <button onClick={download} className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition hover:border-brand-violet hover:text-fg">
              Descargar imagen (PNG)
            </button>
          )}
        </div>
      </div>

      {view === "diagram" ? (
        <div className="h-[74vh] min-h-[560px] w-full overflow-hidden rounded-3xl border border-line bg-[#060608]">
          {mounted ? (
            <ReactFlow
              nodes={nodes} edges={edges} nodeTypes={nodeTypes}
              fitView fitViewOptions={{ padding: 0.15 }} minZoom={0.12} maxZoom={2}
              nodesConnectable={false} edgesFocusable={false}
            >
              <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.08)" />
              <MiniMap pannable zoomable nodeColor={(nd) => ((nd.data as { color?: string })?.color ?? "#6366f1")} maskColor="rgba(0,0,0,0.6)" style={{ background: "#0d0d12" }} />
              <Controls showInteractive={false} />
            </ReactFlow>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-faint">Cargando mapa…</div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-[#060608] p-1">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Mapa de IA en formato de lista: área, fase, acción, herramienta y responsable.</caption>
            <thead>
              <tr className="text-xs uppercase tracking-wider text-faint">
                <th scope="col" className="p-3">Área</th>
                <th scope="col" className="p-3">Fase</th>
                <th scope="col" className="p-3">Acción</th>
                <th scope="col" className="p-3">Herramienta</th>
                <th scope="col" className="p-3">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {data.areas.map((a, ai) =>
                cells(a).map((cel, fi) => (
                  <tr key={`${ai}-${fi}`} className="border-t border-line/60 align-top">
                    <th scope="row" className="p-3 font-medium text-fg">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[ai % COLORS.length] }} />
                        {a.area}
                      </span>
                    </th>
                    <td className="p-3 text-muted">{data.fases[fi]?.nombre ?? `Fase ${fi + 1}`}</td>
                    <td className="p-3 text-fg">{cel.accion}</td>
                    <td className="p-3 text-muted">{cel.herramienta || "—"}</td>
                    <td className="p-3 text-muted">{cel.responsable || "—"}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Equipo */}
      {equipo.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Equipo</p>
          <div className="flex flex-wrap gap-2">
            {equipo.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/40 px-3 py-1.5 text-xs">
                <span className="grid h-5 w-5 place-items-center rounded-full text-[8px] font-bold text-ink" style={{ background: COLORS[i % COLORS.length] }}>{initials(m.nombre)}</span>
                <span className="text-fg">{m.nombre}</span>
                <span className="text-faint">· {m.rol}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Leyenda de áreas */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {data.areas.map((a, i) => (
          <span key={a.area} className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {a.area}
          </span>
        ))}
      </div>

      <p className="mt-4 text-xs text-faint">
        Movete por el mapa: arrastrá para desplazarte y usá la rueda para zoom. Cada celda muestra la acción, la herramienta y el responsable.
        {(data.conexiones?.length ?? 0) > 0 && " Las líneas punteadas son las conexiones entre áreas: cómo se intercambian información."}
      </p>

      {cta && (
        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-brand-violet/30 bg-surface/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-semibold">¿Lo ejecutamos juntos?</p>
            <p className="text-sm text-muted">Coordinemos una videollamada y arrancamos por tu primera fase.</p>
          </div>
          <a href="/contacto?origen=mapa-ejemplo" className="shrink-0 rounded-full bg-[linear-gradient(100deg,#38bdf8,#6366f1_48%,#a855f7)] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110">
            Hablar con RUN
          </a>
        </div>
      )}
    </div>
  );
}
