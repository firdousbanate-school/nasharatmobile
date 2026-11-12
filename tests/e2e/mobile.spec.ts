import { expect, test, type Page } from "@playwright/test";
import { cleanupE2eFixture } from "./cleanupE2eFixture";
import { loginAs } from "./loginAs";
import { seedE2eFixture, type E2eFixture } from "./seedE2eFixture";

// Runs only in the mobile projects (Pixel 7 and 360x640), see playwright.config.ts.
// Like the other journeys it uses the local Supabase stack and its own seeded users.
test.skip(({ isMobile }) => !isMobile, "mobile projects only");

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

for (const path of ["/", "/en", "/login", "/en/login"]) {
  test(`public page ${path} has no horizontal overflow on phones`, async ({ page }) => {
    await page.goto(path);
    await expectNoHorizontalOverflow(page);
  });
}

test.describe.serial("signed-in phone shell", () => {
  let fx: E2eFixture;

  test.beforeAll(async () => {
    fx = await seedE2eFixture();
  });

  test.afterAll(async () => {
    if (fx) await cleanupE2eFixture(fx);
  });

  test("shows the bottom tab bar and hides the sidebar", async ({ page }) => {
    await loginAs(page, fx.admin);
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(page.locator("aside")).toBeHidden();
  });

  test("More opens a sheet and Escape closes it", async ({ page }) => {
    await loginAs(page, fx.admin);
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "More" })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("main screens have no horizontal overflow and stay short", async ({ page }) => {
    await loginAs(page, fx.admin);
    for (const path of [
      "/en/dashboard",
      "/en/circulars",
      "/en/maintenance",
      "/en/calendar",
      "/en/reports",
      "/en/settings",
      "/en/notifications",
    ]) {
      await page.goto(path);
      await expectNoHorizontalOverflow(page);
      const ratio = await page.evaluate(() => {
        const main = document.querySelector("main");
        return main ? main.scrollHeight / main.clientHeight : 0;
      });
      expect(ratio, `${path} should fit in about two screens`).toBeLessThanOrEqual(2.5);
    }
  });
});
