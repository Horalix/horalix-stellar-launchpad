import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const roots = ["app"];
const banned = /\b(guarantee|guaranteed|proven|autonomous|replaces|fda-approved|clinically accurate)\b/i;
const unsupportedPerformance = /\b\d{2,}(?:\.\d+)?\s*(?:%|percent|seconds?|measurements?|outputs?)\b/i;
const exclusions = new Set(["app/_data/claims.ts"]);
const failures = [];

async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const full = join(path, entry.name); const normalized = full.replaceAll("\\", "/");
    if (entry.isDirectory()) await walk(full);
    else if (/\.(tsx|ts|mdx)$/.test(entry.name) && !exclusions.has(normalized)) {
      const lines = (await readFile(full, "utf8")).split(/\r?\n/);
      lines.forEach((line, index) => {
        if (/claim-audit:\s*allow/.test(line)) return;
        if (banned.test(line)) failures.push(`${normalized}:${index + 1} contains restricted claim language`);
        if (unsupportedPerformance.test(line)) failures.push(`${normalized}:${index + 1} contains a numeric performance-style claim outside the claim register`);
      });
    }
  }
}

for (const root of roots) await walk(root);
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Claim audit passed.");
