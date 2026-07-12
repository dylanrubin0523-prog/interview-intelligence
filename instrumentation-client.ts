import * as Sentry from "@sentry/nextjs";
import { sentryEnv } from "@/lib/env/sentry";

// With no DSN configured, the SDK no-ops rather than failing to start.
Sentry.init({
  dsn: sentryEnv.NEXT_PUBLIC_SENTRY_DSN,
});
