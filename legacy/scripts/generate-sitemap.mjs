import fs from "fs";
import path from "path";
import { getPublicRoutes } from "./routeData.js";
import { resources, contributors } from "../src/content/authorityData.js";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const OUTPUT_PATH = path.join(DIST_DIR, "sitemap.xml");
const CANONICAL_SITE_URL = "https://horalix.com";

// Build a map of route -> lastmod date from known content
function buildLastmodMap() {
  const map = {};
  const buildDate = new Date().toISOString().split("T")[0];

  // Resources have updatedAt dates
  for (const resource of resources) {
    map[`/resources/${resource.slug}`] = resource.updatedAt || resource.publishedAt || buildDate;
  }

  // Resources listing page uses the most recent resource date
  const latestResourceDate = resources
    .map((r) => r.updatedAt || r.publishedAt)
    .filter(Boolean)
    .sort()
    .pop();
  if (latestResourceDate) {
    map["/resources"] = latestResourceDate;
  }

  // Team profiles use build date (no updatedAt field)
  for (const contributor of contributors) {
    map[`/team/${contributor.slug}`] = buildDate;
  }

  return map;
}

function escapeXml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildUrlXml(route, lastmodMap) {
  const absoluteUrl = `${CANONICAL_SITE_URL}${route}`;
  const buildDate = new Date().toISOString().split("T")[0];
  const lastmod = lastmodMap[route] || buildDate;
  const priority =
    route === "/"
      ? "1.0"
      : route === "/solutions" || route === "/resources"
        ? "0.9"
        : route === "/about" || route === "/evidence" || route === "/news"
          ? "0.8"
          : "0.7";
  const changefreq =
    route.startsWith("/news")
      ? "daily"
      : route.startsWith("/resources") || route.startsWith("/solutions")
        ? "weekly"
        : "monthly";
  return [
    "  <url>",
    `    <loc>${escapeXml(absoluteUrl)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function createSitemap(routes, lastmodMap) {
  const body = routes.map((route) => buildUrlXml(route, lastmodMap)).join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>",
    "",
  ].join("\n");
}

async function generateSitemap() {
  if (!fs.existsSync(DIST_DIR)) {
    console.log("[sitemap] dist folder not found, skipping sitemap generation.");
    return;
  }

  const routes = await getPublicRoutes();
  if (routes.length === 0) {
    console.log("[sitemap] No routes found, skipping sitemap generation.");
    return;
  }

  const lastmodMap = buildLastmodMap();
  const sitemapXml = createSitemap(routes, lastmodMap);
  fs.writeFileSync(OUTPUT_PATH, sitemapXml, "utf8");
  console.log(`[sitemap] Generated ${OUTPUT_PATH} with ${routes.length} routes.`);
}

generateSitemap().catch((error) => {
  console.error("[sitemap] Generation error:", error.message);
  // Keep build resilient and avoid failing deployment.
  process.exit(0);
});
