-- Preferências de calendário e lembretes por usuário
alter table public.user_google_tokens
  add column if not exists calendar_id text default 'primary',
  add column if not exists reminder_minutes integer[] default array[1440, 60];
