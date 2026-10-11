/**
 * RunitFigure — la figura SVG de Runit (ojo-lente, iris, scanlines CRT, wisps).
 * `idp` prefija los ids internos para poder usar varias instancias en la misma
 * página sin que colisionen los <defs>. Las clases (rn-char/rn-eye/rn-gaze…)
 * son compartidas: las anima useRunitLife + los keyframes de globals.css.
 */

const BODY_D =
  "M110 14 C158 14 192 60 192 128 C192 188 158 222 110 222 C62 222 28 188 28 128 C28 60 62 14 110 14 Z";

export function RunitFigure({ idp, className = "" }: { idp: string; className?: string }) {
  const body = `${idp}Body`;
  const rim = `${idp}Rim`;
  const eye = `${idp}Eye`;
  const crt = `${idp}Crt`;
  const roll = `${idp}Roll`;
  const bodyClip = `${idp}BodyClip`;
  const lens = `${idp}Lens`;

  return (
    <svg className={`rn-char ${className}`} viewBox="0 0 220 260" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={body} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#2a1b4d" />
          <stop offset="42%" stopColor="#140b2a" />
          <stop offset="100%" stopColor="#050309" />
        </radialGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <radialGradient id={eye} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f2fbff" />
          <stop offset="30%" stopColor="#9fe0ff" />
          <stop offset="70%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <pattern id={crt} width="4" height="5" patternUnits="userSpaceOnUse">
          <rect width="4" height="1.5" fill="#bfeaff" />
        </pattern>
        <linearGradient id={roll} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfeaff" stopOpacity="0" />
          <stop offset=".5" stopColor="#bfeaff" stopOpacity=".5" />
          <stop offset="1" stopColor="#bfeaff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={bodyClip}>
          <path d={BODY_D} />
        </clipPath>
        <clipPath id={lens}>
          <circle cx="110" cy="126" r="25" />
        </clipPath>
      </defs>

      <g className="rn-wisps" stroke={`url(#${rim})`} strokeWidth="5" strokeLinecap="round" opacity=".5" fill="none">
        <path d="M80 214 q-7 20 2 38" />
        <path d="M110 218 q0 22 0 40" />
        <path d="M140 214 q7 20 -2 38" />
      </g>

      <path className="rn-body" d={BODY_D} fill={`url(#${body})`} stroke={`url(#${rim})`} strokeWidth="2.5" />
      <ellipse cx="110" cy="130" rx="60" ry="70" fill="#050309" opacity=".65" />

      <g clipPath={`url(#${bodyClip})`}>
        <rect className="rn-crt-lines" x="0" y="0" width="220" height="260" fill={`url(#${crt})`} />
        <rect className="rn-crt-roll" x="0" y="0" width="220" height="50" fill={`url(#${roll})`} />
      </g>

      <g className="rn-eye">
        <circle cx="110" cy="126" r="25" fill="#060412" />
        <circle cx="110" cy="126" r="25" fill={`url(#${eye})`} opacity=".38" />
        <circle className="rn-iris" cx="110" cy="126" r="19" fill="none" stroke={`url(#${rim})`} strokeWidth="2" strokeDasharray="6 7" opacity=".9" />
        <g className="rn-gaze">
          <circle cx="110" cy="126" r="13" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity=".65" />
          <circle className="rn-pupil" cx="110" cy="126" r="6.5" fill="#dffaff" />
        </g>
        <g clipPath={`url(#${lens})`}>
          <rect className="rn-scan" x="83" y="100" width="54" height="2.5" fill="#9fe7ff" opacity=".9" />
        </g>
      </g>
    </svg>
  );
}
