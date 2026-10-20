// Respaldo estático (sin WebGL): núcleo facetado metálico cálido con aristas ember
// y nodos-agente conectados, como SVG. Geometría tipo icosaedro visto de frente
// (hexágono exterior + hexágono interior rotado 30°) para acercarse al objeto 3D.
// Mantiene la identidad cuando WebGL no está disponible. No anima.
export function HeroCoreFallback() {
  const cx = 100;
  const cy = 100;
  const R = 90;
  const r = 50;
  const O = [0, 1, 2, 3, 4, 5].map((k) => {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as [number, number];
  });
  const I = [0, 1, 2, 3, 4, 5].map((k) => {
    const a = ((-60 + 60 * k) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });

  const centroid = (pts: [number, number][]): [number, number] => [
    pts.reduce((s, p) => s + p[0], 0) / pts.length,
    pts.reduce((s, p) => s + p[1], 0) / pts.length,
  ];

  // 6 triángulos de esquina + 6 triángulos centrales = 12 facetas
  const facets: { pts: [number, number][] }[] = [];
  for (let k = 0; k < 6; k++) facets.push({ pts: [O[k], I[(k + 5) % 6], I[k]] });
  for (let k = 0; k < 6; k++) facets.push({ pts: [[cx, cy], I[k], I[(k + 1) % 6]] });

  // Faceta ember: el triángulo central más hacia arriba-izquierda
  let emberIdx = 6;
  let best = Infinity;
  for (let k = 6; k < 12; k++) {
    const [mx, my] = centroid(facets[k].pts);
    const score = mx + my; // menor = más arriba-izquierda
    if (score < best) { best = score; emberIdx = k; }
  }

  const fillFor = (i: number) => {
    if (i === emberIdx) return "url(#fbE)";
    const [mx, my] = centroid(facets[i].pts);
    const up = my < cy - 3;
    const left = mx < cx - 3;
    if (up && left) return "url(#fbB)";
    if (up || left) return "url(#fbM)";
    return "url(#fbD)";
  };

  const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const nodes: [number, number][] = [[170, 42], [192, 92], [150, 20], [198, 138]];

  return (
    <div className="hv2-fallback" aria-hidden="true">
      <svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="fbGlow" cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#ff6a2a" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#dc5000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#dc5000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fbSphere" cx="40%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </radialGradient>
          <linearGradient id="fbB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9a683f" /><stop offset="100%" stopColor="#4a3019" />
          </linearGradient>
          <linearGradient id="fbM" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5a3a22" /><stop offset="100%" stopColor="#2e1d10" />
          </linearGradient>
          <linearGradient id="fbD" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#31210f" /><stop offset="100%" stopColor="#1b1109" />
          </linearGradient>
          <linearGradient id="fbE" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffb268" /><stop offset="100%" stopColor="#d2470c" />
          </linearGradient>
        </defs>

        <circle cx="88" cy="84" r="120" fill="url(#fbGlow)" />

        {nodes.map(([nx, ny], i) => (
          <line key={`l${i}`} x1={cx} y1={cy} x2={nx} y2={ny} stroke="#dc5000" strokeWidth="0.6" strokeOpacity="0.28" />
        ))}

        <g stroke="#dc5000" strokeOpacity="0.22" strokeWidth="0.6" strokeLinejoin="round">
          {facets.map((f, i) => (
            <polygon key={i} points={poly(f.pts)} fill={fillFor(i)} />
          ))}
        </g>
        {/* Sombreado esférico sobre las facetas para dar volumen */}
        <polygon points={poly(O)} fill="url(#fbSphere)" />

        {nodes.map(([nx, ny], i) => (
          <g key={`n${i}`} transform={`translate(${nx} ${ny}) rotate(45)`}>
            <rect x="-2.4" y="-2.4" width="4.8" height="4.8" rx="0.8" fill="#ffedd7" />
            <rect x="-2.4" y="-2.4" width="4.8" height="4.8" rx="0.8" fill="#ff7a33" fillOpacity="0.5" />
          </g>
        ))}
      </svg>
    </div>
  );
}
