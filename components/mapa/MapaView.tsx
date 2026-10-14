"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  getNodesBounds,
  getViewportForBounds,
  type Node,
  type Edge,
} from "@xyflow/react";
import { toPng } from "html-to-image";

export type MapArea = { area: string; short?: string; service: string; acciones: string[]; resultado?: string };
export type MapFase = { nombre: string; objetivo: string };
export type MapData = { negocio: string; resumen: string; fases: MapFase[]; areas: MapArea[] };

const COLORS = ["#38bdf8", "#6366f1", "#a855f7", "#22d3ee", "#8b5cf6", "#ec4899"];

/* ---------- Nodos custom ---------- */
function RootNode({ data }: { data: { negocio: string } }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-[linear-gradient(135deg,#0b1220,#1a0f2e)] px-5 py-4 text-center shadow-[0_0_40px_-10px_rgba(168,85,247,0.6)]">
      <div className="mx-auto mb-1.5 h-6 w-6 rounded-md bg-[conic-gradient(from_210deg,#38bdf8,#6366f1,#a855f7)]" />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-violet">Mapa de IA</p>
      <p className="mt-0.5 max-w-[160px] font-display text-sm font-semibold leading-tight text-white">
        {data.negocio || "Tu negocio"}
      </p>
      <Handle type="source" position={Position.Right} className="!bg-brand-violet" />
    </div>
  );
}

function AreaNode({ data }: { data: { name: string; service: string; color: string } }) {
  return (
    <div
      className="w-[180px] rounded-xl border px-3 py-2.5"
      style={{ borderColor: data.color + "66", background: data.color + "1a" }}
    >
      <Handle type="target" position={Position.Left} className="!bg-white/40" />
      <p className="font-display text-[13px] font-semibold leading-tight text-white">{data.name}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-white/55">{data.service}</p>
      <Handle type="source" position={Position.Right} style={{ background: data.color }} />
    </div>
  );
}

function CellNode({ data }: { data: { text: string; color: string } }) {
  return (
    <div
      className="w-[210px] rounded-xl border border-white/10 bg-[#0d0d12] px-3 py-2.5"
      style={{ borderLeft: `3px solid ${data.color}` }}
    >
      <Handle type="target" position={Position.Left} className="!bg-white/30" />
      <p className="text-[11px] leading-relaxed text-white/90">{data.text}</p>
      <Handle type="source" position={Position.Right} className="!bg-white/30" />
    </div>
  );
}

function FaseHeadNode({ data }: { data: { nombre: string; objetivo: string } }) {
  return (
    <div className="w-[210px] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="font-display text-[12px] font-semibold text-white">{data.nombre}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-white/55">{data.objetivo}</p>
    </div>
  );
}

function ResultNode({ data }: { data: { text: string; color: string } }) {
  return (
    <div
      className="w-[200px] rounded-xl border px-3 py-2.5"
      style={{ borderColor: data.color + "88", background: `linear-gradient(135deg, ${data.color}26, ${data.color}0d)` }}
    >
      <Handle type="target" position={Position.Left} className="!bg-white/40" />
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: data.color }}>★ Resultado</p>
      <p className="mt-1 text-[11px] leading-relaxed text-white/90">{data.text}</p>
    </div>
  );
}

const nodeTypes = { root: RootNode, area: AreaNode, cell: CellNode, faseHead: FaseHeadNode, result: ResultNode };

/* ---------- Construcción del grafo ---------- */
function buildGraph(data: MapData): { nodes: Node[]; edges: Edge[] } {
  const AREA_X = 320;
  const F0 = 600;
  const DX = 300;
  const ROW = 150;
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
    edges.push({
      id: `e-root-a${ai}`, source: "root", target: `a${ai}`, type: "smoothstep",
      style: { stroke: "rgba(255,255,255,0.18)", strokeWidth: 1.5 },
    });
    a.acciones.slice(0, 4).forEach((acc, fi) => {
      const id = `a${ai}f${fi}`;
      nodes.push({ id, type: "cell", position: { x: F0 + fi * DX, y }, data: { text: acc, color } });
      const src = fi === 0 ? `a${ai}` : `a${ai}f${fi - 1}`;
      edges.push({
        id: `e-${src}-${id}`, source: src, target: id, type: "smoothstep",
        style: { stroke: color, strokeWidth: 2, opacity: 0.7 },
      });
    });
    const resultado = (a.resultado ?? "").trim();
    if (resultado) {
      const rid = `a${ai}r`;
      nodes.push({ id: rid, type: "result", position: { x: F0 + 4 * DX, y }, data: { text: resultado, color } });
      edges.push({
        id: `e-a${ai}f3-${rid}`, source: `a${ai}f3`, target: rid, type: "smoothstep",
        style: { stroke: color, strokeWidth: 2 }, animated: true,
      });
    }
  });

  return { nodes, edges };
}

/* ---------- Vista ---------- */
export function MapaView({ data, print = false, cta = false }: { data: MapData; print?: boolean; cta?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { nodes, edges } = useMemo(() => buildGraph(data), [data]);

  const download = async () => {
    const bounds = getNodesBounds(nodes);
    const pad = 80;
    const w = Math.min(4200, Math.round(bounds.width + pad * 2));
    const h = Math.min(4200, Math.round(bounds.height + pad * 2 + 160));
    const vp = getViewportForBounds(bounds, w, h, 0.2, 2, 0.12);
    const el = document.querySelector(".react-flow__viewport") as HTMLElement | null;
    if (!el) return;
    try {
      const url = await toPng(el, {
        backgroundColor: "#060608",
        width: w,
        height: h,
        style: { width: `${w}px`, height: `${h}px`, transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` },
      });
      const a = document.createElement("a");
      a.download = `mapa-ia-${(data.negocio || "run72").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.href = url;
      a.click();
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-violet">
            <span className="inline-block h-4 w-4 rounded bg-[conic-gradient(from_210deg,#38bdf8,#6366f1,#a855f7)]" />
            Mapa de IA · RUN72
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold">{data.negocio || "Tu negocio"}</h2>
          {data.resumen && <p className="mt-1 max-w-2xl text-sm text-muted">{data.resumen}</p>}
        </div>
        {print && (
          <button
            onClick={download}
            className="shrink-0 rounded-full border border-line px-5 py-2.5 text-sm text-muted transition hover:border-brand-violet hover:text-fg"
          >
            Descargar imagen (PNG)
          </button>
        )}
      </div>

      {/* Diagrama */}
      <div className="h-[72vh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-line bg-[#060608]">
        {mounted ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.15}
            maxZoom={2}
            nodesConnectable={false}
            edgesFocusable={false}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.08)" />
            <MiniMap pannable zoomable nodeColor={(nd) => ((nd.data as { color?: string })?.color ?? "#6366f1")} maskColor="rgba(0,0,0,0.6)" style={{ background: "#0d0d12" }} />
            <Controls showInteractive={false} />
          </ReactFlow>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-faint">Cargando mapa…</div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {data.areas.map((a, i) => (
          <span key={a.area} className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {a.area}
          </span>
        ))}
      </div>

      <p className="mt-4 text-xs text-faint">
        Movete por el mapa: arrastrá para desplazarte y usá la rueda para hacer zoom. Cada fila es un servicio que entregamos en 72 horas.
      </p>

      {cta && (
        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-brand-violet/30 bg-surface/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-semibold">¿Lo ejecutamos juntos?</p>
            <p className="text-sm text-muted">Coordinemos una videollamada y arrancamos por tu primera fase.</p>
          </div>
          <a
            href="/#cotizar"
            className="shrink-0 rounded-full bg-[linear-gradient(100deg,#38bdf8,#6366f1_48%,#a855f7)] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110"
          >
            Hablar con RUN72
          </a>
        </div>
      )}
    </div>
  );
}
