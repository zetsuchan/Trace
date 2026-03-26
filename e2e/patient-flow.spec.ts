import { test, expect } from "@playwright/test";

test.describe("Patient flow", () => {
  test.use({ storageState: "e2e/.auth/patient.json" });

  test("trace input page loads", async ({ page }) => {
    await page.goto("/trace/new");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("history page loads", async ({ page }) => {
    await page.goto("/history");
    await expect(page).toHaveURL("/history");
  });

  test("insights page loads", async ({ page }) => {
    await page.goto("/insights");
    await expect(page).toHaveURL("/insights");
  });

  test("analytics page loads", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page).toHaveURL("/analytics");
  });

  test("patient is linked to a practice", async ({ page }) => {
    await page.goto("/trace/new");
    const data = await page.evaluate(() =>
      fetch("/api/patient/link-practice").then((r) => r.json()),
    );
    expect(data.links).toBeDefined();
    expect(data.links.length).toBeGreaterThan(0);
    expect(data.links[0].practiceName).toBe("Atlanta Sickle Cell Center");
  });

  test("practice settings page loads", async ({ page }) => {
    await page.goto("/settings/practice");
    await expect(page.getByRole("heading", { name: "My Practice" })).toBeVisible();
  });

  test("sidebar shows patient navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/trace/new");
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    const sidebar = page.getByRole("navigation", { name: "Main navigation" });
    await expect(sidebar.getByText("History")).toBeVisible();
    await expect(sidebar.getByText("Insights")).toBeVisible();
    await expect(sidebar.getByText("Analytics")).toBeVisible();
  });
});
