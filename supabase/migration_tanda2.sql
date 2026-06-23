-- ============================================================
-- RUN72 — Admin Tanda 2: historial de Preview IA + observaciones
-- Ejecutar en Supabase → SQL Editor → Run
-- ============================================================

-- Historial de previews generados (no se sobrescribe)
create table if not exists public.preview_versions (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null,
  prompt        text,
  response      text,                              -- interpretación / texto
  preview       jsonb,                             -- ProjectPreview completo (mockups, etc.)
  files_context jsonb not null default '[]'::jsonb,
  form_snapshot jsonb not null default '{}'::jsonb,
  created_by    text,                              -- 'Sistema (post-pago)' o email del admin
  created_at    timestamptz not null default now()
);

create index if not exists preview_versions_lead_idx on public.preview_versions (lead_id, created_at desc);
alter table public.preview_versions enable row level security;

-- Observaciones del comprobante (revisión del admin)
alter table public.leads add column if not exists comprobante_observaciones text;

-- (la auditoría reutiliza la tabla public.events de la Fase C)
