/**
 * compress-images.mjs — re-encodes heavy PNG screenshots to WebP using a
 * locally installed Chrome (canvas toDataURL), no native deps required.
 *
 * Run manually (node scripts/compress-images.mjs) when source screenshots
 * change, then commit the .webp files and keep imports pointing at them.
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const ROOT_DIR = process.cwd();
const TARGETS = [
  "src/assets/hero/screenshot-dashboard.png",
  "src/assets/hero/screenshot-analysis.png",
  "src/assets/hero/screenshot-segmentation.png",
];
const MAX_WIDTH = 1600;
const QUALITY = 0.82;

function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function main() {
  const executablePath = findChrome();
  if (!executablePath) {
    console.error("[images] No Chrome found. Set CHROME_PATH and re-run.");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();

    for (const relPath of TARGETS) {
      const absPath = path.join(ROOT_DIR, relPath);
      if (!fs.existsSync(absPath)) {
        console.warn(`[images] Skipping missing ${relPath}`);
        continue;
      }

      const base64 = fs.readFileSync(absPath).toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      const webpDataUrl = await page.evaluate(
        async (src, maxWidth, quality) => {
          const img = new Image();
          img.src = src;
          await img.decode();
          const scale = Math.min(1, maxWidth / img.naturalWidth);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL("image/webp", quality);
        },
        dataUrl,
        MAX_WIDTH,
        QUALITY,
      );

      const outPath = absPath.replace(/\.png$/i, ".webp");
      const webpBuffer = Buffer.from(webpDataUrl.split(",")[1], "base64");
      fs.writeFileSync(outPath, webpBuffer);

      const before = (fs.statSync(absPath).size / 1024).toFixed(0);
      const after = (webpBuffer.length / 1024).toFixed(0);
      console.log(`[images] ${path.basename(outPath)}: ${before} kB → ${after} kB`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[images] Failed:", error.message);
  process.exit(1);
});
