import "server-only";
import { z } from "zod";
import { clientEnv } from "./client";

/**
 * Server-only variables. The `server-only` import makes this module fail to
 * build if it's ever pulled into a client bundle, so a secret like
 * SUPABASE_SERVICE_ROLE_KEY can never end up shipped to the browser.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string({ message: "SUPABASE_SERVICE_ROLE_KEY is required" })
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

function parseServerEnv() {
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing server environment variables:\n${issues}\n\nCopy .env.example to .env.local and fill in real values.`,
    );
  }

  return parsed.data;
}

export const serverEnv = { ...clientEnv, ...parseServerEnv() };
