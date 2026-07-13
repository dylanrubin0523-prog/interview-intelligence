import { describe, it } from "vitest";
import { runHandleNewUserSuite } from "./handle-new-user.suite";
import { hasDatabase } from "./helpers/db";

const inCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

// CI must actually execute these tests (see profiles-rls.test.ts for the same
// guard rationale). Fail loudly rather than silently skipping in CI.
if (!hasDatabase() && inCI) {
  describe("handle_new_user trigger (issue #9) — CI configuration guard", () => {
    it("requires TEST_DATABASE_URL so the trigger tests run (not skip) in CI", () => {
      throw new Error(
        "TEST_DATABASE_URL is not set. The handle_new_user trigger tests must " +
          "execute in CI, not skip.",
      );
    });
  });
}

runHandleNewUserSuite(hasDatabase());
