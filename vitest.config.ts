import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    alias: {
      // server-only's client/server guard is enforced by Next.js's bundler,
      // which Vitest doesn't run under — stub it out so tests can still
      // import server-only-guarded modules directly.
      "server-only": path.resolve(__dirname, "tests/mocks/server-only.ts"),
    },
  },
});
