import { expect, test } from "@playwright/test";

test("manual refresh action shows user feedback", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Atualizar dados" }).click();
  await expect(page.getByRole("status")).toBeVisible();
});
