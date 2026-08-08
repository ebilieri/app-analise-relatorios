import { expect, test } from "@playwright/test";

test("table headers are present for navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.locator("thead th").filter({ hasText: "Tipo" })).toBeVisible();
  await expect(page.locator("thead th").filter({ hasText: "Papel" })).toBeVisible();
  await expect(page.locator("thead th").filter({ hasText: "Link" })).toBeVisible();
  await expect(page.getByRole("link", { name: "https://statusinvest.com.br/etfs/coin11" })).toBeVisible();
});
