import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("lib/env/client", () => {
  it("throws a clear error when a required variable is missing", async () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await expect(import("../../lib/env/client")).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL is required/,
    );
  });

  it("throws a clear error when a variable is present but invalid", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: "not-a-valid-url",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    };

    await expect(import("../../lib/env/client")).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL must be a valid URL/,
    );
  });

  it("parses successfully when all required variables are valid", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    };

    const { clientEnv } = await import("../../lib/env/client");
    expect(clientEnv).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });
  });
});

describe("lib/env/server", () => {
  it("throws a clear error when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    };
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    await expect(import("../../lib/env/server")).rejects.toThrow(
      /SUPABASE_SERVICE_ROLE_KEY is required/,
    );
  });

  it("merges client and server variables when all are valid", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    };

    const { serverEnv } = await import("../../lib/env/server");
    expect(serverEnv).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    });
  });
});
