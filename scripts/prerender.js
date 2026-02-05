/**
 * Prerender script for SEO/GEO optimization
 * Generates static HTML for specified routes at build time
 * Designed to work in Netlify CI environment
 */

import fs from "fs";
import path from "path";
import { getPrerenderRoutes } from "./prerenderRoutes.js";

const ROOT_DIR = process.cwd();
const STATIC_DIR = path.join(ROOT_DIR, "dist");

/**
 * Check if we're in a CI environment without Chrome
 */
const checkChromeAvailable = async () => {
  try {
    // Try to find Chrome executable
    const possiblePaths = [
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      process.env.PUPPETEER_EXECUTABLE_PATH,
      process.env.CHROME_PATH,
    ].filter(Boolean);

    for (const chromePath of possiblePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Fallback: Create basic HTML files with meta tags for routes
 * This ensures crawlers at least see meta information even without full rendering
 */
const createFallbackHtml = async (routes) => {
  console.log("[prerender] Chrome not available, creating fallback meta pages...");
  
  const indexHtml = fs.readFileSync(path.join(STATIC_DIR, "index.html"), "utf8");
  
  for (const route of routes) {
    if (route === "/") continue; // Skip root, already has index.html
    
    const sanitized = route.replace(/^\/+/, "");
    const outputDir = path.join(STATIC_DIR, sanitized);
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Create a copy of index.html for each route
    // The SPA will hydrate on the client side
    fs.writeFileSync(path.join(outputDir, "index.html"), indexHtml, "utf8");
    console.log(`[prerender] Created fallback for: ${route}`);
  }
  
  console.log(`[prerender] Created ${routes.length - 1} fallback pages.`);
  console.log("[prerender] Note: Enable Netlify Prerendering in dashboard for full SEO support.");
};

/**
 * Full prerender with Puppeteer
 */
const prerenderWithPuppeteer = async (routes, chromePath) => {
  const Prerenderer = (await import("@prerenderer/prerenderer")).default;
  const PuppeteerRenderer = (await import("@prerenderer/renderer-puppeteer")).default;

  const prerenderer = new Prerenderer({
    staticDir: STATIC_DIR,
    renderer: new PuppeteerRenderer({
      executablePath: chromePath,
      renderAfterDocumentEvent: "prerender-ready",
      timeout: 60000,
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      maxConcurrentRoutes: 2,
    }),
  });

  try {
    await prerenderer.initialize();
    const renderedRoutes = await prerenderer.renderRoutes(routes);
    
    for (const rendered of renderedRoutes) {
      const sanitized = rendered.route.replace(/^\/+/, "") || "";
      const outputDir = sanitized ? path.join(STATIC_DIR, sanitized) : STATIC_DIR;
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, "index.html"), rendered.html, "utf8");
      console.log(`[prerender] Rendered: ${rendered.route}`);
    }
    
    console.log(`[prerender] Successfully rendered ${renderedRoutes.length} routes.`);
  } finally {
    await prerenderer.destroy();
  }
};

/**
 * Main prerender function
 */
const prerender = async () => {
  if (!fs.existsSync(STATIC_DIR)) {
    throw new Error(`[prerender] Missing dist folder at ${STATIC_DIR}. Run build first.`);
  }

  const routes = await getPrerenderRoutes();
  if (routes.length === 0) {
    console.log("[prerender] No routes to prerender.");
    return;
  }

  console.log(`[prerender] Processing ${routes.length} routes...`);

  const chromePath = await checkChromeAvailable();
  
  if (chromePath) {
    console.log(`[prerender] Found Chrome at: ${chromePath}`);
    await prerenderWithPuppeteer(routes, chromePath);
  } else {
    // Fallback for CI environments without Chrome
    await createFallbackHtml(routes);
  }
};

prerender().catch((error) => {
  console.error("[prerender] Error:", error.message);
  // Don't exit with error code - allow build to continue
  // The site will still work, just without prerendered content
  console.log("[prerender] Continuing build without full prerendering...");
  process.exit(0);
});
