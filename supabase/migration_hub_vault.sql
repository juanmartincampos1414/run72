-- ============================================================
-- RUN72 Business Hub — Bóveda de Credenciales
-- La contraseña y las notas se guardan CIFRADAS (AES-256-GCM, clave en env
-- HUB_VAULT_KEY, fuera de la DB). El resto de campos en claro para poder listar.
-- Requiere setear HUB_VAULT_KEY en Vercel (32+ chars aleatorios).
-- Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================

create table if not exists public.hub_credentials (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  service_name  text not null,
  username      text,
  email         text,
  url           text,
  password_enc  text,            -- cifrado (iv:tag:ciphertext en base64)
  notes_enc     text,            -- cifrado
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists hub_credentials_user_idx on public.hub_credentials (user_id);
alter table public.hub_credentials enable row level security;

drop trigger if exists hub_credentials_touch on public.hub_credentials;
create trigger hub_credentials_touch before update on public.hub_credentials
  for each row execute function public.touch_updated_at();
