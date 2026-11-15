import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { auditDom, focusStop } from "../../.claude/skills/senior-frontend/scripts/page-audit.mjs";

function tryRequire(name) {
  for (const base of [path.join(process.cwd(), "noop.js"), import.meta.url]) {
    try {
      return createRequire(base)(name);
    } catch {
      // try next resolution base
    }
  }
  return null;
}

export function resolveAuditDependencies() {
  const playwright = tryRequire("@playwright/test") || tryRequire("playwright");
  if (!playwright) {
    throw new Error("Playwright not found. Run npm install first.");
  }
  let axeSource = null;
  try {
    const axePath = createRequire(path.join(process.cwd(), "noop.js")).resolve(
      "axe-core/axe.min.js",
    );
    axeSource = readFileSync(axePath, "utf8");
  } catch {
    // axe-core is optional
  }
  return { playwright, axeSource, auditDom, focusStop };
}
