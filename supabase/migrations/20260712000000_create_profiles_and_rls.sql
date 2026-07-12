-- Migration: profiles table + profile_role enum + RLS
--
-- Scope: issue #8 (Milestone 1). Creates the profile_role enum, the profiles
-- table per docs/DATABASE.md, row-level security, and a restricted public view
-- for column-limited public reads. The auth.users -> profiles trigger is issue
-- #9 and is intentionally NOT included here.
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
  'User profile. Public columns (display_name, school) are exposed only via public.public_profiles; all other columns, including id, are owner-only via RLS.';
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

-- anon gets NO privileges on the base table; its only view of profiles is the
-- restricted public view created below.

-- 5. RLS policies. auth.uid() is wrapped in a scalar sub-select per Supabase's
--    recommended pattern so it is evaluated once per statement.
--
-- SELECT: an authenticated user reads only their own (full) row. There is
-- deliberately no public/anon SELECT policy on the base table -- public reads
-- go exclusively through public.public_profiles (step 6), which cannot expose
-- private columns.
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

-- 6. Restricted public view.
--    PostgreSQL RLS is row-level, not column-level: a public SELECT policy on
--    the base table would expose the entire row, not just public columns. This
--    view physically selects only the intentionally-public columns
--    (display_name, school), so every other column -- including the profile id
--    (which is auth.users.id) as well as graduation_year, career_interests,
--    role and timestamps -- can never be read through it. security_invoker =
--    off means the view runs as its owner and reads across all rows; safe here
--    precisely because the projection is limited to public columns. See
--    ADR-010. Note: id is intentionally NOT public -- exposing a stable public
--    identifier is a separate product/privacy decision, not part of issue #8.
create view public.public_profiles
  with (security_invoker = off)
  as
    select display_name, school
    from public.profiles;

comment on view public.public_profiles is
  'Public projection of profiles: display_name and school only (no id). The public read surface for profiles; the base table has no anon/public SELECT policy.';

grant select on public.public_profiles to anon, authenticated;
