// Marca simplificada del "diamante" del hero: gema facetada en paleta cálida
// (walnut / ember / cream). SVG propio, sin canvas ni GPU; legible en tamaños
// chicos (FAB de Runit, cabecera del chat). Autorizado para Preview.
export function RunDiamond({ className = "", size = 34 }: { className?: string; size?: number }) {
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
        <linearGradient id="rd-crown" x1="24" y1="11" x2="24" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffedd7" />
          <stop offset="1" stopColor="#ffb27a" />
        </linearGradient>
        <linearGradient id="rd-pav" x1="24" y1="21" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6a2a" />
          <stop offset="0.6" stopColor="#dc5000" />
          <stop offset="1" stopColor="#7a2e05" />
        </linearGradient>
      </defs>
      {/* Corona (banda superior) iluminada */}
      <path d="M14 11 L34 11 L42 21 L6 21 Z" fill="url(#rd-crown)" />
      {/* Faceta de luz superior-izquierda, como en el hero */}
      <path d="M14 11 L24 11 L18 21 L6 21 Z" fill="#fff6ec" opacity="0.55" />
      {/* Pabellón (cuerpo inferior) en ember */}
      <path d="M6 21 L42 21 L24 44 Z" fill="url(#rd-pav)" />
      {/* Aristas de las facetas */}
      <g stroke="#2a1507" strokeWidth="1" strokeLinejoin="round" opacity="0.35" fill="none">
        <path d="M14 11 L34 11 L42 21 L24 44 L6 21 Z" />
        <path d="M14 11 L18 21 M34 11 L30 21 M24 11 L24 21 M18 21 L24 44 M30 21 L24 44" />
      </g>
    </svg>
  );
}
