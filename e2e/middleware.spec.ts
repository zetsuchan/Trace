import { test, expect } from "@playwright/test";

test.describe("Auth middleware", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/trace/new");
    await expect(page).toHaveURL(/\/login/);
  });

  test("preserves redirect param", async ({ page }) => {
    await page.goto("/provider/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fprovider%2Fdashboard/);
  });

  test("allows access to public routes", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");

    await page.goto("/docs");
    await expect(page).toHaveURL(/\/docs/);
  });

  test("login page is accessible without auth", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("T R A C E")).toBeVisible();
  });
});
