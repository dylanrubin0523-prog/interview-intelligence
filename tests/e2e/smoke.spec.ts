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
