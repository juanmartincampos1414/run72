-- Actualiza meeting_reminders del esquema viejo (un solo envío) al de dos momentos.
-- Correr en Supabase → SQL Editor. Idempotente.

alter table public.meeting_reminders
  add column if not exists event_created_at        timestamptz,
  add column if not exists booking_confirm_sent_at timestamptz,
  add column if not exists booking_confirm_wamid   text,
  add column if not exists reminder30_sent_at      timestamptz,
  add column if not exists reminder30_wamid        text;

create index if not exists meeting_reminders_booking_wamid_idx  on public.meeting_reminders (booking_confirm_wamid);
create index if not exists meeting_reminders_reminder_wamid_idx on public.meeting_reminders (reminder30_wamid);
