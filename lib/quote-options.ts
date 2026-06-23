/**
 * Opciones del configurador que NO son precios (decisiones, no costos).
 * Los tipos de proyecto y addons vienen de la DB (precios dinámicos).
 */

export type Option = { value: string; label: string; hint?: string };

export const UNSURE_PROJECT: Option = {
  value: "unsure",
  label: "No estoy seguro",
  hint: "Te ayudamos a definir el mejor formato para tu idea.",
};

export const BRAND_STATUS: Option[] = [
  { value: "si", label: "Sí, ya tengo marca" },
  { value: "no", label: "No, empiezo de cero" },
  { value: "mejorar", label: "Tengo algo pero quiero mejorarla" },
];

// Objetivos del cotizador v2 (deben coincidir con OBJECTIVES_V2 en lib/configurator).
export const OBJECTIVES: Option[] = [
  { value: "vender", label: "Vender más" },
  { value: "automatizar", label: "Automatizar procesos" },
  { value: "lanzar", label: "Lanzar rápido" },
  { value: "profesionalizar", label: "Profesionalizar marca" },
  { value: "escalar", label: "Escalar" },
];

export function labelFor(options: Option[], value: string | null): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? value;
}
