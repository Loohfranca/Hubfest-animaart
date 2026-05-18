-- Adiciona coluna pra guardar ID do evento no Google Calendar
alter table public.festas
  add column if not exists google_event_id text;

-- Tabela pra guardar refresh tokens do Google
create table if not exists public.user_google_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  refresh_token text not null,
  access_token text,
  expires_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.user_google_tokens enable row level security;

create policy "users manage own google tokens"
  on public.user_google_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
