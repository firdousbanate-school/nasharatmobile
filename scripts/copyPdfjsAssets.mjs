import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const pdfjsRoot = path.join(rootDir, "node_modules", "pdfjs-dist");
const targetRoot = path.join(rootDir, "public", "pdfjs");

if (!existsSync(pdfjsRoot)) {
  console.warn("[copyPdfjsAssets] pdfjs-dist is not installed; skipping.");
  process.exit(0);
}

rmSync(targetRoot, { recursive: true, force: true });
mkdirSync(targetRoot, { recursive: true });

cpSync(
  path.join(pdfjsRoot, "build", "pdf.worker.min.mjs"),
  path.join(targetRoot, "pdf.worker.min.mjs"),
);
cpSync(path.join(pdfjsRoot, "cmaps"), path.join(targetRoot, "cmaps"), {
  recursive: true,
});
cpSync(path.join(pdfjsRoot, "standard_fonts"), path.join(targetRoot, "standard_fonts"), {
  recursive: true,
});
cpSync(path.join(pdfjsRoot, "wasm"), path.join(targetRoot, "wasm"), {
  recursive: true,
});

console.log(
  "[copyPdfjsAssets] Copied PDF.js worker, cmaps, standard_fonts, and wasm to public/pdfjs.",
);
