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

-- Supabase's three PostgREST roles. Roles are cluster-global (not per-database)
-- and are never dropped between test runs, so create them idempotently.
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
end
$$;

grant usage on schema public to anon, authenticated, service_role;

-- Minimal auth schema + users table (migrations FK to auth.users).
create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;

-- Minimal but faithful: includes the user-/provider-controlled metadata columns
-- that exist on Supabase's real auth.users, so tests can insert hostile metadata
-- and prove the handle_new_user trigger never reads or copies it.
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb,
  raw_app_meta_data jsonb
);

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
