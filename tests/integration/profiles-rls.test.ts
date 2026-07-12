import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  asAnon,
  asOwner,
  asUser,
  hasDatabase,
  resetAndMigrate,
} from "./helpers/db";

// Two distinct authenticated users, per the security-review requirement.
const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";

// The whole suite requires a throwaway Postgres (TEST_DATABASE_URL). Without
// one it skips, so environments with no database — including the default CI
// `quality` job — are unaffected rather than failing.
const describeIfDb = hasDatabase() ? describe : describe.skip;

describeIfDb("profiles RLS (issue #8)", () => {
  beforeAll(async () => {
    await resetAndMigrate();
    // Seed as owner, simulating the future issue #9 trigger. Note: role is NOT
    // specified for either user, so the column default is exercised directly.
    await asOwner(async (c) => {
      await c.query(
        `insert into auth.users (id, email) values ($1,$2),($3,$4)`,
        [USER_A, "a@test.dev", USER_B, "b@test.dev"],
      );
      await c.query(
        `insert into public.profiles
           (id, display_name, school, graduation_year, career_interests)
         values
           ($1,'Alice','State University',2027,'{finance}'),
           ($2,'Bob','Tech University',2026,'{consulting}')`,
        [USER_A, USER_B],
      );
    });
  }, 60_000);

  afterAll(async () => {
    // Leave the schema in place; each run resets in beforeAll. Nothing to do.
  });

  it("defaults role to 'user' for seeded profiles (no client set it)", async () => {
    const roles = await asOwner(async (c) => {
      const r = await c.query<{ role: string }>(
        `select role from public.profiles order by display_name`,
      );
      return r.rows.map((row) => row.role);
    });
    expect(roles).toEqual(["user", "user"]);
  });

  it("lets an authenticated user read their own full row", async () => {
    const row = await asUser(USER_A, async (c) => {
      const r = await c.query(`select * from public.profiles`);
      return r.rows;
    });
    expect(row).toHaveLength(1);
    expect(row[0]).toMatchObject({ id: USER_A, display_name: "Alice", role: "user" });
  });

  it("does NOT let user A read user B's row (private fields) on the base table", async () => {
    const rows = await asUser(USER_A, async (c) => {
      const r = await c.query(`select * from public.profiles where id = $1`, [USER_B]);
      return r.rows;
    });
    expect(rows).toHaveLength(0);
  });

  it("does NOT allow unrestricted authenticated reads of the full table", async () => {
    // User A selecting the whole table sees only their own row, never B's.
    const ids = await asUser(USER_A, async (c) => {
      const r = await c.query<{ id: string }>(`select id from public.profiles`);
      return r.rows.map((row) => row.id);
    });
    expect(ids).toEqual([USER_A]);
  });

  it("blocks anon from reading the base profiles table at all", async () => {
    await expect(
      asAnon((c) => c.query(`select count(*) from public.profiles`)),
    ).rejects.toThrow(/permission denied/i);
  });

  it("exposes only id, display_name, school through the public view (all rows)", async () => {
    const rows = await asAnon(async (c) => {
      const r = await c.query(
        `select * from public.public_profiles order by display_name`,
      );
      return r.rows;
    });
    expect(rows).toHaveLength(2);
    expect(Object.keys(rows[0]).sort()).toEqual(["display_name", "id", "school"]);
    expect(rows.map((r) => r.display_name)).toEqual(["Alice", "Bob"]);
  });

  it("cannot expose private columns through the public view", async () => {
    // The private columns physically do not exist in the view, so selecting
    // them is a parse error — they can never be projected.
    for (const col of ["graduation_year", "career_interests", "role"]) {
      await expect(
        asAnon((c) => c.query(`select ${col} from public.public_profiles`)),
      ).rejects.toThrow(/does not exist/i);
    }
  });

  it("lets user A update their own permitted fields", async () => {
    const count = await asUser(USER_A, async (c) => {
      const r = await c.query(
        `update public.profiles set display_name = 'Alice Updated' where id = $1`,
        [USER_A],
      );
      return r.rowCount;
    });
    expect(count).toBe(1);
  });

  it("does NOT let user A update user B's profile", async () => {
    const count = await asUser(USER_A, async (c) => {
      const r = await c.query(
        `update public.profiles set display_name = 'HACKED' where id = $1`,
        [USER_B],
      );
      return r.rowCount;
    });
    expect(count).toBe(0);
  });

  it("does NOT let a normal user promote THEMSELVES to admin", async () => {
    await expect(
      asUser(USER_A, (c) =>
        c.query(`update public.profiles set role = 'admin' where id = $1`, [USER_A]),
      ),
    ).rejects.toThrow(/permission denied/i);
  });

  it("does NOT let a normal user promote ANOTHER user to admin", async () => {
    await expect(
      asUser(USER_A, (c) =>
        c.query(`update public.profiles set role = 'admin' where id = $1`, [USER_B]),
      ),
    ).rejects.toThrow(/permission denied/i);
  });

  it("does NOT let a normal user INSERT a profile (e.g. a self-made admin row)", async () => {
    await expect(
      asUser(USER_A, (c) =>
        c.query(
          `insert into public.profiles (id, display_name, role)
           values ('33333333-3333-3333-3333-333333333333','Mallory','admin')`,
        ),
      ),
    ).rejects.toThrow(/permission denied/i);
  });
});
