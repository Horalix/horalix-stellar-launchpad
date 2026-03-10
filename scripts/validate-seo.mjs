/**
 * SEO validation script
 * Checks that all public routes have proper metadata in their static HTML.
 * Run after build: node scripts/validate-seo.mjs
 */

import fs from "fs";
import path from "path";
import { getPublicRoutes } from "./routeData.js";

const DIST_DIR = path.join(process.cwd(), "dist");
const CANONICAL_SITE_URL = "https://horalix.com";

let errors = 0;
let warnings = 0;

function error(route, msg) {
  console.error(`  ERROR [${route}]: ${msg}`);
  errors++;
}

function warn(route, msg) {
  console.warn(`  WARN  [${route}]: ${msg}`);
  warnings++;
}

function getHtmlPath(route) {
  const normalized = route === "/" ? "" : route.replace(/^\/+/, "");
  const dir = normalized ? path.join(DIST_DIR, normalized) : DIST_DIR;
  return path.join(dir, "index.html");
}

function checkRoute(route) {
  const htmlPath = getHtmlPath(route);
  if (!fs.existsSync(htmlPath)) {
    error(route, "No index.html found");
    return;
  }

  const html = fs.readFileSync(htmlPath, "utf8");

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    error(route, "Missing <title>");
  } else if (titleMatch[1].length < 10) {
    warn(route, `Title too short: "${titleMatch[1]}"`);
  } else if (titleMatch[1].length > 70) {
    warn(route, `Title may be too long (${titleMatch[1].length} chars): "${titleMatch[1]}"`);
  }

  // Meta description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!descMatch) {
    error(route, "Missing meta description");
  } else if (descMatch[1].length < 50) {
    warn(route, `Meta description too short (${descMatch[1].length} chars)`);
  } else if (descMatch[1].length > 160) {
    warn(route, `Meta description may be too long (${descMatch[1].length} chars)`);
  }

  // Canonical
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  if (!canonicalMatch) {
    error(route, "Missing canonical link");
  } else {
    const expected = `${CANONICAL_SITE_URL}${route === "/" ? "/" : route}`;
    if (canonicalMatch[1] !== expected && canonicalMatch[1] !== expected + "/") {
      warn(route, `Canonical mismatch: got "${canonicalMatch[1]}", expected "${expected}"`);
    }
  }

  // OG tags
  if (!html.includes('property="og:title"')) {
    error(route, "Missing og:title");
  }
  if (!html.includes('property="og:description"')) {
    error(route, "Missing og:description");
  }
  if (!html.includes('property="og:url"')) {
    warn(route, "Missing og:url");
  }
  if (!html.includes('property="og:image"')) {
    warn(route, "Missing og:image");
  }

  // Twitter tags
  if (!html.includes('name="twitter:title"')) {
    warn(route, "Missing twitter:title");
  }
  if (!html.includes('name="twitter:description"')) {
    warn(route, "Missing twitter:description");
  }

  // Structured data
  const jsonLdMatches = html.match(/<script type="application\/ld\+json">/gi);
  if (!jsonLdMatches || jsonLdMatches.length === 0) {
    error(route, "No JSON-LD structured data found");
  }

  // H1
  const h1Matches = html.match(/<h1[\s>]/gi);
  if (!h1Matches || h1Matches.length === 0) {
    warn(route, "No H1 found in static HTML");
  }

  // Body content (not empty root)
  if (html.includes('<div id="root"></div>')) {
    warn(route, "Root div is empty — no prerendered content");
  }
}

async function validate() {
  console.log("\n=== SEO Validation ===\n");

  if (!fs.existsSync(DIST_DIR)) {
    console.error("dist/ directory not found. Run build first.");
    process.exit(1);
  }

  // Check sitemap exists
  const sitemapPath = path.join(DIST_DIR, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    error("global", "sitemap.xml not found in dist/");
  } else {
    const sitemap = fs.readFileSync(sitemapPath, "utf8");
    if (!sitemap.includes("<lastmod>")) {
      warn("sitemap", "No <lastmod> elements found");
    }
    console.log(`  Sitemap exists with ${(sitemap.match(/<url>/g) || []).length} URLs`);
  }

  // Check robots.txt
  const robotsPath = path.join(DIST_DIR, "robots.txt");
  if (!fs.existsSync(robotsPath)) {
    error("global", "robots.txt not found in dist/");
  }

  // Check llms.txt
  const llmsPath = path.join(DIST_DIR, "llms.txt");
  if (!fs.existsSync(llmsPath)) {
    warn("global", "llms.txt not found in dist/");
  }

  // Check ai.txt
  const aiPath = path.join(DIST_DIR, "ai.txt");
  if (!fs.existsSync(aiPath)) {
    warn("global", "ai.txt not found in dist/");
  }

  // Check each route
  const routes = await getPublicRoutes();
  console.log(`  Checking ${routes.length} public routes...\n`);

  for (const route of routes) {
    checkRoute(route);
  }

  console.log(`\n=== Results ===`);
  console.log(`  Routes checked: ${routes.length}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Warnings: ${warnings}`);

  if (errors > 0) {
    console.log("\n  Some errors found. Review and fix before deploying.\n");
    process.exit(1);
  } else {
    console.log("\n  All critical SEO checks passed.\n");
  }
}

validate().catch((err) => {
  console.error("Validation failed:", err.message);
  process.exit(1);
});
