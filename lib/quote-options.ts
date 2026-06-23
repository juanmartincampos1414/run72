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

export const OBJECTIVES: Option[] = [
  { value: "clientes", label: "Conseguir clientes" },
  { value: "validar", label: "Validar una idea" },
  { value: "startup", label: "Lanzar una startup" },
  { value: "digitalizar", label: "Digitalizar mi empresa" },
  { value: "otro", label: "Otro" },
];

export const TIMINGS: Option[] = [
  { value: "asap", label: "Lo antes posible", hint: "Ejecución exprés en 72 horas" },
  { value: "30d", label: "Dentro de 30 días" },
  { value: "90d", label: "Dentro de 90 días" },
];

export function labelFor(options: Option[], value: string | null): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? value;
}
