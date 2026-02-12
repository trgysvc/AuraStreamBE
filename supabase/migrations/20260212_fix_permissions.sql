
-- 1. Fix Schema Permissions
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant all on all sequences in schema public to postgres, service_role;
grant all on all functions in schema public to postgres, service_role;

-- 2. Explicit grants for authenticated/anon
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

-- 3. Ensure RLS is active but policies are correct
-- We already have them in schema.sql, but we redo them here for certainty
alter table public.profiles disable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

alter table public.tenants disable row level security;
alter table public.tenants enable row level security;

drop policy if exists "Users can view their own tenant" on public.tenants;
create policy "Users can view their own tenant" on public.tenants for select using (auth.uid() = owner_id);

drop policy if exists "Users can update their own tenant" on public.tenants;
create policy "Users can update their own tenant" on public.tenants for update using (auth.uid() = owner_id);
