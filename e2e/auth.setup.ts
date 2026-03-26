import { test as setup } from "@playwright/test";
import { loginAsGuest } from "./helpers/auth";

const PATIENT_STATE = "e2e/.auth/patient.json";
const PROVIDER_STATE = "e2e/.auth/provider.json";

setup("authenticate as patient", async ({ page }) => {
  await loginAsGuest(page, "patient");
  await page.goto("/trace/new");
  await page.waitForURL("**/trace/new");
  await page.context().storageState({ path: PATIENT_STATE });
});

setup("authenticate as provider", async ({ page }) => {
  await loginAsGuest(page, "provider");
  await page.goto("/provider/dashboard");
  await page.waitForURL("**/provider/dashboard");
  await page.context().storageState({ path: PROVIDER_STATE });
});
