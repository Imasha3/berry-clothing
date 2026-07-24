create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), title text not null, message text not null,
  type text not null, is_read boolean not null default false, created_at timestamptz not null default now(),
  related_id text, related_type text, recipient_id text
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null,
  phone text, message text not null, created_at timestamptz not null default now()
);
create table if not exists public.store_settings (id text primary key, settings jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.homepage_slider (id text primary key, slides jsonb not null default '[]'::jsonb, updated_at timestamptz not null default now());

alter table public.notifications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.store_settings enable row level security;
alter table public.homepage_slider enable row level security;

drop policy if exists notifications_public_select on public.notifications;
drop policy if exists notifications_public_insert on public.notifications;
drop policy if exists notifications_public_update on public.notifications;
drop policy if exists contact_messages_public_insert on public.contact_messages;
drop policy if exists store_settings_public_read on public.store_settings;
drop policy if exists store_settings_public_update on public.store_settings;
drop policy if exists store_settings_public_insert on public.store_settings;
drop policy if exists homepage_slider_public_read on public.homepage_slider;
drop policy if exists homepage_slider_public_update on public.homepage_slider;
drop policy if exists homepage_slider_public_insert on public.homepage_slider;

create policy notifications_public_select on public.notifications for select to anon, authenticated using (true);
create policy notifications_public_insert on public.notifications for insert to anon, authenticated with check (true);
create policy notifications_public_update on public.notifications for update to anon, authenticated using (true) with check (true);
create policy contact_messages_public_insert on public.contact_messages for insert to anon, authenticated with check (true);
create policy store_settings_public_read on public.store_settings for select to anon, authenticated using (true);
create policy store_settings_public_insert on public.store_settings for insert to anon, authenticated with check (true);
create policy store_settings_public_update on public.store_settings for update to anon, authenticated using (true) with check (true);
create policy homepage_slider_public_read on public.homepage_slider for select to anon, authenticated using (true);
create policy homepage_slider_public_insert on public.homepage_slider for insert to anon, authenticated with check (true);
create policy homepage_slider_public_update on public.homepage_slider for update to anon, authenticated using (true) with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
