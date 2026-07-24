create extension if not exists pgcrypto;

create table if not exists public.deleted_store_records (
  table_name text not null,
  app_id text not null,
  deleted_at timestamptz not null default now(),
  primary key (table_name, app_id)
);

alter table public.deleted_store_records enable row level security;
drop policy if exists deleted_store_records_public_access on public.deleted_store_records;
create policy deleted_store_records_public_access
on public.deleted_store_records
for all to anon, authenticated
using (true)
with check (true);

do $$
declare
  record_table text;
  constraint_name text;
begin
  foreach record_table in array array[
    'products',
    'categories',
    'orders',
    'inventory_movements',
    'users',
    'customers',
    'roles',
    'permissions',
    'payment_receipts'
  ] loop
    execute format(
      'create table if not exists public.%I (
        id uuid primary key default gen_random_uuid(),
        app_id text,
        data jsonb not null default ''{}''::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )',
      record_table
    );

    execute format('alter table public.%I add column if not exists app_id text', record_table);
    execute format('alter table public.%I add column if not exists data jsonb', record_table);
    execute format('alter table public.%I add column if not exists created_at timestamptz not null default now()', record_table);
    execute format('alter table public.%I add column if not exists updated_at timestamptz not null default now()', record_table);
    execute format('update public.%I set data = ''{}''::jsonb where data is null', record_table);
    execute format('alter table public.%I alter column data set default ''{}''::jsonb', record_table);
    execute format('alter table public.%I alter column data set not null', record_table);

    constraint_name := record_table || '_app_id_key';
    if not exists (
      select 1
      from pg_constraint
      where conname = constraint_name
        and conrelid = format('public.%I', record_table)::regclass
    ) then
      execute format('alter table public.%I add constraint %I unique (app_id)', record_table, constraint_name);
    end if;

    execute format('alter table public.%I enable row level security', record_table);
    execute format('drop policy if exists %I on public.%I', record_table || '_public_access', record_table);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated using (true) with check (true)',
      record_table || '_public_access',
      record_table
    );
  end loop;
end $$;
