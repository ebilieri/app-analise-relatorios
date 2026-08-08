import { expect, test } from "@playwright/test";

test("link column shows hyperlink or fallback", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("link", { name: "https://statusinvest.com.br/etfs/coin11" })).toBeVisible();
  await expect(page.getByRole("link", { name: "https://statusinvest.com.br/etfs/coin11" })).toHaveAttribute("href", "https://statusinvest.com.br/etfs/coin11");
});
