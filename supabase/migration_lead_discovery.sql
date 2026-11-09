-- Respuestas de la guía de descubrimiento de la primera meet, por lead.
-- { [idPregunta]: "respuesta" }. Se editan desde la ficha del lead (/admin/leads/[id]).
alter table public.leads add column if not exists discovery jsonb;
