/**
 * generate-favicon.mjs — renders the Horalix favicon set (navy tile + white
 * logomark) to public/assets/favicon/ using a locally installed Chrome/Edge.
 *
 * Run manually (npm run favicon) when the mark changes, then commit the PNGs.
 * The deploy pipeline never needs Chrome — the committed assets ship as-is.
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "assets", "favicon");
const LOGO_PATH = path.join(ROOT_DIR, "public", "assets", "horalix-logo-white.png");
const SIZES = [512, 180, 32];

function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

// Brand primary hsl(222 47% 11%) tile so the white mark stays visible on
// light and dark browser chrome alike.
const htmlFor = (size) => `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  * { margin: 0; padding: 0; }
  body { width: ${size}px; height: ${size}px; background: transparent; }
  .tile {
    width: 100%; height: 100%;
    background: hsl(222 47% 11%);
    border-radius: ${Math.round(size * 0.22)}px;
    display: flex; align-items: center; justify-content: center;
  }
  img { width: 68%; height: 68%; object-fit: contain; }
</style></head>
<body>
  <div class="tile">
    <img src="data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}" alt="" />
  </div>
</body></html>`;

async function main() {
  const executablePath = findChrome();
  if (!executablePath) {
    console.error("[favicon] No Chrome/Edge found. Set CHROME_PATH and re-run.");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
  });

  try {
    for (const size of SIZES) {
      const page = await browser.newPage();
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.setContent(htmlFor(size), { waitUntil: "load" });
      await page.evaluate(() => Promise.all(Array.from(document.images, (img) => img.decode())));
      const outputPath = path.join(OUTPUT_DIR, `horalix-favicon-${size}.png`);
      await page.screenshot({ path: outputPath, type: "png", omitBackground: true });
      await page.close();
      console.log(`[favicon] Wrote ${path.relative(ROOT_DIR, outputPath)} (${size}x${size}).`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[favicon] Failed:", error.message);
  process.exit(1);
});
