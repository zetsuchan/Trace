import { test, expect } from "@playwright/test";

test.describe.serial("Share flow", () => {
  test("patient is linked to practice", async ({ browser }) => {
    const context = await browser.newContext({ storageState: "e2e/.auth/patient.json" });
    const page = await context.newPage();
    await page.goto("/trace/new");

    const data = await page.evaluate(() =>
      fetch("/api/patient/link-practice").then((r) => r.json()),
    );

    expect(data.links).toBeDefined();
    expect(data.links.length).toBeGreaterThan(0);
    expect(data.links[0].practiceName).toBe("Atlanta Sickle Cell Center");

    await context.close();
  });

  test("provider sees patient traces in dashboard", async ({ browser }) => {
    const context = await browser.newContext({ storageState: "e2e/.auth/provider.json" });
    const page = await context.newPage();
    await page.goto("/provider/dashboard");

    await expect(page.getByText("Dashboard")).toBeVisible();

    const data = await page.evaluate(() =>
      fetch("/api/provider/dashboard").then((r) => r.json()),
    );

    expect(data.stats.totalPatients).toBeGreaterThan(0);
    expect(data.recentTraces.length).toBeGreaterThan(0);

    await context.close();
  });

  test("provider can view shared traces via API", async ({ browser }) => {
    const context = await browser.newContext({ storageState: "e2e/.auth/provider.json" });
    const page = await context.newPage();
    await page.goto("/provider/dashboard");

    const data = await page.evaluate(() =>
      fetch("/api/provider/shared").then((r) => r.json()),
    );

    expect(data.shared).toBeDefined();
    expect(Array.isArray(data.shared)).toBe(true);

    await context.close();
  });
});
