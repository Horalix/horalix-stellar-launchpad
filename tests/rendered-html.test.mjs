import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import legacyArchive from "../legacy/archive-routes.json" with { type: "json" };

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

function render(path = "/") {
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the Horalix homepage as useful HTML", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Horalix — AI-assisted echocardiography workflow<\/title>/i);
  assert.match(html, /<h1[^>]*>Make every echo[\s\S]*ready for review\.[\s\S]*<\/h1>/i);
  assert.match(html, /Pilot-stage/);
  assert.match(html, /Clinician sign-off/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|PathologyAI|RadiologyAI/i);
  assert.doesNotMatch(html, /LVID 48\.2|Length 82\.4|Septal thickness/i);
});

test("priority routes render without a client-side loading gate", async () => {
  for (const path of ["/platform", "/for-hospitals", "/for-clinicians", "/evidence", "/security", "/investors", "/product-tour", "/resources", "/about", "/press", "/contact", "/privacy", "/terms"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<h1/i, path);
  }
});

test("priority pages expose route-specific discovery metadata", async () => {
  const cases = [
    ["/platform", "AI Echocardiography Workflow Platform", "https://horalix.com/platform"],
    ["/for-hospitals", "AI Echocardiography for Hospitals", "https://horalix.com/for-hospitals"],
    ["/evidence", "Clinical AI Evidence &amp; Transparency", "https://horalix.com/evidence"],
  ];
  for (const [path, title, canonical] of cases) {
    const response = await render(path);
    const html = await response.text();
    assert.match(html, new RegExp(`<meta property="og:title" content="${title}"`, "i"), path);
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`, "i"), path);
  }
});

test("platform answers are visible and represented in structured data", async () => {
  const response = await render("/platform");
  const html = await response.text();
  assert.match(html, /What is Horalix\?/);
  assert.match(html, /Does Horalix diagnose without clinician review\?/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /"@type":"SoftwareApplication"/);
});

test("evidence and resource hubs expose visible answer-oriented structure", async () => {
  const evidence = await render("/evidence");
  const evidenceHtml = await evidence.text();
  assert.match(evidenceHtml, /What has Horalix not yet demonstrated\?/);
  assert.match(evidenceHtml, /"@type":"FAQPage"/);
  const resources = await render("/resources");
  const resourcesHtml = await resources.text();
  assert.match(resourcesHtml, /"@type":"CollectionPage"/);
  assert.match(resourcesHtml, /"@type":"ItemList"/);
});

test("research articles name their author and company reviewer", async () => {
  const response = await render("/resources/human-oversight-in-echo-ai");
  const html = await response.text();
  assert.match(html, /By[\s\S]*Kerim Sabic[\s\S]*Company review by[\s\S]*Neuman Alkhalil/);
  assert.match(html, /"@type":"Person"/);
  assert.match(html, /"reviewedBy":\{"@id":"https:\/\/horalix\.com\/about#neuman-alkhalil"\}/);
});

test("the team page renders all four verified portraits and Person records", async () => {
  const response = await render("/about");
  const html = await response.text();
  for (const [name, image] of [
    ["Kerim Sabic", "/team/kerim-sabic.webp"],
    ["Amr Husain", "/team/amr-husain.webp"],
    ["Affan Kapidzic", "/team/affan-kapidzic.webp"],
    ["Neuman Alkhalil", "/team/neuman-alkhalil.webp"],
  ]) {
    assert.match(html, new RegExp(name));
    assert.match(html, new RegExp(image.replaceAll("/", "\\/")));
  }
  // Four founders plus four advisors. The counts are asserted separately because only
  // founders may carry `worksFor` — an advisor rendered as an employee is a factual error.
  assert.equal((html.match(/"@type":"Person"/g) || []).length, 8);
  assert.equal((html.match(/"worksFor"/g) || []).length, 4);

  for (const [advisor, portrait] of [
    ["Bojan Lazic", "/advisors/bojan-lazic.webp"],
    ["Damir Vrabac", "/advisors/damir-vrabac.webp"],
    ["Nabil Naser", "/advisors/nabil-naser.webp"],
    ["Taib Delic", "/advisors/taib-delic.webp"],
  ]) {
    assert.match(html, new RegExp(advisor), advisor);
    assert.match(html, new RegExp(portrait.replaceAll("/", "\\/")), portrait);
  }
  // Every advisor carries a background line — a card with a name and no context is a regression.
  for (const line of ["Techstars All-Star Mentor", "co-founder of Valar Labs", "FACC, FESC, FASE", "perinatal medicine"]) {
    assert.ok(html.includes(line), line);
  }
});

test("team identities resolve to verifiable external profiles", async () => {
  const about = await (await render("/about")).text();
  const profiles = [
    "https://www.linkedin.com/in/kerims/",
    "https://www.linkedin.com/in/amr-husain-6ab6b71b/",
    "https://www.linkedin.com/in/affan-kapidzic/",
    "https://www.linkedin.com/in/neuman-alkhalil/",
  ];
  for (const profile of profiles) {
    // Present twice: once as a visible link, once inside the Person sameAs.
    assert.match(about, new RegExp(profile.replaceAll("/", "\\/")), profile);
  }
  assert.equal((about.match(/"sameAs":\["https:\/\/www\.linkedin\.com\/in\//g) || []).length, 4);

  // An article's author and reviewer carry the same verifiable identity.
  const article = await (await render("/resources/gdpr-clinical-ai-hospital-pilots")).text();
  assert.match(article, /"@id":"https:\/\/horalix\.com\/about#amr-husain"/);
  assert.match(article, /linkedin\.com\/in\/amr-husain-6ab6b71b/);
  assert.match(article, /linkedin\.com\/in\/affan-kapidzic/);
});

test("verified news is indexable, in the sitemap, and individual updates render", async () => {
  const news = await render("/news");
  const newsHtml = await news.text();
  assert.equal(news.status, 200);
  assert.match(newsHtml, /Progress, with the status attached/);
  assert.doesNotMatch(newsHtml, /noindex/i);
  const sitemap = await render("/sitemap.xml");
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /<loc>https:\/\/horalix\.com\/news<\/loc>/);
  assert.match(sitemapXml, /horalix-nvidia-inception/);
  const article = await render("/news/horalix-nvidia-inception");
  assert.equal(article.status, 200);
  assert.match(await article.text(), /"@type":"NewsArticle"/);
});

test("navigation is server-resilient and brand film has no user controls or captions", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /<a[^>]+href="\/platform"[^>]*>Platform<\/a>/);
  assert.match(html, /<video[^>]+autoplay[^>]+loop[^>]+muted[^>]+playsinline/i);
  assert.doesNotMatch(html, /<track|controls=""|controls="true"/i);
});

test("approved build figures render from the claim register", async () => {
  const html = await (await render()).text();
  assert.match(html, /50\+/);
  assert.match(html, /~80/);
  assert.match(html, /~10s/);
  // The figures must never appear without the internal-benchmark boundary beside them.
  assert.match(html, /Internal benchmarks measured on the current pilot build/);
  assert.match(html, /not diagnostic performance/i);
});

test("the hospital dossier carries buyer-facing structure and schema", async () => {
  const html = await (await render("/for-hospitals")).text();
  assert.match(html, /"@type":"Service"/);
  assert.match(html, /"@type":"HowTo"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  for (const heading of ["The bottleneck is after image capture", "Questions your DPO will ask first", "The objections we expect, answered directly"]) {
    assert.match(html, new RegExp(heading), heading);
  }
  assert.match(html, /Who is controller and who is processor\?/);
});

test("the entity graph names the organisation, founders, and product tour video", async () => {
  const home = await (await render()).text();
  assert.match(home, /"@type":\["MedicalOrganization","Organization"\]/);
  assert.match(home, /"founder":\[/);
  assert.match(home, /horalix\.com\/about#kerim-sabic/);
  const tour = await (await render("/product-tour")).text();
  assert.match(tour, /"@type":"VideoObject"/);
  assert.match(tour, /"transcript":/);
});

test("answer engines are allowed and the icon set is square", async () => {
  const robots = await (await render("/robots.txt")).text();
  for (const agent of ["ClaudeBot", "PerplexityBot", "Google-Extended", "GPTBot", "OAI-SearchBot"]) {
    assert.match(robots, new RegExp(`User-Agent: ${agent}`, "i"), agent);
  }
  assert.doesNotMatch(robots, /User-Agent: GPTBot\s*\nDisallow: \/\s*$/i);
  const html = await (await render()).text();
  assert.match(html, /horalix-icon-192\.png/);
  assert.match(html, /rel="apple-touch-icon"[^>]*horalix-icon-180\.png|horalix-icon-180\.png/);
  assert.doesNotMatch(html, /rel="icon"[^>]*horalix-mark\.png/);
});

test("the research library is clustered, complete, and in the sitemap", async () => {
  const html = await (await render("/resources")).text();
  for (const cluster of ["Buyer guides", "Clinical workflow", "Integration and deployment", "Governance and evidence"]) {
    assert.match(html, new RegExp(cluster), cluster);
  }
  const sitemap = await (await render("/sitemap.xml")).text();
  for (const slug of [
    "ai-echocardiography-software-guide",
    "echo-reporting-burden",
    "automated-vs-manual-echo-measurement",
    "clinical-ai-procurement-checklist",
    "gdpr-clinical-ai-hospital-pilots",
    "eu-mdr-clinical-ai-pathway",
    "focused-cardiac-ultrasound-ai-evidence",
    "on-prem-vs-cloud-clinical-ai",
  ]) {
    assert.match(sitemap, new RegExp(`/resources/${slug}<`), slug);
    const article = await render(`/resources/${slug}`);
    assert.equal(article.status, 200, slug);
    assert.match(await article.text(), /"@type":"Article"/, slug);
  }
});

test("news articles carry their own social card and breadcrumbs", async () => {
  const html = await (await render("/news/horalix-nvidia-inception")).text();
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /<meta name="twitter:title" content="[^"]*NVIDIA/i);
  assert.doesNotMatch(html, /<meta name="twitter:title" content="Make every echo ready for review\."/);
});

test("legacy solution and demo URLs redirect", async () => {
  const solution = await render("/solutions/pathology-ai");
  assert.equal(solution.status, 308);
  assert.equal(solution.headers.get("location"), "/platform");
  const demo = await render("/demo/horalix-demo.html");
  assert.equal(demo.status, 308);
  assert.equal(demo.headers.get("location"), "/product-tour");
});

// Every URL the previous site listed in its sitemap when it was archived (2026-10-22).
const previousSitemap = [
  "/", "/about", "/evidence", "/news", "/press", "/resources", "/solutions", "/terms",
  "/solutions/cardiology-ai", "/solutions/pathology-ai", "/solutions/radiology-ai",
  "/news/horalix-nvidia-inception", "/news/horalix-viennaup-2026-travel-grant", "/news/horalix-adria-future-hackathon-2026",
  "/news/maribor-hospital-pilot-ai-echocardiography-workflow", "/news/clinic-validation-in-sarajevo-poliklinika-dr-nabil",
  "/news/horalix-at-fls", "/news/demo-day", "/news/the-beginning",
  "/resources/ai-echocardiography-software", "/resources/manual-vs-ai-echocardiography-measurement",
  "/resources/echo-workflow-automation-for-hospitals", "/resources/focused-cardiac-ultrasound-ai",
  "/resources/automated-echocardiography-reporting", "/resources/cardiac-ultrasound-ai-europe",
  "/resources/ai-in-medical-imaging-workflow", "/resources/how-ai-reduces-echo-reporting-burden",
  "/resources/how-to-choose-ai-echocardiography-software",
  "/team/kerim-sabic", "/team/amr-husain", "/team/affan-kapidzic", "/team/neuman-alkhalil",
];

const archiveBase = legacyArchive.basePath;

/** Serves the built archive in public/ the way the Cloudflare asset layer would. */
const archiveAssets = {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const relative = pathname.slice(archiveBase.length).replace(/^\//, "");
    const candidates = relative === "" ? ["index.html"] : [relative, `${relative}.html`];
    for (const candidate of candidates) {
      try {
        const body = await readFile(new URL(`../public${archiveBase}/${candidate}`, import.meta.url));
        return new Response(body, { status: 200, headers: { "Content-Type": candidate.endsWith(".html") ? "text/html" : "application/octet-stream" } });
      } catch {
        // try the next candidate
      }
    }
    return new Response("Not found", { status: 404 });
  },
};

function renderWithArchive(path) {
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: archiveAssets }, { waitUntil() {}, passThroughOnException() {} });
}

test("every URL from the previous site's sitemap lands on a page of the new site", async () => {
  for (const path of previousSitemap) {
    const response = await render(path);
    if (response.status === 200) continue;
    assert.equal(response.status, 308, path);
    const target = response.headers.get("location");
    assert.ok(!target.startsWith(archiveBase), `${path} must not lead into the archive`);
    const resolved = await render(target.split("#")[0]);
    assert.equal(resolved.status, 200, `${path} -> ${target}`);
  }
  for (const [path, target] of [
    ["/resources/cardiac-ultrasound-ai-europe", "/resources/eu-mdr-clinical-ai-pathway"],
    ["/news/demo-day", "/news/techstars-sarajevo-founder-catalyst"],
    ["/news/horalix-at-fls", "/news"],
    ["/team/kerim-sabic?ref=x", "/about?ref=x#kerim-sabic"],
  ]) {
    assert.equal((await render(path)).headers.get("location"), target, path);
  }
});

test("the previous site is kept as a hidden archive that is never indexed or linked", async () => {
  for (const path of [`${archiveBase}/`, `${archiveBase}/about`, `${archiveBase}/news/demo-day`]) {
    const response = await renderWithArchive(path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", path);
    assert.match(await response.text(), /<meta name="robots" content="noindex,nofollow"/, path);
  }
  const admin = await renderWithArchive(`${archiveBase}/admin/news`);
  assert.equal(admin.status, 200);
  assert.equal(admin.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.match(admin.headers.get("content-security-policy") ?? "", /https:\/\/\*\.supabase\.co/);
  assert.match(await admin.text(), /<div id="root">/);
  assert.equal((await renderWithArchive(`${archiveBase}/assets/missing.js`)).status, 404);

  for (const path of ["/", "/sitemap.xml", "/robots.txt", "/about", "/news"]) {
    assert.ok(!(await (await render(path)).text()).includes(archiveBase), `${path} must not mention the archive`);
  }
});

test("unsubscribe links from old emails and old share images still resolve", async () => {
  const unsubscribe = await render("/unsubscribe?token=abc");
  assert.equal(unsubscribe.status, 308);
  assert.equal(unsubscribe.headers.get("location"), `${archiveBase}/unsubscribe?token=abc`);
  const asset = await render("/assets/og/horalix-og.png");
  assert.equal(asset.headers.get("location"), `${archiveBase}/assets/og/horalix-og.png`);
  for (const path of ["/login", "/admin", "/verify-email"]) {
    assert.notEqual((await render(path)).status, 308, path);
  }
});

test("requests Netlify proxies from horalix.com are served as horalix.com", async () => {
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const workersDev = "https://horalix-com.server-9de.workers.dev";
  const proxied = (path, init = {}) => worker.fetch(new Request(`${workersDev}${path}`, { ...init, headers: { "X-Horalix-Proxy": "netlify", "X-Forwarded-For": "203.0.113.7, 198.51.100.1", ...init.headers } }), { ASSETS: archiveAssets }, ctx);

  const page = await proxied("/platform", { headers: { accept: "text/html" } });
  assert.equal(page.status, 200);
  assert.equal(page.headers.get("x-robots-tag"), null);
  const direct = await worker.fetch(new Request(`${workersDev}/platform`, { headers: { accept: "text/html" } }), { ASSETS: archiveAssets }, ctx);
  assert.equal(direct.headers.get("x-robots-tag"), "noindex, nofollow");
  // The API routes import cloudflare:workers, which Node cannot load; their same-origin
  // check behind the proxy is verified against the deployed Worker instead.
});

test("www.horalix.com redirects to the canonical host with its path", async () => {
  const response = await worker.fetch(new Request("https://www.horalix.com/platform?ref=x"), { ASSETS: archiveAssets }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://horalix.com/platform?ref=x");
});

test("the glossary answers each term on its own page and on the hub", async () => {
  const hub = await render("/glossary");
  assert.equal(hub.status, 200);
  const hubHtml = await hub.text();
  assert.match(hubHtml, /"@type":"DefinedTermSet"/);
  assert.equal((hubHtml.match(/"@type":"DefinedTerm"/g) || []).length, 15);
  assert.match(hubHtml, /<link rel="canonical" href="https:\/\/horalix\.com\/glossary"/);

  const term = await render("/glossary/left-ventricular-ejection-fraction");
  assert.equal(term.status, 200);
  const html = await term.text();
  assert.match(html, /<h1[^>]*>What is left ventricular ejection fraction \(LVEF\)\?<\/h1>/);
  assert.match(html, /Short answer:/);
  for (const type of ["DefinedTerm", "MedicalWebPage", "FAQPage", "BreadcrumbList"]) assert.match(html, new RegExp(`"@type":"${type}"`), type);
  assert.match(html, /pubmed\.ncbi\.nlm\.nih\.gov\/25559473/);
  assert.equal((await render("/glossary/not-a-term")).status, 404);

  const sitemap = await (await render("/sitemap.xml")).text();
  assert.match(sitemap, /<loc>https:\/\/horalix\.com\/glossary<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/horalix\.com\/glossary\/automation-bias<\/loc>/);
  assert.match(await (await render("/")).text(), /href="\/glossary"/);
});

test("pages carry no eyebrow labels or decorative loop effects", async () => {
  for (const path of ["/", "/platform", "/for-hospitals", "/investors", "/about", "/glossary/tapse"]) {
    const html = await (await render(path)).text();
    assert.doesNotMatch(html, /class="eyebrow/, path);
    assert.doesNotMatch(html, /scan-line|media-corner|cursor-echo|footer-watermark|benefit-icon/, path);
  }
});

test("the organisation lists only identity profiles in sameAs and coverage in subjectOf", async () => {
  const html = await (await render("/")).text();
  assert.match(html, /"sameAs":\["https:\/\/www\.linkedin\.com\/company\/horalix\/"\]/);
  assert.match(html, /"subjectOf":\[\{"@type":"NewsArticle"/);
  assert.match(html, /klix\.ba/);
  // News updates without a photo share the News card, not the homepage card.
  const news = await (await render("/news/horalix-nvidia-inception")).text();
  assert.doesNotMatch(news, /<meta property="og:image" content="https:\/\/horalix\.com\/og\.jpg"/);
});
