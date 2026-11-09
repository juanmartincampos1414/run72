-- CRM comercial + Motor de playbooks por rubro
-- Correr en Supabase SQL Editor.

-- 1) Campos CRM en leads
alter table leads
  add column if not exists source text,                         -- canal: meta_ads, google_ads, referido, organico, manual...
  add column if not exists pipeline_stage text default 'nuevo', -- etapa comercial
  add column if not exists outcome_reason text,                 -- motivo (no se presentó, no queremos alianza, etc.)
  add column if not exists meeting_notes text,                  -- notas de la/s reunión/es
  add column if not exists acquisition_cost numeric default 0,  -- lo que gastamos en pauta para traerlo
  add column if not exists project_value numeric default 0,     -- valor cobrado del proyecto
  add column if not exists project_cost numeric default 0,      -- costo de producirlo
  add column if not exists vertical text;                       -- rubro (arquitectura, ferreteria, gastronomia...)

-- Índices para el dashboard
create index if not exists idx_leads_pipeline_stage on leads (pipeline_stage);
create index if not exists idx_leads_vertical on leads (vertical);

-- 2) Playbooks por rubro: el Motor recuerda y mejora
create table if not exists vertical_playbooks (
  id uuid primary key default gen_random_uuid(),
  vertical text unique not null,     -- slug del rubro (lowercase)
  label text,                        -- nombre legible
  playbook text not null default '', -- markdown: qué construimos, qué funcionó, precios, mockups que gustaron
  projects_count int not null default 0,
  updated_at timestamptz default now(),
  updated_by text
);
