import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Motor de aprendizaje por rubro. Cada proyecto deja aprendizajes en el playbook
 * de su vertical (qué construimos, qué funcionó, precios, mockups que gustaron).
 * Esos aprendizajes se INYECTAN en la generación de la propuesta y el preview del
 * próximo cliente del mismo rubro → sale mejor, más rápido y más barato de producir.
 */
export type Playbook = {
  vertical: string;
  label: string | null;
  playbook: string;
  projects_count: number;
};

function norm(v: string | null | undefined): string {
  return (v ?? "").trim().toLowerCase();
}

export async function getPlaybook(
  supabase: SupabaseClient,
  vertical: string | null | undefined,
): Promise<Playbook | null> {
  const v = norm(vertical);
  if (!v) return null;
  try {
    const { data } = await supabase
      .from("vertical_playbooks")
      .select("vertical, label, playbook, projects_count")
      .eq("vertical", v)
      .maybeSingle();
    return (data as Playbook) ?? null;
  } catch {
    return null; // tabla puede no existir todavía
  }
}

/** Texto para inyectar en el prompt de generación (vacío si no hay playbook). */
export function playbookToPrompt(pb: Playbook | null): string {
  if (!pb || !pb.playbook.trim()) return "";
  return [
    `APRENDIZAJES DE RUN EN ESTE RUBRO (${pb.label ?? pb.vertical}) — ya hicimos ${pb.projects_count} proyecto(s) acá.`,
    "Reutilizá lo que ya funcionó para que esto salga mejor y más rápido; no repitas errores. Adaptalo a este cliente, no lo copies tal cual:",
    pb.playbook.slice(0, 4000),
  ].join("\n");
}

/** Crea o actualiza el playbook de un rubro. */
export async function upsertPlaybook(
  supabase: SupabaseClient,
  vertical: string,
  fields: { label?: string; playbook?: string; incrementProjects?: boolean },
): Promise<Playbook | null> {
  const v = norm(vertical);
  if (!v) return null;
  const existing = await getPlaybook(supabase, v);
  const row = {
    vertical: v,
    label: fields.label ?? existing?.label ?? v,
    playbook: fields.playbook ?? existing?.playbook ?? "",
    projects_count: (existing?.projects_count ?? 0) + (fields.incrementProjects ? 1 : 0),
    updated_at: new Date().toISOString(),
  };
  const { data } = await supabase
    .from("vertical_playbooks")
    .upsert(row, { onConflict: "vertical" })
    .select("vertical, label, playbook, projects_count")
    .maybeSingle();
  return (data as Playbook) ?? null;
}
