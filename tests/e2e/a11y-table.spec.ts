import { expect, test } from "@playwright/test";

test("table headers are present for navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("columnheader", { name: "Tipo" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Papel" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Link" })).toBeVisible();
});
