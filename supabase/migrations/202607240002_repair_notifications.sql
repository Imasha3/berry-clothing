create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  related_id text,
  related_type text,
  recipient_id text,
  created_at timestamptz not null default now()
);

alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists message text;
alter table public.notifications add column if not exists type text;
alter table public.notifications add column if not exists is_read boolean default false;
alter table public.notifications add column if not exists related_id text;
alter table public.notifications add column if not exists related_type text;
alter table public.notifications add column if not exists recipient_id text;
alter table public.notifications add column if not exists created_at timestamptz default now();

update public.notifications set is_read = false where is_read is null;
update public.notifications set created_at = now() where created_at is null;
alter table public.notifications alter column is_read set default false;
alter table public.notifications alter column is_read set not null;
alter table public.notifications alter column created_at set default now();
alter table public.notifications alter column created_at set not null;

create index if not exists notifications_admin_created_at_idx
  on public.notifications (created_at desc) where recipient_id is null;
create index if not exists notifications_recipient_created_at_idx
  on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_public_select on public.notifications;
drop policy if exists notifications_public_insert on public.notifications;
drop policy if exists notifications_public_update on public.notifications;
drop policy if exists notifications_select on public.notifications;
drop policy if exists notifications_insert on public.notifications;
drop policy if exists notifications_update on public.notifications;

create policy notifications_select on public.notifications
  for select to anon, authenticated using (true);
create policy notifications_insert on public.notifications
  for insert to anon, authenticated with check (true);
create policy notifications_update on public.notifications
  for update to anon, authenticated using (true) with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
