// Respaldo estático (sin WebGL): mantiene la identidad del hero —núcleo facetado
// metálico cálido con aristas ember y unos nodos conectados— como SVG. Se usa
// cuando WebGL no está disponible o falla. No anima.
export function HeroCoreFallback() {
  const cx = 100;
  const cy = 100;
  const R = 92;
  const r = 46;
  const ang = (k: number) => ((-90 + k * 60) * Math.PI) / 180;
  const pt = (rad: number, k: number): [number, number] => [cx + rad * Math.cos(ang(k)), cy + rad * Math.sin(ang(k))];
  const outer = [0, 1, 2, 3, 4, 5].map((k) => pt(R, k));
  const inner = [0, 1, 2, 3, 4, 5].map((k) => pt(r, k));

  const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const centroid = (pts: [number, number][]): [number, number] => [
    pts.reduce((s, p) => s + p[0], 0) / pts.length,
    pts.reduce((s, p) => s + p[1], 0) / pts.length,
  ];
  // Facetas: trapecios externos + triángulos internos
  const facets: { pts: [number, number][]; ember?: boolean }[] = [];
  for (let k = 0; k < 6; k++) {
    facets.push({ pts: [outer[k], outer[(k + 1) % 6], inner[(k + 1) % 6], inner[k]] });
  }
  for (let k = 0; k < 6; k++) {
    facets.push({ pts: [[cx, cy], inner[k], inner[(k + 1) % 6]], ember: k === 4 });
  }
  const fillFor = (pts: [number, number][], ember?: boolean) => {
    if (ember) return "url(#gE)";
    const [mx, my] = centroid(pts);
    const up = my < cy - 4;
    const left = mx < cx - 4;
    if (up && left) return "url(#gB)";
    if (up || left) return "url(#gM)";
    return "url(#gD)";
  };

  // Nodos-agente (arco superior derecho) con filamentos al centro
  const nodes: [number, number][] = [
    [168, 44], [188, 96], [150, 20], [196, 140],
  ];

  return (
    <div className="hv2-fallback" aria-hidden="true">
      <svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="gGlow" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#ff6a2a" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#dc5000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#dc5000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="gB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8a5c38" /><stop offset="100%" stopColor="#3f2917" />
          </linearGradient>
          <linearGradient id="gM" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#56371f" /><stop offset="100%" stopColor="#30200f" />
          </linearGradient>
          <linearGradient id="gD" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#30200f" /><stop offset="100%" stopColor="#1d1109" />
          </linearGradient>
          <linearGradient id="gE" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffa85c" /><stop offset="100%" stopColor="#c23e0a" />
          </linearGradient>
        </defs>

        <circle cx="90" cy="86" r="118" fill="url(#gGlow)" />

        {nodes.map(([nx, ny], i) => (
          <line key={`l${i}`} x1={cx} y1={cy} x2={nx} y2={ny} stroke="#dc5000" strokeWidth="0.6" strokeOpacity="0.28" />
        ))}

        <g stroke="#dc5000" strokeOpacity="0.2" strokeWidth="0.6" strokeLinejoin="round">
          {facets.map((f, i) => (
            <polygon key={i} points={poly(f.pts)} fill={fillFor(f.pts, f.ember)} />
          ))}
        </g>

        {nodes.map(([nx, ny], i) => (
          <g key={`n${i}`} transform={`translate(${nx} ${ny}) rotate(45)`}>
            <rect x="-2.6" y="-2.6" width="5.2" height="5.2" rx="0.8" fill="#ffedd7" />
            <rect x="-2.6" y="-2.6" width="5.2" height="5.2" rx="0.8" fill="#ff7a33" fillOpacity="0.5" />
          </g>
        ))}
      </svg>
    </div>
  );
}
