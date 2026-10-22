// Marca simplificada del NÚCLEO facetado del hero de RUN (no un diamante de
// joyería ni un emoji): esfera de baja poligonización (antiprisma hexagonal:
// anillo externo + anillo interno rotado + cara frontal), iluminada desde arriba-
// izquierda, con acento ember a la derecha, como la escena 3D. SVG propio,
// legible en chico (FAB de Runit y cabecera del chat).

// Anillo externo (hexágono pointy-top, r≈19) y anillo interno (rotado 30°, r≈8).
const O: [number, number][] = [
  [24, 5], [40.45, 14.5], [40.45, 33.5], [24, 43], [7.55, 33.5], [7.55, 14.5],
];
const I: [number, number][] = [
  [28, 17.07], [32, 24], [28, 30.93], [20, 30.93], [16, 24], [20, 17.07],
];
// Facetas del antiprisma: alternan arista externa→vértice interno y viceversa.
// Cada entrada: [A, B, C] como referencias "O0".."O5" / "I0".."I5", y su tono.
type V = [number, number];
const pt = (ref: string): V => (ref[0] === "O" ? O : I)[+ref[1]];
const BAND: [string, string, string, string][] = [
  ["O0", "O1", "I0", "#e8b488"], // arriba-derecha
  ["I0", "I1", "O1", "#ef6a22"], // derecha-arriba (ember)
  ["O1", "O2", "I1", "#cc5018"], // derecha (ember)
  ["I1", "I2", "O2", "#8f4019"], // derecha-abajo
  ["O2", "O3", "I2", "#5e2a12"], // abajo-derecha
  ["I2", "I3", "O3", "#431d0c"], // abajo
  ["O3", "O4", "I3", "#4a2211"], // abajo-izquierda
  ["I3", "I4", "O4", "#6e3419"], // izquierda-abajo
  ["O4", "O5", "I4", "#9a5028"], // izquierda
  ["I4", "I5", "O5", "#caa06e"], // izquierda-arriba
  ["O5", "O0", "I5", "#f0c69a"], // arriba-izquierda (luz)
  ["I5", "I0", "O0", "#f6d2a6"], // arriba (luz)
];

export function RunDiamond({ className = "", size = 34 }: { className?: string; size?: number }) {
  const outline = O.map((p) => p.join(",")).join(" ");
  const front = I.map((p) => p.join(",")).join(" ");
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        {/* Cara frontal: curva de luz arriba-izquierda → sombra abajo-derecha */}
        <radialGradient id="rd-front" cx="34%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#ffd9b2" />
          <stop offset="55%" stopColor="#c05a2a" />
          <stop offset="100%" stopColor="#7a3417" />
        </radialGradient>
      </defs>
      {/* Facetas del anillo (antiprisma) */}
      {BAND.map(([a, b, c, fill], i) => {
        const A = pt(a), B = pt(b), C = pt(c);
        return (
          <polygon
            key={i}
            points={`${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}`}
            fill={fill}
            stroke="#2a1507"
            strokeWidth="0.45"
            strokeOpacity="0.5"
            strokeLinejoin="round"
          />
        );
      })}
      {/* Cara frontal facetada */}
      <polygon points={front} fill="url(#rd-front)" stroke="#2a1507" strokeWidth="0.45" strokeOpacity="0.45" strokeLinejoin="round" />
      {/* Reflejo especular contenido */}
      <circle cx="21.5" cy="21.5" r="2.1" fill="#fff4e6" opacity="0.65" />
      {/* Rim cálido */}
      <polygon points={outline} fill="none" stroke="#ff8a4c" strokeWidth="0.9" opacity="0.5" strokeLinejoin="round" />
    </svg>
  );
}
