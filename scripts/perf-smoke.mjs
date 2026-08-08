const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";

function now() {
  return performance.now();
}

async function measure(label, fn) {
  const start = now();
  const result = await fn();
  const elapsedMs = now() - start;
  return { label, elapsedMs, result };
}

async function main() {
  const load = await measure("GET /api/fundos", async () => {
    const response = await fetch(`${baseUrl}/api/fundos`);
    const data = await response.json();
    return { status: response.status, rowCount: data.rowCount ?? 0 };
  });

  const refresh = await measure("POST /api/refresh", async () => {
    const response = await fetch(`${baseUrl}/api/refresh`, { method: "POST" });
    const data = await response.json();
    return { status: response.status, responseStatus: data.status ?? "unknown" };
  });

  const report = {
    measuredAt: new Date().toISOString(),
    targets: {
      initialLoadMs: 2000,
      refreshMs: 5000
    },
    results: [load, refresh]
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error("perf smoke failed", error);
  process.exit(1);
});
