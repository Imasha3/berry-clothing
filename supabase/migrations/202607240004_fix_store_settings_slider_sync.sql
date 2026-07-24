create table if not exists public.store_settings (
  id text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_slider (
  id text primary key,
  slides jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.store_settings
  add column if not exists data jsonb,
  add column if not exists settings jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.homepage_slider
  add column if not exists data jsonb,
  add column if not exists slides jsonb not null default '[]'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.store_settings enable row level security;
alter table public.homepage_slider enable row level security;

drop policy if exists store_settings_public_read on public.store_settings;
drop policy if exists store_settings_public_insert on public.store_settings;
drop policy if exists store_settings_public_update on public.store_settings;
drop policy if exists homepage_slider_public_read on public.homepage_slider;
drop policy if exists homepage_slider_public_insert on public.homepage_slider;
drop policy if exists homepage_slider_public_update on public.homepage_slider;

create policy store_settings_public_read on public.store_settings for select to anon, authenticated using (true);
create policy store_settings_public_insert on public.store_settings for insert to anon, authenticated with check (true);
create policy store_settings_public_update on public.store_settings for update to anon, authenticated using (true) with check (true);
create policy homepage_slider_public_read on public.homepage_slider for select to anon, authenticated using (true);
create policy homepage_slider_public_insert on public.homepage_slider for insert to anon, authenticated with check (true);
create policy homepage_slider_public_update on public.homepage_slider for update to anon, authenticated using (true) with check (true);

insert into public.store_settings (id, settings, updated_at)
values ('singleton', '{}'::jsonb, now())
on conflict (id) do nothing;

update public.store_settings
set
  settings = coalesce(nullif(settings, '{}'::jsonb), data, settings),
  updated_at = now()
where id = 'singleton'
  and data is not null;

insert into public.homepage_slider (id, slides, updated_at)
values (
  'singleton',
  coalesce(
    (
      select settings -> 'homepageSliderItems'
      from public.store_settings
      where id = 'singleton'
        and jsonb_typeof(settings -> 'homepageSliderItems') = 'array'
    ),
    '[]'::jsonb
  ),
  now()
)
on conflict (id) do update
set
  slides = case
    when jsonb_array_length(public.homepage_slider.slides) = 0
      then coalesce(public.homepage_slider.data, excluded.slides)
    else public.homepage_slider.slides
  end,
  updated_at = now();

update public.homepage_slider
set
  slides = data,
  updated_at = now()
where id = 'singleton'
  and jsonb_typeof(data) = 'array'
  and jsonb_array_length(slides) = 0;

update public.store_settings
set
  settings = jsonb_set(
    settings,
    '{homepageSliderItems}',
    coalesce(
      (
        select slides
        from public.homepage_slider
        where id = 'singleton'
          and jsonb_typeof(slides) = 'array'
      ),
      settings -> 'homepageSliderItems',
      '[]'::jsonb
    ),
    true
  ),
  updated_at = now()
where id = 'singleton';
