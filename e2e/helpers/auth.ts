import { Page } from "@playwright/test";

export async function loginAsGuest(page: Page, role: "patient" | "provider") {
  const response = await page.request.post("/api/auth/guest", {
    data: { role },
  });
  return response.json();
}
