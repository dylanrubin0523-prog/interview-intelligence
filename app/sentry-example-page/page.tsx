"use client";

import { Button } from "@/components/ui/button";

class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

export default function SentryExamplePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Sentry test error path</h1>
      <p className="max-w-md text-muted-foreground">
        Verifies error reporting once{" "}
        <code className="font-mono text-sm">NEXT_PUBLIC_SENTRY_DSN</code>
        {" "}is set (see .env.example). With no DSN configured, these still
        throw — they just aren&apos;t captured anywhere.
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={async () => {
            await fetch("/api/sentry-example-api").catch(() => {
              // The route intentionally throws; the failed fetch itself
              // isn't the thing being tested.
            });
            throw new SentryExampleFrontendError(
              "Sentry example frontend error — thrown intentionally",
            );
          }}
        >
          Throw test error
        </Button>
      </div>
    </main>
  );
}
