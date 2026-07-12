import { expect, test } from "@playwright/test";

test("home page renders the Phase 1 placeholder", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Interview Intelligence" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "shadcn/ui pipeline check" }),
  ).toBeVisible();
});

test("sentry example page renders without a DSN configured", async ({
  page,
}) => {
  await page.goto("/sentry-example-page");

  await expect(
    page.getByRole("heading", { name: "Sentry test error path" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Throw test error" }),
  ).toBeVisible();
});
