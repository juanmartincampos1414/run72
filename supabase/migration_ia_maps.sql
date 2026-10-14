-- Mapas de IA generados (run72.app/admin/mapa) para compartir vía /mapa/{id}.

create table if not exists public.ia_maps (
  id          uuid primary key default gen_random_uuid(),
  negocio     text,
  resumen     text,
  fases       jsonb not null default '[]'::jsonb,
  areas       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- Sin acceso anónimo directo; la lectura pública pasa por la API con service role.
alter table public.ia_maps enable row level security;
