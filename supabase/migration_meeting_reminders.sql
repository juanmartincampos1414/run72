-- Seguimiento de WhatsApp por meet (dos momentos, idempotente por evento):
--  1) confirmacion_reserva  → ~10-20 min después de agendar (al detectar el evento creado)
--  2) recordatorio_meet      → ~30 min antes de que empiece la meet
-- Una fila por evento de Google Calendar (agendado vía Centrilize). `event_id` único:
-- cada momento se envía una sola vez. Hasta aplicarla, el cron no registra estado y no envía.

create table if not exists public.meeting_reminders (
  id                    uuid primary key default gen_random_uuid(),
  event_id              text not null unique,          -- id del evento de Google Calendar
  meet_at               timestamptz,                   -- inicio de la meet
  event_created_at      timestamptz,                   -- cuándo se creó el evento (reserva)
  phone                 text,                          -- WhatsApp normalizado (549...)
  name                  text,                          -- nombre del invitado

  -- Momento 1: confirmación de la reserva
  booking_confirm_sent_at  timestamptz,
  booking_confirm_wamid    text,

  -- Momento 2: recordatorio 30 min antes
  reminder30_sent_at    timestamptz,
  reminder30_wamid      text,

  -- Respuesta del invitado (fase 2, webhook): pending | confirmed | reschedule | declined
  confirmation_status   text not null default 'pending',
  confirmed_at          timestamptz,
  last_reply            text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Búsqueda del evento por wamid cuando llega la respuesta en el webhook.
create index if not exists meeting_reminders_booking_wamid_idx on public.meeting_reminders (booking_confirm_wamid);
create index if not exists meeting_reminders_reminder_wamid_idx on public.meeting_reminders (reminder30_wamid);
create index if not exists meeting_reminders_phone_idx on public.meeting_reminders (phone);

-- Solo el service role (backend) escribe/lee. Sin acceso anónimo.
alter table public.meeting_reminders enable row level security;
