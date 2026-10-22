// Logotipo RUN — vector definitivo del manual de marca (01_Logotipo/RUN-crema.svg,
// viewBox 0 0 550 174). Se dibuja con currentColor para heredar el color del tema
// (crema sobre oscuro). No reconstruir con tipografía ni deformar.
export function RunWordmarkSvg({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 550 174"
      fill="currentColor"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: "block" }}
    >
      {title && <title>{title}</title>}
      <path d="M0 0H94C142 0 178 24 178 65C178 98 157 119 128 125L178 174H117L64 119Q52 107 60 94Q64 87 78 87H99Q126 87 126 66Q126 49 101 49H50V174H0Z" />
      <path d="M185 0H235V100C235 137 308 137 308 100V0H358V101C358 150 326 174 272 174C218 174 185 150 185 101Z" />
      <path d="M371 0H422L500 96V0H550V174H500L421 78V174H371Z" />
    </svg>
  );
}
