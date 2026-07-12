import { defineConfig } from "vitest/config";

// Integration tests run against a real PostgreSQL instance (TEST_DATABASE_URL)
// and are kept separate from the unit config so the default `npm test` (and the
// CI `quality` job) never require a database. Run with `npm run test:integration`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    // Applying the schema + migrations on first run can take a moment.
    hookTimeout: 60_000,
    testTimeout: 20_000,
  },
});
