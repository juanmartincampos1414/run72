// Icono abstracto RUN: cinta curva con volumen y glow cyan/azul/violeta/dorado
// (sección 4.5). SVG propio, sin canvas ni GPU; fallback total.
export function RunMark({ className = "", size = 96 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="rm-a" x1="10" y1="20" x2="110" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#18ACFF" />
          <stop offset="0.5" stopColor="#5583FF" />
          <stop offset="1" stopColor="#8960FF" />
        </linearGradient>
        <linearGradient id="rm-b" x1="20" y1="100" x2="110" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8960FF" />
          <stop offset="1" stopColor="#FFD873" />
        </linearGradient>
        <filter id="rm-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#rm-glow)">
        <path d="M22 78 C 34 34, 72 30, 96 44 C 76 50, 58 60, 44 84 C 36 96, 28 92, 22 78 Z" fill="url(#rm-a)" opacity="0.95" />
        <path d="M30 96 C 52 66, 82 60, 104 70 C 86 80, 70 88, 58 104 C 50 112, 38 108, 30 96 Z" fill="url(#rm-b)" opacity="0.9" />
        <path d="M18 56 C 30 40, 54 36, 74 40 C 58 48, 44 58, 36 72 C 30 66, 22 62, 18 56 Z" fill="#18ACFF" opacity="0.5" />
      </g>
    </svg>
  );
}
