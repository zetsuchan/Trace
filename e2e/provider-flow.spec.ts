import { test, expect } from "@playwright/test";

test.describe("Provider flow", () => {
  test.use({ storageState: "e2e/.auth/provider.json" });

  test("dashboard loads with stats", async ({ page }) => {
    await page.goto("/provider/dashboard");
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Patients")).toBeVisible();
    await expect(page.getByText("Traces This Week")).toBeVisible();
    await expect(page.getByText("Flagged")).toBeVisible();
  });

  test("dashboard shows welcome message", async ({ page }) => {
    await page.goto("/provider/dashboard");
    await expect(page.getByText("Welcome back, Dr. Abiola Okafor")).toBeVisible();
  });

  test("patients page loads with patient list", async ({ page }) => {
    await page.goto("/provider/patients");
    await expect(page.getByText("Marcus Johnson")).toBeVisible();
    await expect(page.getByText("HbSS")).toBeVisible();
  });

  test("patient detail page loads", async ({ page }) => {
    await page.goto("/provider/patients");
    await page.getByText("Marcus Johnson").click();
    await expect(page).toHaveURL(/\/provider\/patients\//);
    await expect(page.getByText("HbSS", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Trace History")).toBeVisible();
  });

  test("flagged traces page loads", async ({ page }) => {
    await page.goto("/provider/flagged");
    await expect(page.getByText("Flagged Traces")).toBeVisible();
  });

  test("team page shows provider as admin", async ({ page }) => {
    await page.goto("/provider/team");
    await expect(page.getByText("Dr. Abiola Okafor", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("admin")).toBeVisible();
  });

  test("practice setup page loads", async ({ page }) => {
    await page.goto("/provider/setup");
    await expect(page.getByText("Set Up Your Practice")).toBeVisible();
  });

  test("sidebar shows provider navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/provider/dashboard");
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(page.getByText("Provider Dashboard")).toBeVisible();
  });
});
