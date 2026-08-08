import { expect, test } from "@playwright/test";

const SUCCESS_RESPONSE = {
  status: "success",
  message: "Cotacoes atualizadas com sucesso",
  updatedCount: 1,
  failedCount: 0,
  skippedCount: 0,
  failures: [],
  startedAt: "2026-08-07T12:00:00.000Z",
  finishedAt: "2026-08-07T12:00:05.000Z",
};

const PARTIAL_RESPONSE = {
  status: "partial",
  message: "Cotacoes atualizadas com 1 falha(s)",
  updatedCount: 1,
  failedCount: 1,
  skippedCount: 0,
  failures: [{ id: "1-etf-coin11", tipo: "ETF", papel: "COIN11", reason: "timeout" }],
  startedAt: "2026-08-07T12:00:00.000Z",
  finishedAt: "2026-08-07T12:00:15.000Z",
};

const BLOCKED_RESPONSE = {
  status: "blocked",
  message: "Atualizacao ja em andamento",
};

test("quote update: success flow shows success banner and new columns", async ({ page }) => {
  await page.route("/api/cotacao", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SUCCESS_RESPONSE) });
  });

  await page.goto("/");

  const btn = page.getByRole("button", { name: "Atualizar cotacao" });
  await expect(btn).toBeVisible();
  await btn.click();

  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("sucesso");

  // New columns visible in table header
  await expect(page.getByRole("columnheader", { name: "Valor Atual" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Min. 52 Semanas" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Max. 52 Semanas" })).toBeVisible();
});

test("quote update: partial failure shows informational banner", async ({ page }) => {
  await page.route("/api/cotacao", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PARTIAL_RESPONSE) });
  });

  await page.goto("/");

  await page.getByRole("button", { name: "Atualizar cotacao" }).click();

  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("falha");
});

test("quote update: blocked response shows info banner without new processing", async ({ page }) => {
  let callCount = 0;

  await page.route("/api/cotacao", (route) => {
    callCount++;
    route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify(BLOCKED_RESPONSE) });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Atualizar cotacao" }).click();

  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("andamento");

  expect(callCount).toBe(1);
});

test("quote update button is disabled during busyRefresh state", async ({ page }) => {
  let resolveFetch!: () => void;
  const fetchHeld = new Promise<void>((res) => { resolveFetch = res; });

  await page.route("/api/refresh", async (route) => {
    await fetchHeld;
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "success", message: "ok" }) });
  });

  await page.goto("/");

  // Start a refresh and leave it pending
  void page.getByRole("button", { name: "Atualizar dados" }).click();

  // While refresh is pending, quote button should be disabled
  const quoteBtn = page.getByRole("button", { name: "Atualizar cotacao" });
  await expect(quoteBtn).toBeDisabled();

  resolveFetch();
});
