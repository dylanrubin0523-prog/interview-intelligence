-- Migration: handle_new_user trigger (auth.users -> profiles)
--
-- Scope: issue #9 (Milestone 1). Depends on the profiles table + RLS from the
-- issue #8 migration (20260712000000_create_profiles_and_rls.sql).
--
-- Creates a hardened SECURITY DEFINER trigger function that inserts the matching
-- profiles row whenever a new auth.users row is created, so profile creation
-- cannot be skipped or raced by the client and is independent of the auth
-- provider (it fires on auth.users, not on any provider-specific logic).
--
-- Assumes the Supabase-provided environment (auth schema, auth.users, the anon /
-- authenticated / service_role roles). It does not create them.

-- Trigger function.
--
-- SECURITY DEFINER: the role that inserts into auth.users (Supabase's auth
-- admin) has no privileges on public.profiles, so the function must run with the
-- privileges of its owner to create the profile row. Because it is elevated, it
-- is hardened:
--   * SET search_path = '' plus fully-qualified names (public.profiles,
--     pg_catalog operators) prevents search-path hijacking of the definer.
--   * It inserts ONLY new.id and relies entirely on the profiles table defaults
--     (role = 'user', created_at/updated_at = now()). It never reads or copies
--     raw_user_meta_data, raw_app_meta_data, email, provider, display name,
--     school, role, or any other user-/provider-controlled value.
--   * ON CONFLICT (id) DO NOTHING makes repeated execution for the same user id
--     harmless: it can never create a duplicate profile row.
create function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates the public.profiles row for a new auth.users row. SECURITY DEFINER (the inserting auth role has no rights on public.profiles); hardened with search_path='''' + fully-qualified names; inserts only NEW.id and trusts no user/provider metadata; ON CONFLICT (id) DO NOTHING for idempotency.';

-- Trigger: one profile per newly created auth user.
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Lock down direct callability. A trigger fires the function regardless of the
-- invoking role's EXECUTE privilege, so revoking EXECUTE from everyone leaves the
-- trigger fully functional while ensuring no client -- and not even service_role
-- -- can invoke this elevated, RLS-bypassing function directly. (Revoking a
-- privilege that was never granted is a harmless no-op.)
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.handle_new_user() from service_role;
