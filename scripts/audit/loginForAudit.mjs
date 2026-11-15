export async function loginForAudit(browser, baseUrl, email, password) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  try {
    await page.goto(`${baseUrl}/en/login`, { waitUntil: "networkidle", timeout: 30000 });
    if (!page.url().includes("/en/dashboard")) {
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForURL(/\/en\/dashboard/, { timeout: 30000 });
    }
    return await ctx.storageState();
  } finally {
    await ctx.close();
  }
}
