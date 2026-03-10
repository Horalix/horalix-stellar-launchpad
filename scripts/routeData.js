import fs from "fs";
import path from "path";
import { contributors, resources } from "../src/content/authorityData.js";

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, ".env");

const CORE_ROUTES = ["/", "/about", "/evidence", "/news", "/resources", "/solutions", "/terms"];
// Non-public routes excluded from sitemap: /login, /signup, /verify-email, /profile, /admin
const FALLBACK_NEWS_ROUTES = [
  "/news/horalix-at-fls",
  "/news/demo-day",
  "/news/the-beginning",
];
const FALLBACK_SOLUTION_ROUTES = [
  "/solutions/cardiology-ai",
  "/solutions/pathology-ai",
  "/solutions/radiology-ai",
];
const RESOURCE_ROUTES = resources.map((resource) => `/resources/${resource.slug}`);
const CONTRIBUTOR_ROUTES = contributors.map((contributor) => `/team/${contributor.slug}`);

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
  if (fromProcess && fromProcess.trim()) {
    return fromProcess.trim();
  }
  const fromFile = loadedEnv[name];
  return typeof fromFile === "string" && fromFile.trim() ? fromFile.trim() : undefined;
}

function getSupabaseConfig() {
  const url = resolveEnv("VITE_SUPABASE_URL");
  const key = resolveEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

async function fetchTableSlugs(config, table, filters = []) {
  const params = new URLSearchParams({ select: "slug" });
  for (const [name, value] of filters) {
    params.set(name, value);
  }

  const requestUrl = `${config.url}/rest/v1/${table}?${params.toString()}`;
  const response = await fetch(requestUrl, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => (entry && typeof entry.slug === "string" ? entry.slug.trim() : ""))
    .filter(Boolean);
}

function dedupeRoutes(routes) {
  return [...new Set(routes)];
}

export async function getPublicRoutes() {
  const config = getSupabaseConfig();
  let newsRoutes = FALLBACK_NEWS_ROUTES;
  let solutionRoutes = FALLBACK_SOLUTION_ROUTES;

  if (!config) {
    console.warn("[routes] Missing Supabase env vars. Using fallback routes.");
    return dedupeRoutes([...CORE_ROUTES, ...solutionRoutes, ...newsRoutes, ...RESOURCE_ROUTES, ...CONTRIBUTOR_ROUTES]);
  }

  try {
    const newsSlugs = await fetchTableSlugs(config, "news_articles", [
      ["is_published", "eq.true"],
      ["order", "display_date.desc.nullslast"],
    ]);
    if (newsSlugs.length > 0) {
      newsRoutes = newsSlugs.map((slug) => `/news/${slug}`);
    }
  } catch {
    console.warn("[routes] Could not fetch published news slugs. Using fallback news routes.");
  }

  try {
    const solutionSlugs = await fetchTableSlugs(config, "solutions", [
      ["is_active", "eq.true"],
      ["order", "display_order.asc"],
    ]);
    if (solutionSlugs.length > 0) {
      solutionRoutes = solutionSlugs.map((slug) => `/solutions/${slug}`);
    }
  } catch {
    console.warn("[routes] Could not fetch active solution slugs. Using fallback solution routes.");
  }

  return dedupeRoutes([...CORE_ROUTES, ...solutionRoutes, ...newsRoutes, ...RESOURCE_ROUTES, ...CONTRIBUTOR_ROUTES]);
}
