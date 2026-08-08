import { expect, test } from "@playwright/test";

test("mobile viewport keeps table readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("link", { name: "https://statusinvest.com.br/etfs/coin11" })).toBeVisible();
});
