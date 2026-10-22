import fs from "fs";
import path from "path";

import { getPublicRoutes } from "./routeData.js";

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, ".env");

function readEnvFile() {
  if (!fs.existsSync(ENV_PATH)) {
    return {};
  }

  const envVars = {};
  const fileContent = fs.readFileSync(ENV_PATH, "utf8");

  for (const rawLine of fileContent.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    envVars[key] = value;
  }

  return envVars;
}

const loadedEnv = readEnvFile();

function resolveEnv(name) {
  const fromProcess = process.env[name];
  if (fromProcess && fromProcess.trim()) return fromProcess.trim();
  const fromFile = loadedEnv[name];
  return typeof fromFile === "string" && fromFile.trim() ? fromFile.trim() : undefined;
}

async function submitIndexNow() {
  const host = resolveEnv("INDEXNOW_HOST") || "horalix.com";
  const key = resolveEnv("INDEXNOW_KEY");
  const keyLocation = resolveEnv("INDEXNOW_KEY_LOCATION") || `https://${host}/${key}.txt`;

  if (!key) {
    console.log("[indexnow] Missing INDEXNOW_KEY. Skipping submission.");
    return;
  }

  const routes = await getPublicRoutes();
  const payload = {
    host,
    key,
    keyLocation,
    urlList: routes.map((route) => `https://${host}${route}`),
  };

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  console.log(`[indexnow] Submitted ${routes.length} URLs for ${host}.`);
}

submitIndexNow().catch((error) => {
  console.error("[indexnow] Submission error:", error.message);
  process.exit(1);
});
