import { expect, test } from "@playwright/test";

test("link column shows hyperlink or fallback", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Link").first()).toBeVisible();
  await expect(page.getByText("Link indisponivel").first()).toBeVisible();
});
