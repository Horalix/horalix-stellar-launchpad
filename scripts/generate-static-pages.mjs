import fs from "fs";
import path from "path";

import {
  benchmarkDisclosures,
  contributors,
  defaultSolutions,
  evidenceSourceOrder,
  evidenceSources,
  getRelatedResources,
  resources,
} from "../src/content/authorityData.js";

import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildPersonJsonLd,
  buildArticleJsonLd,
  buildCollectionWithItemsJsonLd,
  buildSoftwareApplicationJsonLd,
  buildProfilePageJsonLd,
  buildNewsArticleJsonLd,
  buildFAQPageJsonLd,
} from "./schemaBuilders.js";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");
const ENV_PATH = path.join(ROOT_DIR, ".env");
const CANONICAL_SITE_URL = "https://horalix.com";

const FALLBACK_NEWS = [
  {
    slug: "horalix-at-fls",
    title: "Horalix at FLS",
    summary: "Updates from Horalix public appearances and company milestones.",
    category: "NEWS",
  },
  {
    slug: "demo-day",
    title: "Demo Day",
    summary: "A company update covering product progress and public presentation.",
    category: "UPDATE",
  },
  {
    slug: "the-beginning",
    title: "The Beginning",
    summary: "Background on the early direction and company origin of Horalix.",
    category: "NEWS",
  },
];

function escapeHtml(input = "") {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSlugTitle(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readEnvFile() {
  if (!fs.existsSync(ENV_PATH)) {
    return {};
  }

  const envVars = {};
  const fileContent = fs.readFileSync(ENV_PATH, "utf8");

  for (const rawLine of fileContent.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    envVars[key] = value;
  }

  return envVars;
}

const loadedEnv = readEnvFile();

function resolveEnv(name) {
  const fromProcess = process.env[name];
  if (fromProcess && fromProcess.trim()) return fromProcess.trim();
  const fromFile = loadedEnv[name];
  return typeof fromFile === "string" && fromFile.trim() ? fromFile.trim() : undefined;
}

function getSupabaseConfig() {
  const url = resolveEnv("VITE_SUPABASE_URL");
  const key = resolveEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

async function fetchTable(config, table, select, filters = []) {
  if (!config) {
    return [];
  }

  const params = new URLSearchParams({ select });
  for (const [name, value] of filters) {
    params.set(name, value);
  }

  const requestUrl = `${config.url}/rest/v1/${table}?${params.toString()}`;
  const response = await fetch(requestUrl, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

function replaceTagContent(template, tag, value) {
  const pattern = new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, "i");
  return template.replace(pattern, `<${tag}>${escapeHtml(value)}</${tag}>`);
}

function replaceMetaContent(template, attr, key, value) {
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*\\/?>`, "i");
  const replacement = `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;
  return pattern.test(template) ? template.replace(pattern, replacement) : template.replace("</head>", `    ${replacement}\n  </head>`);
}

function replaceCanonical(template, canonicalUrl) {
  const pattern = /<link rel="canonical" href="[^"]*"\s*\/?>/i;
  const replacement = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
  return pattern.test(template) ? template.replace(pattern, replacement) : template.replace("</head>", `    ${replacement}\n  </head>`);
}

function injectJsonLd(template, jsonLdEntries) {
  const scripts = jsonLdEntries
    .map((entry) => `    <script type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join("\n");

  return template.replace(/<\/head>/i, `${scripts}\n  </head>`);
}

function buildHtmlDocument(template, { title, description, canonicalPath, body, robots, jsonLd = [] }) {
  const canonicalUrl = `${CANONICAL_SITE_URL}${canonicalPath}`;
  let html = template;
  html = replaceTagContent(html, "title", title);
  html = replaceMetaContent(html, "name", "description", description);
  html = replaceMetaContent(html, "name", "robots", robots || "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
  html = replaceMetaContent(html, "property", "og:title", title);
  html = replaceMetaContent(html, "property", "og:description", description);
  html = replaceMetaContent(html, "property", "og:url", canonicalUrl);
  html = replaceMetaContent(html, "name", "twitter:title", title);
  html = replaceMetaContent(html, "name", "twitter:description", description);
  html = replaceCanonical(html, canonicalUrl);
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
  html = injectJsonLd(html, jsonLd);
  return html;
}

function writeRouteHtml(route, html) {
  const normalized = route === "/" ? "" : route.replace(/^\/+/, "");
  const outputDir = normalized ? path.join(DIST_DIR, normalized) : DIST_DIR;
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), html, "utf8");
}

function linkList(items) {
  return items.map((item) => `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`).join("");
}

function wrapBody(content) {
  return `<main style="max-width:1120px;margin:0 auto;padding:96px 24px 72px;font-family:Arial,sans-serif;color:#0f172a;line-height:1.6">${content}</main>`;
}

function renderHomePage() {
  return {
    title: "Horalix | AI-Powered Echocardiography Workflow",
    description:
      "Horalix helps clinical teams move from manual echo measurement to AI-assisted reporting with faster turnaround and deeper structured outputs.",
    canonicalPath: "/",
    body: wrapBody(`
      <section>
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.24em;color:#2563eb">Clinical AI workflow</p>
        <h1 style="font-size:48px;line-height:1.05;margin:12px 0 20px">Horalix turns manual echo measurement into faster, structured clinical output.</h1>
        <p style="max-width:720px;color:#475569;font-size:18px">Hospitals and investors should understand Horalix as workflow software: faster report readiness, stronger measurement structure, and less repetitive post-acquisition burden.</p>
      </section>
      <section style="margin-top:40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
        <article style="border:1px solid #cbd5e1;padding:20px"><strong style="font-size:32px">~10s</strong><p>Internal benchmark for full measurement output after image acquisition.</p></article>
        <article style="border:1px solid #cbd5e1;padding:20px"><strong style="font-size:32px">94%+</strong><p>External benchmark context in AI-assisted FoCUS settings.</p></article>
        <article style="border:1px solid #cbd5e1;padding:20px"><strong style="font-size:32px">50+</strong><p>Unique measurements and about 80 total structured outputs.</p></article>
      </section>
      <section style="margin-top:40px">
        <h2>Primary routes</h2>
        <ul>${linkList([
          { href: "/solutions", label: "Solutions" },
          { href: "/resources", label: "Resources" },
          { href: "/about", label: "About Horalix" },
          { href: "/evidence", label: "Evidence and Benchmarks" },
          { href: "/news", label: "News" },
        ])}</ul>
      </section>
    `),
    jsonLd: [
      buildOrganizationJsonLd(),
      buildWebSiteJsonLd(),
      buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
    ],
  };
}

function renderSolutionsPage(solutions) {
  return {
    title: "Solutions | Horalix Clinical AI Workflow",
    description: "Explore Horalix clinical AI workflow solutions across cardiology, radiology, and pathology.",
    canonicalPath: "/solutions",
    body: wrapBody(`
      <h1>Horalix Solutions</h1>
      <p>Clinical AI workflow products built around real operational bottlenecks.</p>
      <ul>${linkList(
        solutions.map((solution) => ({
          href: `/solutions/${solution.slug}`,
          label: `${solution.name} - ${solution.short_description}`,
        })),
      )}</ul>
      <p><a href="/resources">Browse related resources</a></p>
    `),
    jsonLd: [
      buildCollectionWithItemsJsonLd(
        "Horalix Solutions",
        "Explore Horalix clinical AI workflow solutions across cardiology, radiology, and pathology.",
        "/solutions",
        solutions.map((s) => ({ name: s.name, path: `/solutions/${s.slug}`, description: s.short_description })),
      ),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Solutions", path: "/solutions" },
      ]),
    ],
  };
}

function renderSolutionDetail(solution) {
  const related = resources
    .filter((resource) => resource.solutionSlugs.includes(solution.slug))
    .slice(0, 3)
    .map((resource) => ({ href: `/resources/${resource.slug}`, label: resource.title }));

  return {
    title: `${solution.name} | Horalix`,
    description: solution.short_description,
    canonicalPath: `/solutions/${solution.slug}`,
    body: wrapBody(`
      <p><a href="/solutions">Back to solutions</a></p>
      <h1>${escapeHtml(solution.name)}</h1>
      <p>${escapeHtml(solution.short_description || "")}</p>
      <div>${escapeHtml(solution.full_description || "Clinical AI workflow software from Horalix.")}</div>
      <h2>Related reading</h2>
      <ul>${linkList(related)}</ul>
      <p><a href="/resources">Browse resources</a> | <a href="/#contact">Book a demo</a></p>
    `),
    jsonLd: [
      buildSoftwareApplicationJsonLd(solution),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Solutions", path: "/solutions" },
        { name: solution.name, path: `/solutions/${solution.slug}` },
      ]),
    ],
  };
}

function renderResourcesPage() {
  return {
    title: "Resources | AI Echocardiography and Clinical Workflow | Horalix",
    description: "Read Horalix resources on AI echocardiography, echo workflow automation, automated reporting, and clinical AI operations.",
    canonicalPath: "/resources",
    body: wrapBody(`
      <h1>Horalix Resources</h1>
      <p>Category pages built around the workflows Horalix wants to win.</p>
      <ul>${linkList(resources.map((resource) => ({ href: `/resources/${resource.slug}`, label: resource.title })))}</ul>
    `),
    jsonLd: [
      buildCollectionWithItemsJsonLd(
        "Horalix Resources",
        "Read Horalix resources on AI echocardiography, echo workflow automation, automated reporting, and clinical AI operations.",
        "/resources",
        resources.map((r) => ({ name: r.title, path: `/resources/${r.slug}`, description: r.summary })),
      ),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
      ]),
    ],
  };
}

function renderResourceDetail(resource) {
  const author = contributors.find((item) => item.slug === resource.authorSlug);
  const related = getRelatedResources(resource);

  return {
    title: resource.seoTitle,
    description: resource.seoDescription,
    canonicalPath: `/resources/${resource.slug}`,
    body: wrapBody(`
      <p><a href="/resources">Back to resources</a></p>
      <h1>${escapeHtml(resource.title)}</h1>
      <p>${escapeHtml(resource.summary)}</p>
      ${author ? `<p>By <a href="/team/${author.slug}">${escapeHtml(author.name)}</a></p>` : ""}
      ${resource.sections
        .map(
          (section) => `
            <section style="margin-top:32px">
              <h2>${escapeHtml(section.title)}</h2>
              ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
            </section>
          `,
        )
        .join("")}
      <section style="margin-top:32px">
        <h2>Related reading</h2>
        <ul>${linkList(related.map((item) => ({ href: `/resources/${item.slug}`, label: item.title })))}</ul>
      </section>
      <p><a href="/#contact">Book a demo</a></p>
    `),
    jsonLd: [
      buildArticleJsonLd(resource, author?.name || "Horalix", author?.slug || ""),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
        { name: resource.title, path: `/resources/${resource.slug}` },
      ]),
    ],
  };
}

function renderAboutPage() {
  return {
    title: "About | Horalix Clinical AI Infrastructure",
    description: "Learn what Horalix builds, who leads the company, and how it approaches clinical AI workflow trust.",
    canonicalPath: "/about",
    body: wrapBody(`
      <h1>About Horalix</h1>
      <p>Horalix builds clinical AI workflow software that helps care teams move from manual measurement toward faster, more structured reporting operations.</p>
      <h2>Leadership and contributors</h2>
      <ul>${linkList(contributors.map((contributor) => ({ href: `/team/${contributor.slug}`, label: `${contributor.name} - ${contributor.role}` })))}</ul>
      <p><a href="/evidence">View evidence and benchmark disclosures</a></p>
    `),
    jsonLd: [
      buildOrganizationJsonLd(),
      ...contributors.map((c) => buildPersonJsonLd(c)),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ]),
    ],
  };
}

function renderTeamProfile(contributor) {
  return {
    title: `${contributor.name} | ${contributor.role} | Horalix`,
    description: contributor.bioShort,
    canonicalPath: `/team/${contributor.slug}`,
    body: wrapBody(`
      <p><a href="/about">Back to about</a></p>
      <h1>${escapeHtml(contributor.name)}</h1>
      <p>${escapeHtml(contributor.role)}</p>
      <p>${escapeHtml(contributor.bioLong || contributor.bioShort)}</p>
      <h2>Focus areas</h2>
      <ul>${contributor.focusAreas.map((area) => `<li>${escapeHtml(area)}</li>`).join("")}</ul>
      <p><a href="/resources">Browse resources</a></p>
    `),
    jsonLd: [
      buildProfilePageJsonLd(contributor),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: contributor.name, path: `/team/${contributor.slug}` },
      ]),
    ],
  };
}

function renderEvidencePage() {
  return {
    title: "Evidence and Benchmarks | Horalix",
    description: "Review Horalix benchmark disclosures, external evidence sources, and claim governance.",
    canonicalPath: "/evidence",
    body: wrapBody(`
      <h1>Evidence and Benchmarks</h1>
      <p>This page separates internal product benchmarks from external evidence context.</p>
      <h2>Disclosure rules</h2>
      <ul>${benchmarkDisclosures.map((disclosure) => `<li>${escapeHtml(disclosure)}</li>`).join("")}</ul>
      <h2>External sources</h2>
      <ul>${linkList(
        evidenceSourceOrder.map((sourceId) => ({
          href: evidenceSources[sourceId].url,
          label: `${sourceId} - ${evidenceSources[sourceId].fullLabel}`,
        })),
      )}</ul>
    `),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": "https://horalix.com/evidence#webpage",
        name: "Evidence and Benchmarks",
        description: "Review Horalix benchmark disclosures, external evidence sources, and claim governance.",
        url: "https://horalix.com/evidence",
        publisher: { "@id": "https://horalix.com/#organization" },
      },
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Evidence", path: "/evidence" },
      ]),
    ],
  };
}

function renderNewsPage(newsItems) {
  return {
    title: "News | Horalix",
    description: "The latest updates, announcements, and insights from Horalix.",
    canonicalPath: "/news",
    body: wrapBody(`
      <h1>Horalix News</h1>
      <ul>${linkList(
        newsItems.map((article) => ({
          href: `/news/${article.slug}`,
          label: `${article.title} - ${article.summary || "Company update"}`,
        })),
      )}</ul>
    `),
    jsonLd: [
      buildCollectionWithItemsJsonLd(
        "Horalix News",
        "The latest updates, announcements, and insights from Horalix.",
        "/news",
        newsItems.map((a) => ({ name: a.title, path: `/news/${a.slug}`, description: a.summary })),
      ),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "News", path: "/news" },
      ]),
    ],
  };
}

function renderNewsArticle(article) {
  const paragraphs = typeof article.content === "string" && article.content
    ? article.content.split("\n\n").map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
    : `<p>${escapeHtml(article.summary || "Company update from Horalix.")}</p>`;

  return {
    title: `${article.title} | Horalix`,
    description: article.summary || "Company update from Horalix.",
    canonicalPath: `/news/${article.slug}`,
    body: wrapBody(`
      <p><a href="/news">Back to news</a></p>
      <h1>${escapeHtml(article.title)}</h1>
      <p>${escapeHtml(article.summary || "")}</p>
      ${paragraphs}
      <p><a href="/resources">Browse resources</a></p>
    `),
    jsonLd: [
      buildNewsArticleJsonLd(article),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "News", path: "/news" },
        { name: article.title, path: `/news/${article.slug}` },
      ]),
    ],
  };
}

function renderTermsPage() {
  return {
    title: "Terms | Horalix",
    description: "Terms and legal information for Horalix.",
    canonicalPath: "/terms",
    body: wrapBody(`
      <h1>Terms</h1>
      <p>Horalix legal and terms information is available on this route in the main application.</p>
      <p><a href="/">Return to the homepage</a></p>
    `),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": "https://horalix.com/terms#webpage",
        name: "Terms",
        description: "Terms and legal information for Horalix.",
        url: "https://horalix.com/terms",
        publisher: { "@id": "https://horalix.com/#organization" },
      },
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Terms", path: "/terms" },
      ]),
    ],
  };
}

async function loadDynamicData() {
  const config = getSupabaseConfig();

  if (!config) {
    console.warn("[static-pages] Missing Supabase env vars. Using fallback news and solution data.");
    return {
      solutions: defaultSolutions,
      newsItems: FALLBACK_NEWS,
    };
  }

  const [solutions, newsItems] = await Promise.allSettled([
    fetchTable(config, "solutions", "slug,name,short_description,full_description,badge_text", [
      ["is_active", "eq.true"],
      ["order", "display_order.asc"],
    ]),
    fetchTable(config, "news_articles", "slug,title,summary,content,category,location,display_date,published_at", [
      ["is_published", "eq.true"],
      ["order", "display_date.desc.nullslast"],
    ]),
  ]);

  return {
    solutions: solutions.status === "fulfilled" && solutions.value.length > 0 ? solutions.value : defaultSolutions,
    newsItems: newsItems.status === "fulfilled" && newsItems.value.length > 0 ? newsItems.value : FALLBACK_NEWS,
  };
}

async function generateStaticPages() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.log("[static-pages] dist/index.html not found, skipping static page generation.");
    return;
  }

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const { solutions, newsItems } = await loadDynamicData();

  const pages = new Map();
  pages.set("/", renderHomePage());
  pages.set("/about", renderAboutPage());
  pages.set("/evidence", renderEvidencePage());
  pages.set("/resources", renderResourcesPage());
  pages.set("/solutions", renderSolutionsPage(solutions));
  pages.set("/news", renderNewsPage(newsItems));
  pages.set("/terms", renderTermsPage());

  for (const resource of resources) {
    pages.set(`/resources/${resource.slug}`, renderResourceDetail(resource));
  }

  for (const contributor of contributors) {
    pages.set(`/team/${contributor.slug}`, renderTeamProfile(contributor));
  }

  for (const solution of solutions) {
    pages.set(`/solutions/${solution.slug}`, renderSolutionDetail(solution));
  }

  for (const article of newsItems) {
    pages.set(`/news/${article.slug}`, renderNewsArticle(article));
  }

  for (const [route, page] of pages.entries()) {
    const html = buildHtmlDocument(template, page);
    writeRouteHtml(route, html);
  }

  console.log(`[static-pages] Generated ${pages.size} static HTML pages.`);
}

generateStaticPages().catch((error) => {
  console.error("[static-pages] Generation error:", error.message);
  process.exit(0);
});
