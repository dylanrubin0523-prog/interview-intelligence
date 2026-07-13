-- Migration: profiles table + profile_role enum + RLS
--
-- Scope: issue #8 (Milestone 1). Creates the profile_role enum, the profiles
-- table per docs/DATABASE.md, and owner-only row-level security. The auth.users
-- -> profiles trigger is issue #9 and is intentionally NOT included here.
--
-- Profiles are entirely owner-only in Phase 1: there is no public profile view
-- or directory. Public author identity is a later concern that belongs with the
-- interview-report public surface, where approved-moderation status and the
-- author's anonymous-display choice can be enforced together.
--
-- This migration assumes the Supabase-provided environment already exists:
-- the auth schema, auth.users, auth.uid(), and the anon / authenticated /
-- service_role roles. It does not create them (they are managed by Supabase).

-- 1. Role enum. Two values only; 'user' is the sole value a normal account
--    will ever hold. 'admin' is assigned out-of-band (SQL/dashboard), never by
--    a client, and gates moderation/administrative surfaces in later issues.
create type public.profile_role as enum ('user', 'admin');

-- 2. profiles table (columns per docs/DATABASE.md).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  school text,
  graduation_year smallint,
  career_interests text[],
  role public.profile_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'User profile. Entirely owner-only via RLS in Phase 1: a user can read and update only their own row. No public/anon read surface exists.';
comment on column public.profiles.role is
  'Authorization role. Defaults to user. Never client-writable: no INSERT policy exists and UPDATE is granted only on non-role columns. Assigned out-of-band.';

-- 3. Row-level security.
alter table public.profiles enable row level security;

-- 4. Privileges. Supabase grants broad table privileges to anon/authenticated
--    by default, so start from a clean slate and grant precisely.
revoke all on public.profiles from anon, authenticated;

-- Authenticated users may read (RLS below restricts which rows) and update
-- only a fixed set of columns. role, id, created_at and updated_at are
-- deliberately excluded from the UPDATE grant, so no normal client can escalate
-- its role or forge identity/timestamps -- Postgres rejects the statement at
-- the column-privilege layer, before RLS is even consulted.
grant select on public.profiles to authenticated;
grant update (display_name, school, graduation_year, career_interests)
  on public.profiles to authenticated;

-- anon gets NO privileges on the profiles table at all.

-- 5. RLS policies. auth.uid() is wrapped in a scalar sub-select per Supabase's
--    recommended pattern so it is evaluated once per statement.
--
-- SELECT: an authenticated user reads only their own (full) row. There is no
-- public/anon SELECT policy, so profiles cannot be enumerated by others and
-- anon cannot read the table at all.
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- UPDATE: an authenticated user may update only their own row, and the row must
-- still belong to them afterward. Combined with the column-limited UPDATE grant
-- above, this permits editing permitted profile fields and nothing else.
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No INSERT or DELETE policy: with RLS enabled, both are denied for anon and
-- authenticated. Rows are created by the future issue #9 trigger on auth.users
-- (which runs with elevated privileges), and removed only via the ON DELETE
-- CASCADE from auth.users.
