-- Seguimiento de recordatorios de meet por WhatsApp.
-- Una fila por evento de Google Calendar (agendado vía Centrilize). Idempotente:
-- `event_id` es único, así el cron nunca manda dos veces el mismo recordatorio.
-- Hasta aplicarla, el cron no puede registrar estado y no enviará (falla cerrado).

create table if not exists public.meeting_reminders (
  id                  uuid primary key default gen_random_uuid(),
  event_id            text not null unique,          -- id del evento de Google Calendar
  meet_at             timestamptz,                   -- inicio de la meet
  phone               text,                          -- WhatsApp normalizado al que se envió
  name                text,                          -- nombre del invitado (si se pudo extraer)
  reminder_sent_at    timestamptz,                   -- cuándo se envió la plantilla
  reminder_wamid      text,                          -- id del mensaje de WhatsApp enviado
  confirmation_status text not null default 'pending', -- pending | confirmed | reschedule | declined
  confirmed_at        timestamptz,                   -- cuándo respondió
  last_reply          text,                          -- texto/payload de la última respuesta
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Búsqueda del evento por el wamid cuando llega la respuesta en el webhook.
create index if not exists meeting_reminders_wamid_idx on public.meeting_reminders (reminder_wamid);
-- Búsqueda del último recordatorio por teléfono (fallback del webhook sin context wamid).
create index if not exists meeting_reminders_phone_idx on public.meeting_reminders (phone);

-- Solo el service role (backend) escribe/lee. Sin acceso anónimo.
alter table public.meeting_reminders enable row level security;
