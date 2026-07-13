import { beforeAll, describe, expect, it } from "vitest";
import { asOwner, asOwnerRollback, resetAndMigrate } from "./helpers/db";

const U = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const U2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const FN = "public.handle_new_user()";

/**
 * Trigger suite (issue #9). Behavioral tests run inside a rolled-back owner
 * transaction: the INSERT into auth.users fires on_auth_user_created within the
 * transaction, so the created profile is observable and then discarded. Catalog
 * tests are read-only.
 */
export function runHandleNewUserSuite(enabled: boolean): void {
  const describeFn = enabled ? describe : describe.skip;

  describeFn("handle_new_user trigger (issue #9)", () => {
    beforeAll(async () => {
      await resetAndMigrate();
    }, 60_000);

    // --- automatic creation, exercised as the RESTRICTED auth-admin role ---
    //
    // This is the load-bearing SECURITY DEFINER test: the insert into auth.users
    // runs as supabase_auth_admin, which has NO privileges on public.profiles and
    // NO direct EXECUTE on the function. It would fail with "permission denied
    // for table profiles" if the function were SECURITY INVOKER.
    it("creates exactly one profile, with defaults, when the restricted supabase_auth_admin inserts the auth user", async () => {
      const result = await asOwnerRollback(async (c) => {
        // Preconditions: the restricted role can touch neither profiles nor the
        // elevated function directly.
        const pre = await c.query<{
          can_insert_profiles: boolean;
          can_execute_fn: boolean;
        }>(
          `select
             has_table_privilege('supabase_auth_admin', 'public.profiles', 'INSERT') as can_insert_profiles,
             has_function_privilege('supabase_auth_admin', '${FN}', 'EXECUTE')       as can_execute_fn`,
        );

        // Insert AS supabase_auth_admin (owner of auth.users), then reset to the
        // database owner before reading profiles (the restricted role cannot read
        // profiles either).
        await c.query(`set local role supabase_auth_admin`);
        await c.query(`insert into auth.users (id, email) values ($1,$2)`, [U, "u@test.dev"]);
        await c.query(`reset role`);

        const prof = await c.query(
          `select id, role, display_name, school, graduation_year,
                  career_interests, created_at, updated_at
             from public.profiles where id = $1`,
          [U],
        );
        return { pre: pre.rows[0], count: prof.rowCount, row: prof.rows[0] };
      });

      expect(result.pre.can_insert_profiles).toBe(false);
      expect(result.pre.can_execute_fn).toBe(false);
      expect(result.count).toBe(1);
      expect(result.row.id).toBe(U);
      expect(result.row.role).toBe("user");
      expect(result.row.display_name).toBeNull();
      expect(result.row.school).toBeNull();
      expect(result.row.graduation_year).toBeNull();
      expect(result.row.career_interests).toBeNull();
      expect(result.row.created_at).not.toBeNull();
      expect(result.row.updated_at).not.toBeNull();
    });

    it("defaults role to 'user' on the auto-created profile", async () => {
      const role = await asOwnerRollback(async (c) => {
        await c.query(`insert into auth.users (id) values ($1)`, [U]);
        const r = await c.query<{ role: string }>(
          `select role from public.profiles where id = $1`,
          [U],
        );
        return r.rows[0]?.role;
      });
      expect(role).toBe("user");
    });

    it("leaves display_name, school, graduation_year, career_interests null initially", async () => {
      const row = await asOwnerRollback(async (c) => {
        await c.query(`insert into auth.users (id) values ($1)`, [U]);
        const r = await c.query(
          `select display_name, school, graduation_year, career_interests
             from public.profiles where id = $1`,
          [U],
        );
        return r.rows[0];
      });
      expect(row).toEqual({
        display_name: null,
        school: null,
        graduation_year: null,
        career_interests: null,
      });
    });

    it("populates created_at and updated_at from database defaults", async () => {
      const row = await asOwnerRollback(async (c) => {
        await c.query(`insert into auth.users (id) values ($1)`, [U]);
        const r = await c.query(
          `select created_at, updated_at from public.profiles where id = $1`,
          [U],
        );
        return r.rows[0];
      });
      expect(row.created_at).not.toBeNull();
      expect(row.updated_at).not.toBeNull();
    });

    it("gives two distinct auth users exactly one profile each", async () => {
      const result = await asOwnerRollback(async (c) => {
        await c.query(`insert into auth.users (id) values ($1),($2)`, [U, U2]);
        const total = await c.query<{ n: number }>(
          `select count(*)::int as n from public.profiles where id in ($1,$2)`,
          [U, U2],
        );
        const perUser = await c.query<{ id: string; n: number }>(
          `select id, count(*)::int as n from public.profiles
            where id in ($1,$2) group by id order by id`,
          [U, U2],
        );
        return { total: total.rows[0].n, perUser: perUser.rows };
      });
      expect(result.total).toBe(2);
      expect(result.perUser).toEqual([
        { id: U, n: 1 },
        { id: U2, n: 1 },
      ]);
    });

    // --- provider independence / metadata is never trusted ---

    it("is provider-independent: a user with no email or metadata still gets a profile", async () => {
      const rows = await asOwnerRollback(async (c) => {
        // Only id supplied — no email, no provider metadata of any kind.
        await c.query(`insert into auth.users (id) values ($1)`, [U]);
        const r = await c.query(`select id from public.profiles where id = $1`, [U]);
        return r.rows;
      });
      expect(rows).toHaveLength(1);
    });

    it("trusts no user/provider metadata (hostile raw_*_meta_data is ignored)", async () => {
      const row = await asOwnerRollback(async (c) => {
        await c.query(
          `insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data)
           values ($1,$2,$3,$4)`,
          [
            U,
            "evil@test.dev",
            JSON.stringify({
              role: "admin",
              display_name: "Evil",
              school: "Hacker U",
              graduation_year: 1900,
              career_interests: ["exploit"],
            }),
            JSON.stringify({ role: "admin" }),
          ],
        );
        const r = await c.query(
          `select role, display_name, school, graduation_year, career_interests
             from public.profiles where id = $1`,
          [U],
        );
        return r.rows[0];
      });
      expect(row).toEqual({
        role: "user",
        display_name: null,
        school: null,
        graduation_year: null,
        career_interests: null,
      });
    });

    // --- idempotency (genuine repeated trigger invocation) ---

    it("is idempotent: re-invoking the function for an existing id creates no duplicate", async () => {
      const count = await asOwnerRollback(async (c) => {
        await c.query(`insert into auth.users (id) values ($1)`, [U]); // trigger -> profile U
        // A test-only temp table + trigger genuinely invokes the real function
        // again for an id that already has a profile. ON CONFLICT DO NOTHING must
        // make this a harmless no-op. Temp objects vanish on rollback.
        await c.query(`create temp table reinvoke_probe (id uuid)`);
        await c.query(
          `create trigger reinvoke_probe_trg after insert on reinvoke_probe
             for each row execute function public.handle_new_user()`,
        );
        await c.query(`insert into reinvoke_probe (id) values ($1)`, [U]);
        const r = await c.query<{ n: number }>(
          `select count(*)::int as n from public.profiles where id = $1`,
          [U],
        );
        return r.rows[0].n;
      });
      expect(count).toBe(1);
    });

    // --- cascade delete ---

    it("removes the profile when the auth user is deleted (ON DELETE CASCADE)", async () => {
      const count = await asOwnerRollback(async (c) => {
        await c.query(`insert into auth.users (id) values ($1)`, [U]);
        await c.query(`delete from auth.users where id = $1`, [U]);
        const r = await c.query<{ n: number }>(
          `select count(*)::int as n from public.profiles where id = $1`,
          [U],
        );
        return r.rows[0].n;
      });
      expect(count).toBe(0);
    });

    // --- privilege hardening (catalog) ---

    it("does not grant EXECUTE to anon, authenticated, service_role, or supabase_auth_admin", async () => {
      const row = await asOwner(async (c) => {
        const r = await c.query<{
          anon: boolean;
          authenticated: boolean;
          service_role: boolean;
          supabase_auth_admin: boolean;
        }>(
          `select
             has_function_privilege('anon', '${FN}', 'EXECUTE')                as anon,
             has_function_privilege('authenticated', '${FN}', 'EXECUTE')       as authenticated,
             has_function_privilege('service_role', '${FN}', 'EXECUTE')        as service_role,
             has_function_privilege('supabase_auth_admin', '${FN}', 'EXECUTE') as supabase_auth_admin`,
        );
        return r.rows[0];
      });
      expect(row).toEqual({
        anon: false,
        authenticated: false,
        service_role: false,
        supabase_auth_admin: false,
      });
    });

    it("does not grant EXECUTE to PUBLIC", async () => {
      const n = await asOwner(async (c) => {
        const r = await c.query<{ n: number }>(
          `select count(*)::int as n
             from pg_proc p, aclexplode(p.proacl) a
            where p.oid = '${FN}'::regprocedure
              and a.privilege_type = 'EXECUTE'
              and a.grantee = 0`, // 0 = PUBLIC
        );
        return r.rows[0].n;
      });
      expect(n).toBe(0);
    });

    it("is recorded as SECURITY DEFINER", async () => {
      const secdef = await asOwner(async (c) => {
        const r = await c.query<{ prosecdef: boolean }>(
          `select prosecdef from pg_proc where oid = '${FN}'::regprocedure`,
        );
        return r.rows[0].prosecdef;
      });
      expect(secdef).toBe(true);
    });

    it("has the intended fixed empty search_path", async () => {
      const proconfig = await asOwner(async (c) => {
        const r = await c.query<{ proconfig: string[] | null }>(
          `select proconfig from pg_proc where oid = '${FN}'::regprocedure`,
        );
        return r.rows[0].proconfig;
      });
      // SET search_path = '' is stored as the single entry search_path="".
      expect(proconfig).toEqual(['search_path=""']);
    });
  });
}
