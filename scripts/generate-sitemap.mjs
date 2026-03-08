import fs from "fs";
import path from "path";
import { getPublicRoutes } from "./routeData.js";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const OUTPUT_PATH = path.join(DIST_DIR, "sitemap.xml");
const CANONICAL_SITE_URL = "https://horalix.com";

function escapeXml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildUrlXml(route) {
  const absoluteUrl = `${CANONICAL_SITE_URL}${route}`;
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
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function createSitemap(routes) {
  const body = routes.map((route) => buildUrlXml(route)).join("\n");
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

  const sitemapXml = createSitemap(routes);
  fs.writeFileSync(OUTPUT_PATH, sitemapXml, "utf8");
  console.log(`[sitemap] Generated ${OUTPUT_PATH} with ${routes.length} routes.`);
}

generateSitemap().catch((error) => {
  console.error("[sitemap] Generation error:", error.message);
  // Keep build resilient and avoid failing deployment.
  process.exit(0);
});
