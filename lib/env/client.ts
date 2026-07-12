import { z } from "zod";

/**
 * Variables safe to expose to the browser. Next.js only inlines
 * `NEXT_PUBLIC_*` references written literally as `process.env.NEXT_PUBLIC_X`,
 * so each one is listed explicitly rather than looped over.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ message: "NEXT_PUBLIC_SUPABASE_URL is required" })
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required" })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

function parseClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing client environment variables:\n${issues}\n\nCopy .env.example to .env.local and fill in real values.`,
    );
  }

  return parsed.data;
}

export const clientEnv = parseClientEnv();
