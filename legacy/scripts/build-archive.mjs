/**
 * Turns the build in dist/ into the hidden archive the new site serves under
 * ARCHIVE_BASE, and writes it to ../public<ARCHIVE_BASE>. Runs after
 * generate-static-pages.mjs.
 *
 * - Rebases root-relative links and absolute horalix.com URLs onto the archive path.
 * - Marks every page noindex,nofollow: the archive is kept, not published.
 * - Writes each page as <route>.html so <base>/about is served without a
 *   trailing-slash redirect.
 */
import fs from "fs";
import path from "path";

import { ARCHIVE_BASE, rebaseAbsoluteUrls, rebaseRootRelativeAttributes } from "../archive-urls.js";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const PUBLIC_DIR = path.resolve(ROOT_DIR, "..", "public");
const OUTPUT_DIR = path.join(PUBLIC_DIR, ARCHIVE_BASE.slice(1));
const ARCHIVE_ROBOTS = "noindex,nofollow";

// Root-only and Netlify-only files: crawlers read the new site's versions at the root.
const ROOT_ONLY_FILES = ["_redirects", "robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt", "ai.txt"];

function listHtmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

function removeEmptyDirectories(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) removeEmptyDirectories(path.join(dir, entry.name));
  }
  if (dir !== DIST_DIR && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

/** "/about" for dist/about/index.html, "/" for dist/index.html, null for any other file. */
function routeForFile(file) {
  const relative = path.relative(DIST_DIR, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  return relative.endsWith("/index.html") ? `/${relative.slice(0, -"/index.html".length)}` : null;
}

function buildArchive() {
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    throw new Error("[archive] dist/index.html not found. Run the Vite build first.");
  }

  for (const file of ROOT_ONLY_FILES) fs.rmSync(path.join(DIST_DIR, file), { force: true });

  let pages = 0;
  for (const file of listHtmlFiles(DIST_DIR)) {
    const route = routeForFile(file);
    let html = rebaseRootRelativeAttributes(fs.readFileSync(file, "utf8"));
    // The home page's own URL is the archive root; the bare origin otherwise means horalix.com.
    html = html.replace(
      /(<link rel="canonical" href="|<meta property="og:url" content=")https:\/\/horalix\.com\/"/g,
      `$1https://horalix.com${ARCHIVE_BASE}/"`,
    );
    html = rebaseAbsoluteUrls(html);
    html = html.replace(/<meta name="robots" content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${ARCHIVE_ROBOTS}" />`);
    if (route) pages += 1;

    const target = route && route !== "/" ? path.join(DIST_DIR, `${route.slice(1)}.html`) : file;
    fs.writeFileSync(target, html, "utf8");
    if (target !== file) fs.rmSync(file);
  }
  removeEmptyDirectories(DIST_DIR);

  // Only one archive ever ships: clear any earlier one, wherever its base path pointed.
  for (const entry of fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && (entry.name === "old" || entry.name.startsWith("_archive-"))) {
      fs.rmSync(path.join(PUBLIC_DIR, entry.name), { recursive: true, force: true });
    }
  }
  fs.cpSync(DIST_DIR, OUTPUT_DIR, { recursive: true });
  console.log(`[archive] Wrote ${pages} pages to ${path.relative(path.resolve(ROOT_DIR, ".."), OUTPUT_DIR)}.`);
}

buildArchive();
