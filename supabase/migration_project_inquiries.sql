-- Consultas de proyectos a medida (captación consultiva RUN).
-- Migración aditiva: no toca leads Express, pricing, ni contratos existentes.
-- El acceso es solo vía servidor (service role) y admin validado; sin RLS para
-- anónimos ni authenticated.

create table if not exists public.project_inquiries (
  id                   uuid primary key default gen_random_uuid(),
  idempotency_key      uuid unique not null,
  name                 text not null,
  email                text not null,
  company              text,
  interest             text not null check (interest in ('software','agentes','automatizacion','orientacion')),
  problem              text not null,
  systems              text,
  budget               text check (budget in ('unsure','3000_7500','7500_15000','15000_30000','over_30000')),
  status               text not null default 'nuevo' check (status in ('nuevo','revisando','contactado','cerrado')),
  privacy_version      text not null,
  privacy_accepted_at  timestamptz not null default now(),
  source_path          text,
  created_at           timestamptz not null default now(),
  notified_at          timestamptz
);

create index if not exists project_inquiries_created_idx on public.project_inquiries (created_at desc);
create index if not exists project_inquiries_status_idx on public.project_inquiries (status);

-- Sin acceso directo del cliente: la lectura/escritura pasa por la API con
-- service role y el admin validado con la allowlist existente.
alter table public.project_inquiries enable row level security;
