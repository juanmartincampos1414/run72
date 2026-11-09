-- Transcripción de la reunión y propuesta generada, guardadas en el lead.
-- Se editan/generan desde la ficha del lead (/admin/leads/[id]).
alter table public.leads
  add column if not exists transcript text,
  add column if not exists proposal jsonb;
