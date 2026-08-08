import { expect, test } from "@playwright/test";

test("home renders table with fixed columns", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("columnheader", { name: "Tipo" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Papel" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Link" })).toBeVisible();
});
