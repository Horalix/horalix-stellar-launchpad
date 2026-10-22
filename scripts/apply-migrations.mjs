/*
  Applies drizzle/*.sql to the D1 database.

  The D1 binding is declared inline in vite.config.ts (from .openai/hosting.json) rather
  than in a wrangler config file, so the wrangler CLI cannot resolve it on its own —
  `wrangler d1 execute DB` fails with "Couldn't find a D1 DB with the name or binding 'DB'".
  This script writes a temporary wrangler config with the same binding, runs the migration
  through it, then removes it, so local and remote share one migration path.

    node scripts/apply-migrations.mjs            # local (miniflare)
    node scripts/apply-migrations.mjs --remote   # the deployed D1
*/
import { readFile, readdir, writeFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";

const remote = process.argv.includes("--remote");
const hosting = JSON.parse(await readFile(".openai/hosting.json", "utf8"));
const d1Config = JSON.parse(await readFile("d1.json", "utf8"));
const binding = hosting.d1;
if (!binding) {
  console.error("No d1 binding declared in .openai/hosting.json — nothing to migrate.");
  process.exit(1);
}

const journal = JSON.parse(await readFile("drizzle/meta/_journal.json", "utf8").catch(() => "null"))
  ?? { entries: (await readdir("drizzle")).filter((f) => f.endsWith(".sql")).map((f) => ({ tag: f.replace(/\.sql$/, "") })) };
const migrations = journal.entries.map((entry) => join("drizzle", `${entry.tag}.sql`));
if (!migrations.length) {
  console.error("No migrations found in drizzle/.");
  process.exit(1);
}

const configPath = ".wrangler-migrate.tmp.jsonc";
await writeFile(
  configPath,
  JSON.stringify(
    {
      name: "horalix-web-migrate",
      main: "worker/index.ts",
      compatibility_date: "2025-01-01",
      compatibility_flags: ["nodejs_compat"],
      d1_databases: [{ binding, database_name: d1Config.database_name, database_id: d1Config.database_id }],
    },
    null,
    2,
  ),
  "utf8",
);

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["wrangler", ...args], { stdio: "inherit", shell: process.platform === "win32" });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`wrangler exited ${code}`))));
    child.on("error", reject);
  });
}

try {
  for (const file of migrations) {
    console.log(`\napplying ${file} (${remote ? "remote" : "local"})`);
    await run(["d1", "execute", binding, remote ? "--remote" : "--local", `--file=${file}`, `--config=${configPath}`, "--yes"]);
  }
  console.log("\nMigrations applied.");
} finally {
  await rm(configPath, { force: true });
}
