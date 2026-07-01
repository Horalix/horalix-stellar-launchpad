/**
 * generate-og-image.mjs — renders the designed 1200×630 Open Graph share card
 * to public/assets/og/horalix-og.png using a locally installed Chrome/Edge.
 *
 * Run manually (npm run og:image) whenever the card design or entity facts
 * change, then commit the PNG. The deploy pipeline never needs Chrome — the
 * committed asset ships with the site.
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "assets", "og");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "horalix-og.png");
const LOGO_PATH = path.join(ROOT_DIR, "public", "assets", "horalix-logo-white.png");

function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    // Linux
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
}

// Brand tokens mirrored from src/index.css:
//   --primary: hsl(222 47% 11%)  --accent: hsl(217 91% 65%)  --background: hsl(210 20% 98%)
const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "Space Grotesk Fallback";
    src: local("Space Grotesk");
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    background: hsl(222 47% 8%);
    font-family: "Space Grotesk", "Space Grotesk Fallback", "Segoe UI", system-ui, sans-serif;
    color: hsl(210 40% 98%);
    position: relative;
    overflow: hidden;
  }
  /* Subtle blueprint grid — matches the site's clinical/engineering texture */
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(hsl(217 91% 65% / 0.06) 1px, transparent 1px),
      linear-gradient(90deg, hsl(217 91% 65% / 0.06) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  /* Soft accent glow anchoring the focal corner */
  .glow {
    position: absolute; right: -220px; top: -220px;
    width: 640px; height: 640px; border-radius: 50%;
    background: radial-gradient(circle, hsl(217 91% 65% / 0.22) 0%, transparent 65%);
  }
  .frame {
    position: absolute; inset: 40px;
    border: 1px solid hsl(217 91% 65% / 0.25);
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 56px 64px;
  }
  .corner {
    position: absolute; width: 20px; height: 20px;
    border-color: hsl(217 91% 65%); border-style: solid;
  }
  .corner.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
  .corner.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
  .brand { display: flex; align-items: center; gap: 20px; }
  .brand img { height: 56px; width: auto; }
  .brand .name { font-size: 34px; font-weight: 700; letter-spacing: 0.08em; }
  .badge {
    margin-left: auto;
    font-size: 15px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase;
    color: hsl(217 91% 72%);
    border: 1px solid hsl(217 91% 65% / 0.4);
    padding: 10px 18px;
  }
  h1 {
    font-size: 74px; line-height: 1.06; font-weight: 700; letter-spacing: -0.015em;
    max-width: 980px;
  }
  h1 .accent { color: hsl(217 91% 68%); }
  .meta { display: flex; align-items: center; gap: 14px; }
  .chip {
    font-size: 19px; font-weight: 600; letter-spacing: 0.04em;
    color: hsl(210 40% 96%);
    background: hsl(217 91% 65% / 0.12);
    border: 1px solid hsl(217 91% 65% / 0.35);
    padding: 12px 20px;
    display: flex; align-items: center; gap: 10px;
  }
  .chip .dot { width: 6px; height: 6px; border-radius: 50%; background: hsl(217 91% 68%); }
  .site {
    margin-left: auto; font-size: 21px; font-weight: 600; letter-spacing: 0.06em;
    color: hsl(210 40% 98% / 0.75);
  }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="glow"></div>
  <div class="frame">
    <div class="corner tl"></div>
    <div class="corner br"></div>
    <div class="brand">
      <img src="data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}" alt="" />
      <span class="name">HORALIX</span>
      <span class="badge">Echocardiography AI</span>
    </div>
    <h1>From echo capture to <span class="accent">report-ready</span> in seconds.</h1>
    <div class="meta">
      <span class="chip"><span class="dot"></span>50+ structured measurements</span>
      <span class="chip"><span class="dot"></span>DICOM-compatible</span>
      <span class="chip"><span class="dot"></span>Clinician sign-off</span>
      <span class="site">horalix.com</span>
    </div>
  </div>
</body>
</html>`;

async function main() {
  const executablePath = findChrome();
  if (!executablePath) {
    console.error("[og-image] No Chrome/Edge found. Set CHROME_PATH and re-run.");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.screenshot({ path: OUTPUT_PATH, type: "png" });
    console.log(`[og-image] Wrote ${path.relative(ROOT_DIR, OUTPUT_PATH)} (1200x630).`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[og-image] Failed:", error.message);
  process.exit(1);
});
