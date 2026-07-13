import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const MIGRATIONS_DIR = path.join(REPO_ROOT, "supabase", "migrations");
const BOOTSTRAP_SQL = path.join(
  REPO_ROOT,
  "tests",
  "integration",
  "sql",
  "supabase-bootstrap.sql",
);

/**
 * Connection string for a throwaway PostgreSQL database dedicated to tests.
 *
 * Local development: when this is unset the integration suite skips itself,
 * so a database is not required to run `npm run test:integration` locally.
 *
 * Required CI: the `quality` workflow provisions a PostgreSQL service and sets
 * this variable, so the integration suite must execute there. If the database
 * configuration is missing in CI, the suite fails (via the guard in
 * profiles-rls.test.ts) rather than skipping — a green check always means the
 * RLS tests actually ran.
 */
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

export function hasDatabase(): boolean {
  return typeof TEST_DATABASE_URL === "string" && TEST_DATABASE_URL.length > 0;
}

async function withAdminClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/**
 * Reset the database to a clean state and apply the Supabase bootstrap plus
 * every migration under supabase/migrations/, in filename order. Runs as the
 * connection's (superuser/owner) role — this is the elevated setup path, never
 * used for the RLS assertions themselves.
 */
export async function resetAndMigrate(): Promise<void> {
  await withAdminClient(async (client) => {
    await client.query(`
      drop schema if exists auth cascade;
      drop schema if exists public cascade;
      create schema public;
    `);

    const bootstrap = readFileSync(BOOTSTRAP_SQL, "utf8");
    await client.query(bootstrap);

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      await client.query(sql);
    }
  });
}

/**
 * Seed rows as the table owner (bypasses RLS), simulating what the future
 * issue #9 trigger will do when a new auth user is created. Used only for
 * fixtures, never for assertions.
 */
export async function asOwner<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  return withAdminClient(fn);
}

type JwtClaims = { sub?: string; role?: string } | null;

/**
 * Run `fn` as one of Supabase's PostgREST roles with the given JWT claims,
 * exactly as PostgREST would for an API request. Everything runs inside a
 * transaction that is always rolled back, so writes never persist and tests
 * stay isolated from one another.
 */
async function asRole<T>(
  role: "authenticated" | "anon",
  claims: JwtClaims,
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  return withAdminClient(async (client) => {
    try {
      await client.query("begin");
      // set_config(..., true) = local to the transaction.
      await client.query("select set_config('request.jwt.claims', $1, true)", [
        claims ? JSON.stringify(claims) : "",
      ]);
      await client.query(`set local role ${role}`);
      return await fn(client);
    } finally {
      await client.query("rollback");
    }
  });
}

/** Run `fn` as an authenticated user identified by `sub` (their auth.uid()). */
export function asUser<T>(sub: string, fn: (client: Client) => Promise<T>): Promise<T> {
  return asRole("authenticated", { sub, role: "authenticated" }, fn);
}

/** Run `fn` as an anonymous (logged-out) visitor. */
export function asAnon<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  return asRole("anon", { role: "anon" }, fn);
}
