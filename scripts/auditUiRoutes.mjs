import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { resolveAuditDependencies } from "./audit/resolveAuditDependencies.mjs";
import { loginForAudit } from "./audit/loginForAudit.mjs";
import { auditSingleRoute } from "./audit/auditSingleRoute.mjs";

const PUBLIC_ROUTES = [
  "/ar/login",
  "/en/login",
  "/ar/forgot-password",
  "/ar/reset-password",
  "/ar/public/circulars",
];

const APP_ROUTES = [
  "/ar/dashboard",
  "/en/dashboard",
  "/ar/circulars",
  "/ar/circulars/new",
  "/ar/calendar",
  "/ar/calendar/new",
  "/ar/maintenance",
  "/ar/maintenance/new",
  "/ar/notifications",
  "/ar/reports",
  "/ar/documents",
  "/ar/achievements",
  "/ar/settings",
  "/ar/settings/school",
  "/ar/settings/users",
  "/ar/settings/departments",
  "/ar/settings/locations",
  "/ar/settings/backup",
  "/ar/settings/audit",
];

function summarizeRoute(report) {
  const widthSummaries = Object.entries(report.widths).map(([w, data]) => ({
    width: Number(w),
    error: data.error || null,
    overflowPx: data.overflowPx ?? null,
    issueCount: Array.isArray(data.issues) ? data.issues.length : 0,
    consoleErrorCount: Array.isArray(data.consoleErrors) ? data.consoleErrors.length : 0,
    redirectedToLogin: typeof data.finalUrl === "string" && data.finalUrl.includes("/login"),
  }));
  return {
    route: report.route,
    widths: widthSummaries,
    withoutVisibleFocus: report.focusWalk?.withoutVisibleFocus ?? [],
    axeViolations: Array.isArray(report.axe) ? report.axe.length : 0,
  };
}

async function main() {
  const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const email = process.env.AUDIT_EMAIL || "";
  const password = process.env.AUDIT_PASSWORD || "";
  const outDir = path.resolve(process.env.AUDIT_OUT || ".ui-check/all-routes");
  const widths = [375, 1280];
  const { playwright, axeSource, auditDom, focusStop } = resolveAuditDependencies();

  mkdirSync(outDir, { recursive: true });
  const browser = await playwright.chromium.launch();
  const reports = [];
  try {
    for (const route of PUBLIC_ROUTES) {
      reports.push(
        await auditSingleRoute({
          browser,
          storageState: null,
          baseUrl,
          route,
          widths,
          wait: 1200,
          maxTabs: 40,
          outDir,
          axeSource,
          auditDom,
          focusStop,
        }),
      );
    }
    if (email && password) {
      const storageState = await loginForAudit(browser, baseUrl, email, password);
      for (const route of APP_ROUTES) {
        reports.push(
          await auditSingleRoute({
            browser,
            storageState,
            baseUrl,
            route,
            widths,
            wait: 1200,
            maxTabs: 40,
            outDir,
            axeSource,
            auditDom,
            focusStop,
          }),
        );
      }
    }
  } finally {
    await browser.close();
  }

  const output = {
    baseUrl,
    authenticated: Boolean(email && password),
    summary: reports.map(summarizeRoute),
    reports,
  };
  writeFileSync(path.join(outDir, "report.json"), JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output.summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
