-- Diagnósticos del Radar de IA (run72.app/radar).
-- Hasta aplicarla, los diagnósticos igual llegan por mail (guardado best-effort).

create table if not exists public.radar_submissions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  whatsapp     text,
  stage        text,
  stage_level  int,
  dims         jsonb not null default '[]'::jsonb,
  moves        jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

-- Solo el service role (backend) escribe/lee. Sin acceso anónimo.
alter table public.radar_submissions enable row level security;
