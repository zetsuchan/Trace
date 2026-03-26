import { test, expect } from "@playwright/test";
import { loginAsGuest } from "./helpers/auth";

test.describe("Guest login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("patient guest login via UI", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Guest.*Patient/i }).click();
    await expect(page).toHaveURL(/\/trace\/new/);
  });

  test("provider guest login via UI", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Guest.*Provider/i }).click();
    await expect(page).toHaveURL(/\/provider\/dashboard/);
  });
});

test.describe("Logout", () => {
  // Use a fresh session so we don't destroy the shared storageState session
  test.use({ storageState: { cookies: [], origins: [] } });

  test("patient can logout via API", async ({ page }) => {
    // Create a fresh login
    await page.goto("/login");
    await page.getByRole("button", { name: /Guest.*Patient/i }).click();
    await expect(page).toHaveURL(/\/trace\/new/);

    // Logout via API (more reliable than finding the button across viewports)
    await page.evaluate(() => fetch("/api/auth/logout", { method: "POST" }));
    await page.goto("/trace/new");
    await expect(page).toHaveURL(/\/login/);
  });
});
