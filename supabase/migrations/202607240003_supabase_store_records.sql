create table if not exists public.customers (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['products', 'categories', 'orders', 'inventory_movements', 'users', 'roles', 'permissions', 'payment_receipts'] loop
    execute format('create table if not exists public.%I (id text primary key, data jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_public_access', table_name);
    execute format('create policy %I on public.%I for all to anon, authenticated using (true) with check (true)', table_name || '_public_access', table_name);
  end loop;
end $$;

alter table public.customers enable row level security;
drop policy if exists customers_public_read on public.customers;
drop policy if exists customers_public_write on public.customers;
drop policy if exists customers_public_insert on public.customers;
drop policy if exists customers_public_update on public.customers;
create policy customers_public_read on public.customers for select to anon, authenticated using (true);
create policy customers_public_insert on public.customers for insert to anon, authenticated with check (true);
create policy customers_public_update on public.customers for update to anon, authenticated using (true) with check (true);
