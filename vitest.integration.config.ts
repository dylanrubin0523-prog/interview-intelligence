import { defineConfig } from "vitest/config";

// Integration tests run against a real PostgreSQL instance (TEST_DATABASE_URL)
// and are kept in a separate config from the unit tests. The default `npm test`
// (unit) command remains database-independent; the `quality` CI workflow
// separately runs `npm run test:integration` against its PostgreSQL service.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    // Applying the schema + migrations on first run can take a moment.
    hookTimeout: 60_000,
    testTimeout: 20_000,
  },
});
