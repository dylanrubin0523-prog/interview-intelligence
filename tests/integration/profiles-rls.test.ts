import { describe, it } from "vitest";
import { runProfilesRlsSuite } from "./profiles-rls.suite";
import { hasDatabase } from "./helpers/db";

const inCI =
  process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

// CI must actually execute these security tests. If the throwaway database is
// missing or misconfigured in CI, fail loudly rather than silently skipping —
// a green Quality check has to mean the RLS acceptance criteria really ran.
if (!hasDatabase() && inCI) {
  describe("profiles RLS (issue #8) — CI configuration guard", () => {
    it("requires TEST_DATABASE_URL so the RLS tests run (not skip) in CI", () => {
      throw new Error(
        "TEST_DATABASE_URL is not set. The RLS integration tests prove issue " +
          "#8's security acceptance criteria and must execute in CI, not skip.",
      );
    });
  });
}

// Real suite: runs when a database is configured; skips only for local runs
// with no TEST_DATABASE_URL (the CI guard above covers the CI case).
runProfilesRlsSuite(hasDatabase());
