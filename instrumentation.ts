import * as Sentry from "@sentry/nextjs";

export async function register() {
  // sentryEnv (not clientEnv, not serverEnv) is intentional: it's the only
  // piece that doesn't require Supabase to be configured, and this file
  // also runs in the edge runtime, which can't import lib/env/server.ts
  // (guarded by the "server-only" package).
  const { sentryEnv } = await import("@/lib/env/sentry");

  if (
    process.env.NEXT_RUNTIME === "nodejs" ||
    process.env.NEXT_RUNTIME === "edge"
  ) {
    Sentry.init({
      dsn: sentryEnv.NEXT_PUBLIC_SENTRY_DSN,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
