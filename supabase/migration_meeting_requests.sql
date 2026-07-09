-- Solicitudes de reunión desde el cotizador (3er cuadro).
-- Aplicar en Supabase (SQL Editor). Hasta aplicarla, las solicitudes igual llegan
-- por mail y quedan en la tabla `events` (audit). Con la tabla, son registro de primera clase.

create table if not exists public.meeting_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  whatsapp      text,
  company       text,
  needs         text[] default '{}',
  business_what text,
  stage         text,
  objective     text,
  explain       text not null,
  availability  text,
  created_at    timestamptz not null default now()
);

-- Solo el service role (backend) escribe/lee. Sin acceso anónimo.
alter table public.meeting_requests enable row level security;
