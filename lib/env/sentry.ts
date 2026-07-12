import { z } from "zod";

/**
 * Deliberately its own module, not part of lib/env/client.ts. A DSN is not a
 * secret (Sentry's own docs treat it as safe to expose client-side), and it
 * has to be readable by code that runs before any Supabase client exists
 * (instrumentation.ts / instrumentation-client.ts). If this lived on the
 * same combined object as the required Supabase variables, importing it
 * would fail to start whenever Supabase isn't configured, even though it
 * never touches Supabase at all -- zod validates an object atomically, and
 * so does a module's top-level evaluation.
 *
 * No Sentry project exists yet, so this is optional: unset, the SDK no-ops.
 */
const sentrySchema = z.object({
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url("NEXT_PUBLIC_SENTRY_DSN must be a valid URL")
    .optional(),
});

function parseSentryEnv() {
  const parsed = sentrySchema.safeParse({
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing Sentry environment variables:\n${issues}\n\nCopy .env.example to .env.local and fill in real values.`,
    );
  }

  return parsed.data;
}

export const sentryEnv = parseSentryEnv();
