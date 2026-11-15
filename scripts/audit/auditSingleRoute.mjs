import path from "node:path";

async function runAxe(page, axeSource) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const tags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
    const result = await window.axe.run(document, { runOnly: tags });
    return result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
    }));
  });
}

async function walkFocus(page, focusStop, maxTabs) {
  const stops = [];
  await page.mouse.click(1, 1);
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(focusStop);
    if (!stop) break;
    if (stops.length && stops[0].key === stop.key) break;
    stops.push(stop);
  }
  return {
    stopCount: stops.length,
    withoutVisibleFocus: stops.filter((s) => !s.visibleFocus).map((s) => `${s.el} "${s.name}"`),
  };
}

export async function auditSingleRoute(options) {
  const { browser, storageState, baseUrl, route, widths, wait, maxTabs, outDir } = options;
  const { axeSource, auditDom, focusStop } = options;
  const slug = route.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "root";
  const widest = Math.max(...widths);
  const report = { route, url: `${baseUrl}${route}`, widths: {}, focusWalk: null, axe: [] };

  for (const width of widths) {
    const ctxOptions = { viewport: { width, height: 900 } };
    if (storageState) ctxOptions.storageState = storageState;
    const ctx = await browser.newContext(ctxOptions);
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 300)));
    page.on("pageerror", (e) => consoleErrors.push(String(e).slice(0, 300)));
    try {
      await page.goto(report.url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(wait);
      const screenshot = path.join(outDir, `${slug}-${width}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      const dom = await page.evaluate(auditDom);
      report.widths[width] = { finalUrl: page.url(), screenshot, consoleErrors, ...dom };
      if (width === widest) {
        if (axeSource) report.axe = await runAxe(page, axeSource);
        report.focusWalk = await walkFocus(page, focusStop, maxTabs);
      }
    } catch (error) {
      report.widths[width] = { error: String(error).slice(0, 300), consoleErrors };
    } finally {
      await ctx.close();
    }
  }
  return report;
}
