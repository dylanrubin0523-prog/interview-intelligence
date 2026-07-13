-- Test-only bootstrap that reproduces the parts of the Supabase-managed
-- environment that migrations depend on, so migrations under
-- supabase/migrations/ can be applied and their RLS tested against a plain
-- PostgreSQL instance (local or CI), with no Supabase project required.
--
-- This file is NEVER shipped as a migration. In production these objects are
-- provided and managed by Supabase. Fidelity note: auth.uid()/auth.role() below
-- match Supabase's real definitions (they read request.jwt.claims), and the
-- role set (anon / authenticated / service_role, only the last with BYPASSRLS)
-- matches Supabase's defaults. That is what makes the RLS assertions meaningful.

-- Supabase's roles. Roles are cluster-global (not per-database) and are never
-- dropped between test runs, so create them idempotently.
--   * anon / authenticated / service_role: the three PostgREST roles.
--   * supabase_auth_admin: the restricted role the Supabase auth system uses to
--     write auth.users. It owns auth.users but has NO privileges on
--     public.profiles and NO direct EXECUTE on public.handle_new_user() -- which
--     is precisely why the trigger function must be SECURITY DEFINER. It is not
--     client-facing and has no BYPASSRLS.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin noinherit;
  end if;
end
$$;

grant usage on schema public to anon, authenticated, service_role;

-- Minimal auth schema + users table (migrations FK to auth.users).
create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema auth to supabase_auth_admin;

-- Minimal but faithful: includes the user-/provider-controlled metadata columns
-- that exist on Supabase's real auth.users, so tests can insert hostile metadata
-- and prove the handle_new_user trigger never reads or copies it.
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb,
  raw_app_meta_data jsonb
);

-- supabase_auth_admin owns auth.users (matching production), so it can insert
-- new users -- yet it is deliberately granted nothing on public.profiles.
alter table auth.users owner to supabase_auth_admin;

-- auth.uid(): the 'sub' claim of the request JWT, exactly as in Supabase.
create or replace function auth.uid()
  returns uuid
  language sql
  stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
$$;

-- auth.role(): the 'role' claim; included for fidelity with Supabase.
create or replace function auth.role()
  returns text
  language sql
  stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '')::text
$$;
