import fs from "fs";
import path from "path";
import Prerenderer from "@prerenderer/prerenderer";
import PuppeteerRenderer from "@prerenderer/renderer-puppeteer";
import { getPrerenderRoutes } from "./prerenderRoutes.js";

const ROOT_DIR = process.cwd();
const STATIC_DIR = path.join(ROOT_DIR, "dist");
const OUTPUT_FILENAME = "index.html";

const sanitizeRoute = (route) => {
  if (!route) {
    return "/";
  }
  const noHash = route.split("#")[0];
  const noQuery = noHash.split("?")[0];
  return noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
};

const writeRenderedRoute = (route, html) => {
  const sanitized = sanitizeRoute(route);
  const relative = sanitized.replace(/^\/+/, "");
  const outputDir = relative ? path.join(STATIC_DIR, relative) : STATIC_DIR;
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, OUTPUT_FILENAME), html, "utf8");
};

const assertRendered = (route, html) => {
  const hasRoot = html.includes('id="root"');
  const hasHeading = /<h1[\s>]/i.test(html);
  if (!hasRoot || !hasHeading) {
    throw new Error(
      `[prerender] Rendered output for "${route}" is missing expected content. ` +
        "This usually means the app did not finish rendering in Puppeteer."
    );
  }
};

const prerender = async () => {
  if (!fs.existsSync(STATIC_DIR)) {
    throw new Error(`[prerender] Missing dist folder at ${STATIC_DIR}. Run build first.`);
  }

  const routes = await getPrerenderRoutes();
  if (routes.length === 0) {
    throw new Error("[prerender] No routes provided.");
  }

  const prerenderer = new Prerenderer({
    staticDir: STATIC_DIR,
    renderer: new PuppeteerRenderer({
      renderAfterDocumentEvent: "prerender-ready",
      timeout: 60000,
      injectProperty: "__PRERENDER__",
      inject: true,
      maxConcurrentRoutes: 2,
      headless: true,
      pageHandler: async (page) => {
        await page.waitForSelector("h1", { timeout: 55000 });
        await page.evaluate(() => {
          document.dispatchEvent(new Event("prerender-ready"));
        });
      },
    }),
  });

  try {
    await prerenderer.initialize();
    const renderedRoutes = await prerenderer.renderRoutes(routes);
    renderedRoutes.forEach((rendered) => {
      assertRendered(rendered.route, rendered.html);
      writeRenderedRoute(rendered.route, rendered.html);
    });
    console.log(`[prerender] Rendered ${renderedRoutes.length} routes.`);
  } finally {
    await prerenderer.destroy();
  }
};

prerender().catch((error) => {
  console.error(error);
  process.exit(1);
});
