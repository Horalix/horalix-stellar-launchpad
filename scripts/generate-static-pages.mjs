import fs from "fs";
import path from "path";

import {
  benchmarkDisclosures,
  contributors,
  defaultSolutions,
  evidenceSourceOrder,
  evidenceSources,
  getRelatedResources,
  hospitalValuePoints,
  investorSignalPoints,
  organizationProfile,
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
  buildSpeakableJsonLd,
} from "./schemaBuilders.js";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");
const ENV_PATH = path.join(ROOT_DIR, ".env");
const CANONICAL_SITE_URL = "https://horalix.com";

const STATIC_FAQ_ITEMS = [
  {
    question: "What is Horalix?",
    answer: "Horalix is AI-powered clinical workflow software that helps echocardiography teams move from manual measurement to faster, more structured reporting. It automates post-acquisition measurement extraction and produces report-ready outputs while keeping clinicians in control of review and sign-off.",
  },
  {
    question: "How does Horalix improve echocardiography workflow?",
    answer: "Horalix compresses the manual post-scan workload by automatically extracting measurements from echocardiographic images. Instead of manually clicking and entering each parameter, clinicians review structured AI-generated outputs. This reduces time to report readiness and lowers repetitive interaction burden.",
  },
  {
    question: "Is Horalix a replacement for clinicians?",
    answer: "No. Horalix is an AI-assisted workflow tool, not a replacement for clinical judgment. Clinicians remain in full control of interpretation, review, and final sign-off. The software reduces manual measurement work so clinicians can focus on higher-value clinical decision-making.",
  },
  {
    question: "What evidence supports Horalix product claims?",
    answer: "Horalix separates internal product benchmarks from external evidence context. Internal benchmarks describe observed product performance. External benchmark context refers to published peer-reviewed literature on AI-assisted echocardiography. Full disclosure is available at horalix.com/evidence.",
  },
  {
    question: "Where does Horalix operate?",
    answer: "Horalix operates with a Europe-first posture and global clinical AI relevance. The company was founded in 2024 and is building partnerships with regional healthcare providers in Europe.",
  },
  {
    question: "What measurements does Horalix extract?",
    answer: "Horalix CardiologyAI extracts over 50 unique cardiac measurements and produces approximately 80 total structured outputs per echocardiographic study. These include standard chamber dimensions, ejection fraction, valve assessments, and diastolic function parameters.",
  },
  {
    question: "How fast does Horalix produce results?",
    answer: "Internal benchmarks show report-ready measurement output in approximately 10 seconds after image acquisition. This is an internal benchmark, not an externally validated claim. Actual performance may vary based on image quality and study complexity.",
  },
  {
    question: "Does Horalix integrate with existing hospital systems?",
    answer: "Horalix is designed for DICOM-compatible workflow integration, fitting into existing echocardiography lab infrastructure. The platform processes standard DICOM echocardiographic images and produces structured outputs compatible with clinical reporting systems.",
  },
];

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

// ─── Utility helpers ─────────────────────────────────────────────────────────

function escapeHtml(input = "") {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const envVars = {};
  for (const rawLine of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1);
    envVars[key] = value;
  }
  return envVars;
}

const loadedEnv = readEnvFile();
function resolveEnv(name) {
  const v = process.env[name]?.trim() || loadedEnv[name]?.trim();
  return v || undefined;
}

function getSupabaseConfig() {
  const url = resolveEnv("VITE_SUPABASE_URL");
  const key = resolveEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
  return url && key ? { url, key } : null;
}

async function fetchTable(config, table, select, filters = []) {
  if (!config) return [];
  const params = new URLSearchParams({ select });
  for (const [name, value] of filters) params.set(name, value);
  const response = await fetch(`${config.url}/rest/v1/${table}?${params.toString()}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

// ─── HTML helpers ────────────────────────────────────────────────────────────

function replaceTagContent(template, tag, value) {
  return template.replace(new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, "i"), `<${tag}>${escapeHtml(value)}</${tag}>`);
}

function replaceMetaContent(template, attr, key, value) {
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*\\/?>`, "i");
  const replacement = `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;
  return pattern.test(template) ? template.replace(pattern, replacement) : template.replace("</head>", `    ${replacement}\n  </head>`);
}

function replaceCanonical(template, url) {
  const pattern = /<link rel="canonical" href="[^"]*"\s*\/?>/i;
  const replacement = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  return pattern.test(template) ? template.replace(pattern, replacement) : template.replace("</head>", `    ${replacement}\n  </head>`);
}

function injectJsonLd(template, entries) {
  const scripts = entries.map((e) => `    <script type="application/ld+json">${JSON.stringify(e)}</script>`).join("\n");
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

const S = `style`;
const wrap = (content) =>
  `<main ${S}="max-width:1120px;margin:0 auto;padding:96px 24px 72px;font-family:system-ui,-apple-system,Arial,sans-serif;color:#0f172a;line-height:1.7">${content}</main>`;

const nav = (items) =>
  `<nav aria-label="Breadcrumb" ${S}="font-size:13px;color:#64748b;margin-bottom:24px">${items.map((item, i) => i < items.length - 1 ? `<a href="${item.href}">${escapeHtml(item.label)}</a> / ` : `<span>${escapeHtml(item.label)}</span>`).join("")}</nav>`;

const disclaimer = `<p ${S}="font-size:12px;color:#94a3b8;margin-top:48px;border-top:1px solid #e2e8f0;padding-top:16px">Medical disclaimer: This content is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Consult qualified healthcare professionals for clinical decisions. Horalix is workflow software that assists clinicians — it is not a diagnostic device and does not make clinical decisions independently.</p>`;

// Generate unique footer nav per page to avoid duplicate anchor text warnings
function footerNav(currentPage) {
  const links = [
    { href: "/", labels: ["Horalix Home", "Back to Homepage", "Horalix Homepage", "Main Page"] },
    { href: "/solutions", labels: ["AI Solutions", "Clinical AI Solutions", "Workflow Solutions", "All Solutions"] },
    { href: "/solutions/cardiology-ai", labels: ["CardiologyAI Module", "Echocardiography AI", "CardiologyAI Product", "AI Echo Software"] },
    { href: "/resources", labels: ["Knowledge Hub", "Clinical AI Resources", "Research & Guides", "Learning Resources"] },
    { href: "/about", labels: ["About Horalix", "Company & Team", "Our Team", "Who We Are"] },
    { href: "/evidence", labels: ["Evidence & Benchmarks", "Benchmark Disclosures", "Clinical Evidence", "Evidence Policy"] },
    { href: "/news", labels: ["Latest News", "Company Updates", "News & Announcements", "Recent Updates"] },
    { href: "/terms", labels: ["Terms of Service", "Legal Terms", "Usage Terms", "Terms & Conditions"] },
    { href: "/#contact", labels: ["Get in Touch", "Contact Horalix", "Request Demo", "Reach Out"] },
    { href: "https://www.linkedin.com/company/horalix/", labels: ["Horalix on LinkedIn", "LinkedIn Profile", "Follow on LinkedIn", "LinkedIn Page"], rel: "noopener" },
  ];
  // Pick label variant based on page name hash to ensure uniqueness
  const hash = currentPage.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return `<nav ${S}="margin-top:48px;padding-top:24px;border-top:1px solid #e2e8f0;display:flex;flex-wrap:wrap;gap:16px;font-size:14px">${links.map((link, i) => {
    const label = link.labels[(hash + i) % link.labels.length];
    return `<a href="${link.href}"${link.rel ? ` rel="${link.rel}"` : ""}>${label}</a>`;
  }).join(" ")}</nav>`;
}

// ─── Page renderers ──────────────────────────────────────────────────────────

function renderHomePage() {
  return {
    title: "Horalix | AI-Powered Echocardiography Workflow Software",
    description:
      "Horalix builds AI-powered echocardiography workflow software for faster, structured reporting. 50+ automated cardiac measurements per study.",
    canonicalPath: "/",
    body: wrap(`
      <section>
        <p ${S}="font-size:12px;text-transform:uppercase;letter-spacing:.24em;color:#2563eb;margin-bottom:8px">AI-Powered Echocardiography Workflow Software</p>
        <h1 ${S}="font-size:44px;line-height:1.1;margin:0 0 20px">AI-Powered Echocardiography Workflow Software for Faster, Structured Reporting</h1>
        <p data-speakable ${S}="max-width:720px;color:#475569;font-size:18px;margin-bottom:8px">Horalix is AI-powered echocardiography workflow software that automates measurement extraction and structured reporting for cardiac ultrasound teams. Clinical teams move from manual post-acquisition work to reviewing AI-generated outputs — achieving faster reporting, stronger measurement structure, and less repetitive burden per study.</p>
        <p ${S}="max-width:720px;color:#475569;font-size:16px">Built for hospitals, echo labs, and cardiology departments seeking AI-powered echocardiography workflow software. <a href="/solutions/cardiology-ai">Explore Horalix CardiologyAI</a> or <a href="/#contact">request a product demo</a>.</p>
      </section>

      <section ${S}="margin-top:32px;border-left:4px solid #2563eb;padding:16px 20px;background:#f8fafc">
        <h2 ${S}="margin:0 0 8px;font-size:20px">What is Horalix?</h2>
        <p data-speakable ${S}="margin:0 0 8px">Horalix is a Europe-first medical software company that builds AI-powered echocardiography workflow software for faster, structured reporting. The platform automates the post-acquisition measurement process: after cardiac ultrasound images are captured, Horalix extracts measurements automatically and produces structured, report-ready outputs. Clinicians review the AI-generated results rather than manually rebuilding the measurement package from scratch.</p>
        <p ${S}="margin:0">Founded in 2024, Horalix operates with a Europe-first posture. As AI-powered echocardiography workflow software, the platform focuses exclusively on echocardiography reporting as its primary clinical category, with expanding modules for pathology and radiology workflows. <a href="/about">Learn about the Horalix team and mission</a>.</p>
      </section>

      <section ${S}="margin-top:40px">
        <h2>Key performance indicators</h2>
        <p>These metrics represent the operational value Horalix delivers to clinical teams. Internal benchmarks are labeled as such and separated from external evidence context.</p>
        <div ${S}="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:16px">
          <article ${S}="border:1px solid #cbd5e1;padding:20px;border-radius:8px">
            <strong ${S}="font-size:32px;color:#2563eb">~10s</strong>
            <p ${S}="margin:8px 0 0;color:#475569">Internal benchmark for full measurement output after echocardiographic image acquisition. This represents observed product performance in controlled conditions.</p>
          </article>
          <article ${S}="border:1px solid #cbd5e1;padding:20px;border-radius:8px">
            <strong ${S}="font-size:32px;color:#2563eb">94%+</strong>
            <p ${S}="margin:8px 0 0;color:#475569">External benchmark context from AI-assisted focused cardiac ultrasound (FoCUS) literature. This is external evidence context, not a direct Horalix product validation claim. <a href="/evidence">View evidence sources</a>.</p>
          </article>
          <article ${S}="border:1px solid #cbd5e1;padding:20px;border-radius:8px">
            <strong ${S}="font-size:32px;color:#2563eb">50+</strong>
            <p ${S}="margin:8px 0 0;color:#475569">Unique cardiac measurements extracted per study, with approximately 80 total structured outputs. Includes chamber dimensions, ejection fraction, valve assessments, and diastolic function parameters.</p>
          </article>
        </div>
      </section>

      <section ${S}="margin-top:40px">
        <h2>How AI-powered echocardiography workflow works</h2>
        <p>Traditional echocardiography workflow creates operational friction after images are captured. Measurement extraction, interpretation support, and report assembly all depend on manual, repetitive work. Horalix changes this by inserting an AI-powered workflow layer between image acquisition and clinical review.</p>
        <ol>
          <li><strong>Image acquisition</strong> — The sonographer captures standard echocardiographic views using existing equipment.</li>
          <li><strong>AI measurement extraction</strong> — Horalix processes DICOM images and automatically extracts over 50 unique cardiac measurements.</li>
          <li><strong>Structured output generation</strong> — The platform produces organized, report-ready measurement packages with approximately 80 total structured outputs.</li>
          <li><strong>Clinician review and sign-off</strong> — The cardiologist reviews AI-generated outputs, makes clinical adjustments, and approves the final report. Clinical judgment remains fully under human control.</li>
        </ol>
        <p>This AI-powered echocardiography workflow compresses the manual post-scan process from minutes of repetitive clicking and data entry into a review-focused process that delivers faster, structured reporting in seconds. <a href="/resources/ai-echocardiography-software">Read the full guide on AI echocardiography software</a>.</p>
      </section>

      <section ${S}="margin-top:40px">
        <h2>Why hospitals choose workflow software over standalone AI models</h2>
        <p>Hospital buyers do not purchase AI because a model looks impressive in isolation. They invest in workflow leverage — tools that reduce manual burden, improve reporting consistency, and integrate with existing clinical operations. Horalix is designed as workflow software, not a standalone AI prediction tool.</p>
        <ul>
          ${hospitalValuePoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
        <p><a href="/resources/echo-workflow-automation-for-hospitals">Read: Echo workflow automation for hospitals</a></p>
      </section>

      <section ${S}="margin-top:40px">
        <h2>Clinical AI solutions from Horalix</h2>
        <p>Horalix builds modular clinical AI workflow products targeting high-friction operational bottlenecks across medical imaging specialties.</p>
        <div ${S}="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px">
          ${defaultSolutions.map((solution) => `
            <article ${S}="border:1px solid #cbd5e1;padding:20px;border-radius:8px">
              <h3 ${S}="margin:0 0 8px"><a href="/solutions/${solution.slug}">${escapeHtml(solution.name)}</a></h3>
              <p ${S}="margin:0 0 8px;font-size:12px;text-transform:uppercase;color:#2563eb">${escapeHtml(solution.badge_text)}</p>
              <p ${S}="margin:0;color:#475569">${escapeHtml(solution.short_description)}</p>
            </article>
          `).join("")}
        </div>
        <p ${S}="margin-top:16px"><a href="/solutions">Explore the full Horalix solution suite</a></p>
      </section>

      <section ${S}="margin-top:40px">
        <h2>Founding team</h2>
        <p>Horalix is led by a multidisciplinary team combining clinical knowledge, software engineering, machine learning research, and healthcare operations.</p>
        <div ${S}="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:16px">
          ${contributors.map((c) => `
            <article ${S}="border:1px solid #cbd5e1;padding:20px;border-radius:8px">
              <h3 ${S}="margin:0 0 4px"><a href="/team/${c.slug}">${escapeHtml(c.name)}</a></h3>
              <p ${S}="margin:0 0 8px;font-size:14px;color:#2563eb">${escapeHtml(c.role)}</p>
              <p ${S}="margin:0;color:#475569;font-size:14px">${escapeHtml(c.bioShort)}</p>
            </article>
          `).join("")}
        </div>
        <p ${S}="margin-top:16px"><a href="/about">Learn about Horalix leadership and company story</a></p>
      </section>

      <section ${S}="margin-top:40px">
        <h2>Authority resources on AI echocardiography</h2>
        <p>Horalix publishes in-depth resources on AI echocardiography workflow, automated reporting, cardiac ultrasound AI, and clinical AI operations. Each resource is authored by a named team member, supported by external evidence citations, and designed to help clinical teams, hospital buyers, and investors understand the category.</p>
        <ul>
          ${resources.slice(0, 5).map((r) => `<li><a href="/resources/${r.slug}">${escapeHtml(r.title)}</a> — ${escapeHtml(r.summary.split(".")[0])}.</li>`).join("")}
        </ul>
        <p><a href="/resources">Browse all ${resources.length} resources</a></p>
      </section>

      <section ${S}="margin-top:40px">
        <h2>Evidence and benchmark transparency</h2>
        <p>Horalix maintains strict separation between internal product benchmarks and external evidence context. Internal benchmarks describe observed product performance only. External benchmark context refers to published, peer-reviewed literature that provides relevant category context — not direct Horalix product validation. This separation is enforced across all content on this site.</p>
        <ul>
          ${benchmarkDisclosures.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
        </ul>
        <p>External evidence sources include <a href="${evidenceSources.S1.url}" rel="noopener">${escapeHtml(evidenceSources.S1.shortLabel)}</a>, <a href="${evidenceSources.S2.url}" rel="noopener">${escapeHtml(evidenceSources.S2.shortLabel)}</a>, and <a href="${evidenceSources.S3.url}" rel="noopener">${escapeHtml(evidenceSources.S3.shortLabel)}</a>.</p>
        <p><a href="/evidence">View full evidence and benchmark disclosures</a></p>
      </section>

      <section ${S}="margin-top:40px">
        <h2>Frequently asked questions about Horalix</h2>
        ${STATIC_FAQ_ITEMS.map((item) => `
          <details ${S}="border:1px solid #e2e8f0;padding:12px 16px;margin-bottom:8px;border-radius:6px">
            <summary ${S}="cursor:pointer;font-weight:600">${escapeHtml(item.question)}</summary>
            <p ${S}="margin:8px 0 0;color:#475569">${escapeHtml(item.answer)}</p>
          </details>
        `).join("")}
      </section>

      <section ${S}="margin-top:40px">
        <h2>Request a demo</h2>
        <p>Horalix offers live product demonstrations for hospitals, echo labs, clinical teams, and investors. See how AI-powered echocardiography workflow software reduces manual measurement burden while keeping clinicians in control.</p>
        <p><strong><a href="/#contact">Contact the Horalix team</a></strong> | Email: <a href="mailto:support@horalix.com">support@horalix.com</a></p>
      </section>

      ${disclaimer}
      ${footerNav("home")}
    `),
    jsonLd: [
      buildOrganizationJsonLd(),
      buildWebSiteJsonLd(),
      buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]),
      buildFAQPageJsonLd(STATIC_FAQ_ITEMS),
      buildSpeakableJsonLd(`${CANONICAL_SITE_URL}/`, ["h1", "h2", "[data-speakable]"]),
    ],
  };
}

function renderSolutionsPage(solutions) {
  return {
    title: "Solutions | Horalix Clinical AI Workflow Software",
    description: "Explore Horalix clinical AI workflow solutions: CardiologyAI for echocardiography, PathologyAI, and RadiologyAI. Modular medical imaging workflow automation.",
    canonicalPath: "/solutions",
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/solutions", label: "Solutions" }])}
      <h1>Horalix Clinical AI Workflow Solutions</h1>
      <p>Horalix builds modular clinical AI workflow products that target high-friction operational bottlenecks in medical imaging. Each solution is designed to reduce manual post-acquisition work, produce structured outputs, and keep clinicians in control of review and final sign-off.</p>
      <p>The primary clinical priority is <a href="/solutions/cardiology-ai">CardiologyAI</a> — AI-assisted echocardiography workflow for faster measurement extraction and report preparation. Additional modules for pathology and radiology workflows are in development.</p>

      <div ${S}="margin-top:24px">
        ${solutions.map((solution) => `
          <article ${S}="border:1px solid #cbd5e1;padding:24px;border-radius:8px;margin-bottom:16px">
            <h2 ${S}="margin:0 0 4px"><a href="/solutions/${solution.slug}">${escapeHtml(solution.name)}</a></h2>
            <p ${S}="margin:0 0 12px;font-size:13px;text-transform:uppercase;color:#2563eb">${escapeHtml(solution.badge_text || "")}</p>
            <p ${S}="margin:0;color:#475569">${escapeHtml(solution.short_description)}</p>
            ${solution.featureList?.length ? `<ul ${S}="margin:12px 0 0">${solution.featureList.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>` : ""}
          </article>
        `).join("")}
      </div>

      <section ${S}="margin-top:32px">
        <h2>How Horalix solutions create operational value</h2>
        <p>Hospital buyers evaluate clinical AI workflow software on operational impact, not isolated model accuracy. Horalix solutions are built to deliver measurable value in these areas:</p>
        <ul>
          ${hospitalValuePoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </section>

      <section ${S}="margin-top:32px">
        <h2>Related resources</h2>
        <ul>
          ${resources.filter((r) => r.topicCluster === "AI echocardiography" || r.topicCluster === "hospital workflow").slice(0, 4).map((r) => `<li><a href="/resources/${r.slug}">${escapeHtml(r.title)}</a></li>`).join("")}
        </ul>
        <p><a href="/resources">Browse all clinical AI resources</a> | <a href="/evidence">Review benchmark disclosures</a> | <a href="/#contact">Schedule a demo</a></p>
      </section>

      ${disclaimer}
      ${footerNav("solutions")}
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
    .slice(0, 4)
    .map((resource) => ({ href: `/resources/${resource.slug}`, label: resource.title }));

  const isCardiology = solution.slug === "cardiology-ai";

  return {
    title: `${solution.name} | Horalix Clinical AI Workflow`,
    description: solution.short_description,
    canonicalPath: `/solutions/${solution.slug}`,
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/solutions", label: "Solutions" }, { href: `/solutions/${solution.slug}`, label: solution.name }])}
      <h1>${escapeHtml(solution.name)} — Horalix Clinical AI</h1>
      <p ${S}="font-size:13px;text-transform:uppercase;color:#2563eb">${escapeHtml(solution.badge_text || "")} | Part of the Horalix Clinical AI Platform</p>
      <p ${S}="font-size:18px;color:#475569">${escapeHtml(solution.short_description)}</p>

      <section ${S}="margin-top:24px">
        <h2>Product overview</h2>
        <p>${escapeHtml(solution.full_description || `${solution.name} is clinical AI workflow software from Horalix. It is designed to reduce manual post-acquisition work, produce structured outputs, and support faster reporting operations while keeping clinicians in full control of interpretation and final sign-off.`)}</p>
        ${isCardiology ? `
          <p>CardiologyAI is the primary module in the Horalix Clinical AI Platform. It focuses exclusively on echocardiography workflow — the process of extracting measurements from cardiac ultrasound images and producing structured reports for clinical review.</p>
        ` : ""}
      </section>

      ${solution.featureList?.length ? `
        <section ${S}="margin-top:24px">
          <h2>Key features</h2>
          <ul>${solution.featureList.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
        </section>
      ` : ""}

      ${isCardiology ? `
        <section ${S}="margin-top:24px">
          <h2>Performance benchmarks</h2>
          <p>CardiologyAI extracts over 50 unique cardiac measurements and produces approximately 80 total structured outputs per echocardiographic study. Internal benchmarks show report-ready output in approximately 10 seconds after image acquisition.</p>
          <p>These are internal benchmarks describing observed product performance. External benchmark context from AI-assisted FoCUS literature provides additional category perspective. <a href="/evidence">View full benchmark disclosures</a>.</p>
        </section>
      ` : ""}

      <section ${S}="margin-top:24px">
        <h2>Who uses ${escapeHtml(solution.name)}</h2>
        <p>This solution is designed for echocardiography labs, cardiology departments, hospital imaging teams, and clinical operations leaders seeking to reduce manual workflow burden while maintaining clinician oversight of reporting.</p>
      </section>

      ${related.length > 0 ? `
        <section ${S}="margin-top:32px">
          <h2>Related resources</h2>
          <ul>${linkList(related)}</ul>
        </section>
      ` : ""}

      <p ${S}="margin-top:24px"><a href="/solutions">View all Horalix solutions</a> | <a href="/resources">Explore clinical AI resources</a> | <a href="/about">Meet the Horalix team</a> | <a href="/#contact">Book a product demo</a></p>

      ${disclaimer}
      ${footerNav("solution-detail")}
    `),
    jsonLd: [
      buildSoftwareApplicationJsonLd(solution),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Solutions", path: "/solutions" },
        { name: solution.name, path: `/solutions/${solution.slug}` },
      ]),
      buildSpeakableJsonLd(`${CANONICAL_SITE_URL}/solutions/${solution.slug}`, ["h1", "h2", "[data-speakable]"]),
    ],
  };
}

function renderResourcesPage() {
  return {
    title: "Resources | AI Echocardiography and Clinical Workflow | Horalix",
    description: "Read Horalix resources on AI echocardiography software, echo workflow automation, automated reporting, cardiac ultrasound AI, and clinical AI operations.",
    canonicalPath: "/resources",
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/resources", label: "Resources" }])}
      <h1>AI Echocardiography and Clinical Workflow Resources</h1>
      <p>Horalix publishes in-depth resources on AI echocardiography workflow, automated reporting, cardiac ultrasound AI, and clinical AI operations. Every resource is authored by a named team member, supported by external evidence citations, and designed to help clinical teams, hospital buyers, and investors understand the operational value of AI-powered workflow software.</p>

      <div ${S}="margin-top:24px">
        ${resources.map((resource) => {
          const author = contributors.find((c) => c.slug === resource.authorSlug);
          return `
            <article ${S}="border:1px solid #cbd5e1;padding:20px;border-radius:8px;margin-bottom:16px">
              <h2 ${S}="margin:0 0 4px"><a href="/resources/${resource.slug}">${escapeHtml(resource.title)}</a></h2>
              <p ${S}="margin:0 0 8px;font-size:13px;color:#64748b">${escapeHtml(resource.heroKicker)} | ${escapeHtml(resource.regionScope)} | By <a href="/team/${resource.authorSlug}">${escapeHtml(author?.name || resource.authorSlug)}</a></p>
              <p ${S}="margin:0;color:#475569">${escapeHtml(resource.summary)}</p>
              ${resource.keyTakeaways?.length ? `<ul ${S}="margin:8px 0 0">${resource.keyTakeaways.map((t) => `<li><strong>${escapeHtml(t.label)}:</strong> ${escapeHtml(t.text)}</li>`).join("")}</ul>` : ""}
            </article>
          `;
        }).join("")}
      </div>

      <section ${S}="margin-top:32px">
        <h2>Topic coverage</h2>
        <p>Resources cover the core clinical AI workflow topics that Horalix operates in:</p>
        <ul>
          <li><strong>AI echocardiography software</strong> — how AI layers change measurement and reporting workflow</li>
          <li><strong>Echo workflow automation</strong> — where operational value comes from for hospitals</li>
          <li><strong>Automated echocardiography reporting</strong> — report readiness and structured outputs</li>
          <li><strong>Cardiac ultrasound AI in Europe</strong> — Europe-first deployment and trust considerations</li>
          <li><strong>Medical imaging AI workflow</strong> — broader category context for clinical AI infrastructure</li>
        </ul>
      </section>

      <p ${S}="margin-top:24px"><a href="/solutions">Explore Horalix workflow solutions</a> | <a href="/evidence">View evidence governance</a> | <a href="/about">About the Horalix company</a> | <a href="/#contact">Talk to Horalix</a></p>

      ${disclaimer}
      ${footerNav("resources")}
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

  // Citation-ready TL;DR block for LLM discoverability
  const tldrHtml = `<section data-speakable ${S}="margin-top:16px;border:2px solid #2563eb;padding:16px 20px;background:#eff6ff;border-radius:8px">
    <p ${S}="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.15em;color:#2563eb;font-weight:700">TL;DR — Citation-Ready Summary</p>
    <p ${S}="margin:0;font-size:15px;line-height:1.6">${escapeHtml(resource.summary)} This resource is part of the Horalix authority content library on ${escapeHtml(resource.primaryKeyword)}. Published by <a href="/team/${resource.authorSlug}">${escapeHtml(author?.name || resource.authorSlug)}</a> at Horalix. For product details, see <a href="/solutions/cardiology-ai">CardiologyAI</a>.</p>
  </section>`;

  const citedClaimsHtml = (resource.citedClaims || []).length > 0
    ? `<section ${S}="margin-top:32px;border-left:4px solid #2563eb;padding:16px 20px;background:#f8fafc;border-radius:0 8px 8px 0">
        <h2 ${S}="margin:0 0 12px;font-size:18px">Evidence context</h2>
        <p ${S}="margin:0 0 8px;font-size:13px;color:#64748b">The following claims reference external evidence sources. See <a href="/evidence">evidence and benchmark disclosures</a> for governance details.</p>
        <ul ${S}="margin:0;padding-left:20px">${resource.citedClaims.map((claim) => `<li>${escapeHtml(claim.text)} [${claim.sourceIds.map((id) => `<a href="${evidenceSources[id]?.url || '/evidence'}" rel="noopener">${id}: ${escapeHtml(evidenceSources[id]?.shortLabel || id)}</a>`).join(", ")}]</li>`).join("")}</ul>
      </section>`
    : "";

  const keyTakeawaysHtml = (resource.keyTakeaways || []).length > 0
    ? `<section ${S}="margin-top:24px;border:1px solid #e2e8f0;padding:16px 20px;background:#fafafa;border-radius:8px">
        <h2 ${S}="margin:0 0 12px;font-size:18px">Key takeaways</h2>
        <ul ${S}="margin:0;padding-left:20px">${resource.keyTakeaways.map((t) => `<li><strong>${escapeHtml(t.label)}:</strong> ${escapeHtml(t.text)}</li>`).join("")}</ul>
      </section>`
    : "";

  const metadataHtml = `<p ${S}="font-size:13px;color:#64748b;margin:8px 0">Published: ${resource.publishedAt || "—"} | Updated: ${resource.updatedAt || "—"} | Audience: ${escapeHtml(resource.audience || "")} | Region: ${escapeHtml(resource.regionScope || "global")}</p>`;

  const solutionLinksHtml = (resource.solutionSlugs || []).length > 0
    ? `<p ${S}="font-size:13px;color:#64748b">Related product: ${resource.solutionSlugs.map((slug) => `<a href="/solutions/${slug}">${escapeHtml(defaultSolutions.find((s) => s.slug === slug)?.name || slug)}</a>`).join(", ")}</p>`
    : "";

  return {
    title: resource.seoTitle,
    description: resource.seoDescription,
    canonicalPath: `/resources/${resource.slug}`,
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/resources", label: "Resources" }, { href: `/resources/${resource.slug}`, label: resource.title }])}
      <article>
        <header>
          <p ${S}="font-size:13px;text-transform:uppercase;color:#2563eb;margin-bottom:4px">${escapeHtml(resource.heroKicker)}</p>
          <h1>${escapeHtml(resource.title)}</h1>
          <p data-speakable ${S}="font-size:18px;color:#475569">${escapeHtml(resource.summary)}</p>
          ${author ? `<p ${S}="margin:8px 0 0">By <a href="/team/${author.slug}">${escapeHtml(author.name)}</a>, ${escapeHtml(author.role)} at Horalix</p>` : ""}
          ${metadataHtml}
          ${solutionLinksHtml}
        </header>

        ${tldrHtml}

        ${keyTakeawaysHtml}

        ${resource.sections
          .map((section) => `
            <section ${S}="margin-top:32px">
              <h2>${escapeHtml(section.title)}</h2>
              ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
              ${(section.bullets || []).length > 0 ? `<ul>${section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
            </section>
          `)
          .join("")}

        ${citedClaimsHtml}

        <section ${S}="margin-top:32px">
          <h2>Related reading</h2>
          <ul>${linkList(related.map((item) => ({ href: `/resources/${item.slug}`, label: item.title })))}</ul>
        </section>

        <section ${S}="margin-top:24px">
          <h2>Next steps</h2>
          <p>Ready to see how Horalix transforms echocardiography workflow? <a href="/#contact">Request a demo</a> or explore the <a href="/solutions/cardiology-ai">CardiologyAI product page</a>.</p>
        </section>
      </article>

      ${disclaimer}
      ${footerNav("resource-" + resource.slug)}
    `),
    jsonLd: [
      buildArticleJsonLd(resource, author?.name || "Horalix", author?.slug || ""),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Resources", path: "/resources" },
        { name: resource.title, path: `/resources/${resource.slug}` },
      ]),
      buildSpeakableJsonLd(`${CANONICAL_SITE_URL}/resources/${resource.slug}`, ["h1", "[data-speakable]"]),
    ],
  };
}

function renderAboutPage() {
  return {
    title: "About Horalix | Clinical AI Infrastructure for Echocardiography",
    description: "Learn about Horalix: the company, founding team, clinical AI philosophy, and Europe-first approach to echocardiography workflow software.",
    canonicalPath: "/about",
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/about", label: "About" }])}
      <h1>About Horalix — Clinical AI Infrastructure Built Around Real Reporting Friction</h1>

      <section ${S}="border-left:4px solid #2563eb;padding:16px 20px;background:#f8fafc;margin:24px 0;border-radius:0 8px 8px 0">
        <h2 ${S}="margin:0 0 8px;font-size:18px">Company overview</h2>
        <p ${S}="margin:0">${escapeHtml(organizationProfile.description)} Founded in 2024, the company operates with a Europe-first posture and builds AI-powered workflow software for echocardiography teams who need faster, more structured reporting operations.</p>
      </section>

      <section ${S}="margin-top:32px">
        <h2>What Horalix builds</h2>
        <p>Horalix builds clinical AI workflow software that compresses the manual post-acquisition process in echocardiography. Instead of manually extracting measurements and assembling reports from scratch after each scan, clinical teams review structured AI-generated outputs. The platform produces over 50 unique cardiac measurements and approximately 80 total structured outputs per study.</p>
        <p>The software is designed to fit inside existing clinical infrastructure, processing standard DICOM echocardiographic images and producing outputs compatible with clinical reporting systems.</p>
      </section>

      <section ${S}="margin-top:32px">
        <h2>Clinical AI philosophy</h2>
        <p>Horalix treats AI as a workflow layer, not a replacement for clinical judgment. Every measurement output is subject to clinician review and sign-off. The company separates internal product benchmarks from external evidence context, and publishes benchmark disclosures openly.</p>
        <p>This approach reflects a core belief: trust in clinical AI comes from transparency, operational clarity, and evidence governance — not from inflated claims or benchmark theater.</p>
        <p><a href="/evidence">View evidence and benchmark disclosures</a></p>
      </section>

      <section ${S}="margin-top:32px">
        <h2>Europe-first operating posture</h2>
        <p>${escapeHtml(organizationProfile.regionFocus)} The company is building partnerships with regional healthcare providers in Europe and pursuing regulatory pathways appropriate for AI-assisted clinical workflow software.</p>
      </section>

      <section ${S}="margin-top:32px">
        <h2>Founding team and leadership</h2>
        <p>Horalix is led by a multidisciplinary team combining clinical knowledge, software engineering, machine learning research, and healthcare operations experience.</p>
        <div ${S}="margin-top:16px">
          ${contributors.map((c) => `
            <article ${S}="border:1px solid #cbd5e1;padding:20px;border-radius:8px;margin-bottom:16px">
              <h3 ${S}="margin:0 0 4px"><a href="/team/${c.slug}">${escapeHtml(c.name)}</a></h3>
              <p ${S}="margin:0 0 4px;font-size:14px;color:#2563eb">${escapeHtml(c.role)}</p>
              <p ${S}="margin:0 0 4px;font-size:13px;color:#64748b">${escapeHtml(c.credentials)} | ${escapeHtml(c.specialty)}</p>
              <p ${S}="margin:0;color:#475569">${escapeHtml(c.bioLong || c.bioShort)}</p>
              <p ${S}="margin:8px 0 0;font-size:13px">Focus: ${c.focusAreas.map((a) => escapeHtml(a)).join(", ")}. ${c.sameAs?.length ? `<a href="${c.sameAs[0]}" rel="noopener">LinkedIn profile</a>` : ""}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section ${S}="margin-top:32px">
        <h2>Product suite</h2>
        <ul>
          ${defaultSolutions.map((s) => `<li><a href="/solutions/${s.slug}">${escapeHtml(s.name)}</a> — ${escapeHtml(s.short_description)}</li>`).join("")}
        </ul>
      </section>

      <p ${S}="margin-top:24px"><a href="/solutions">Horalix product suite</a> | <a href="/resources">Read AI echocardiography guides</a> | <a href="/evidence">Evidence transparency</a> | <a href="/#contact">Contact our team</a> | <a href="https://www.linkedin.com/company/horalix/" rel="noopener">Horalix LinkedIn</a></p>

      ${disclaimer}
      ${footerNav("about")}
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
  const authoredResources = resources.filter((r) => r.authorSlug === contributor.slug);
  const otherMembers = contributors.filter((c) => c.slug !== contributor.slug);

  return {
    title: `${contributor.name} | ${contributor.role} | Horalix`,
    description: contributor.bioShort,
    canonicalPath: `/team/${contributor.slug}`,
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/about", label: "About" }, { href: `/team/${contributor.slug}`, label: contributor.name }])}
      <article>
        <h1>${escapeHtml(contributor.name)}</h1>
        <p ${S}="font-size:18px;color:#2563eb;margin:0 0 4px">${escapeHtml(contributor.role)} at Horalix</p>
        <p ${S}="font-size:14px;color:#64748b;margin:0 0 16px">${escapeHtml(contributor.credentials)} | ${escapeHtml(contributor.specialty)}</p>

        <section>
          <h2>About ${escapeHtml(contributor.name.split(" ")[0])}</h2>
          <p>${escapeHtml(contributor.bioLong || contributor.bioShort)}</p>
        </section>

        <section ${S}="margin-top:24px">
          <h2>Focus areas</h2>
          <ul>${contributor.focusAreas.map((area) => `<li>${escapeHtml(area)}</li>`).join("")}</ul>
        </section>

        ${authoredResources.length > 0 ? `
          <section ${S}="margin-top:24px">
            <h2>Published resources</h2>
            <ul>${authoredResources.map((r) => `<li><a href="/resources/${r.slug}">${escapeHtml(r.title)}</a></li>`).join("")}</ul>
          </section>
        ` : ""}

        ${contributor.sameAs?.length ? `
          <section ${S}="margin-top:24px">
            <h2>External profiles</h2>
            <ul>${contributor.sameAs.map((url) => `<li><a href="${url}" rel="noopener">${url.includes("linkedin") ? "LinkedIn" : escapeHtml(url)}</a></li>`).join("")}</ul>
          </section>
        ` : ""}

        <section ${S}="margin-top:32px">
          <h2>Other team members</h2>
          <ul>${otherMembers.map((c) => `<li><a href="/team/${c.slug}">${escapeHtml(c.name)}</a> — ${escapeHtml(c.role)}</li>`).join("")}</ul>
        </section>
      </article>

      <p ${S}="margin-top:24px"><a href="/about">About the company</a> | <a href="/solutions">Clinical AI products</a> | <a href="/resources">AI echocardiography resources</a> | <a href="/evidence">Benchmark transparency</a> | <a href="/#contact">Contact Horalix team</a></p>

      ${footerNav("team-" + contributor.slug)}
    `),
    jsonLd: [
      buildProfilePageJsonLd(contributor),
      buildPersonJsonLd(contributor),
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
    title: "Evidence and Benchmarks | Horalix Clinical AI",
    description: "Review Horalix benchmark disclosures, evidence governance policy, external evidence sources, and how internal benchmarks are separated from external context.",
    canonicalPath: "/evidence",
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/evidence", label: "Evidence" }])}
      <h1>Evidence and Benchmark Disclosures</h1>
      <p>Horalix maintains a strict separation between internal product benchmarks and external evidence context. This page discloses how Horalix labels, sources, and governs the claims it makes about its clinical AI workflow software.</p>

      <section ${S}="border-left:4px solid #2563eb;padding:16px 20px;background:#f8fafc;margin:24px 0;border-radius:0 8px 8px 0">
        <h2 ${S}="margin:0 0 8px;font-size:18px">Evidence governance policy</h2>
        <p ${S}="margin:0 0 8px">Horalix separates internal product benchmarks from external evidence context. Internal benchmarks describe observed product performance only — they represent what the Horalix team has measured under controlled conditions. External benchmark context refers to published, peer-reviewed literature that provides relevant category information. External benchmarks do not constitute direct Horalix product validation.</p>
        <p ${S}="margin:0">This separation is enforced across all content on horalix.com, including resource pages, solution pages, and marketing materials. When a claim references external literature, the source is cited explicitly.</p>
      </section>

      <section ${S}="margin-top:32px">
        <h2>Disclosure rules</h2>
        <ul>${benchmarkDisclosures.map((disclosure) => `<li>${escapeHtml(disclosure)}</li>`).join("")}</ul>
      </section>

      <section ${S}="margin-top:32px">
        <h2>Internal product benchmarks</h2>
        <p>The following are internal benchmarks observed by the Horalix team:</p>
        <ul>
          <li>Report-ready measurement output in approximately 10 seconds after image acquisition.</li>
          <li>Over 50 unique cardiac measurements extracted per echocardiographic study.</li>
          <li>Approximately 80 total structured outputs per study, including chamber dimensions, ejection fraction, valve assessments, and diastolic function parameters.</li>
        </ul>
        <p>These benchmarks describe observed product performance under controlled conditions and are not externally validated claims.</p>
      </section>

      <section ${S}="margin-top:32px">
        <h2>External evidence sources</h2>
        <p>Horalix references the following published, peer-reviewed sources for external benchmark context:</p>
        <ul>
          ${evidenceSourceOrder.map((sourceId) => `
            <li><strong>${sourceId}:</strong> <a href="${evidenceSources[sourceId].url}" rel="noopener">${escapeHtml(evidenceSources[sourceId].fullLabel)}</a></li>
          `).join("")}
        </ul>
      </section>

      <section ${S}="margin-top:32px">
        <h2>What Horalix does not claim</h2>
        <ul>
          <li>Horalix does not claim to be the best or only AI echocardiography software.</li>
          <li>Horalix does not claim external benchmark results as its own product validation.</li>
          <li>Horalix does not claim to replace clinician judgment or clinical oversight.</li>
          <li>Horalix does not claim regulatory clearance that it has not yet received.</li>
        </ul>
      </section>

      <p ${S}="margin-top:24px"><a href="/resources">Clinical AI knowledge hub</a> | <a href="/solutions">AI workflow products</a> | <a href="/about">Horalix company overview</a> | <a href="/#contact">Speak with Horalix</a></p>

      ${disclaimer}
      ${footerNav("evidence")}
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
    title: "News and Updates | Horalix",
    description: "The latest updates, announcements, milestones, and insights from Horalix — AI-powered echocardiography workflow software.",
    canonicalPath: "/news",
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/news", label: "News" }])}
      <h1>Horalix News and Updates</h1>
      <p>Follow the latest updates, announcements, milestones, and insights from Horalix. The company shares product progress, partnership developments, and participation in healthcare innovation events.</p>

      <div ${S}="margin-top:24px">
        ${newsItems.map((article) => `
          <article ${S}="border:1px solid #cbd5e1;padding:20px;border-radius:8px;margin-bottom:16px">
            <h2 ${S}="margin:0 0 4px"><a href="/news/${article.slug}">${escapeHtml(article.title)}</a></h2>
            <p ${S}="margin:0 0 8px;font-size:13px;color:#64748b">${escapeHtml(article.category || "UPDATE")}${article.display_date ? ` | ${article.display_date}` : ""}${article.location ? ` | ${escapeHtml(article.location)}` : ""}</p>
            <p ${S}="margin:0;color:#475569">${escapeHtml(article.summary || "Company update from Horalix.")}</p>
          </article>
        `).join("")}
      </div>

      <p ${S}="margin-top:24px"><a href="/">Horalix main site</a> | <a href="/solutions">Explore AI solutions</a> | <a href="/resources">Read clinical guides</a> | <a href="/about">About our team</a> | <a href="/#contact">Get a demo</a></p>

      ${footerNav("news")}
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
    title: `${article.title} | Horalix News`,
    description: ((article.summary || `${article.title} — company update from Horalix, AI-powered echocardiography workflow software.`).length > 155
      ? (article.summary || "").slice(0, 152) + "..."
      : article.summary || `${article.title} — company update from Horalix, AI-powered echocardiography workflow software.`),
    canonicalPath: `/news/${article.slug}`,
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/news", label: "News" }, { href: `/news/${article.slug}`, label: article.title }])}
      <article>
        <h1>${escapeHtml(article.title)}</h1>
        <p ${S}="font-size:13px;color:#64748b">${escapeHtml(article.category || "UPDATE")}${article.display_date ? ` | ${article.display_date}` : ""}${article.location ? ` | ${escapeHtml(article.location)}` : ""}</p>
        ${article.summary ? `<p ${S}="font-size:18px;color:#475569">${escapeHtml(article.summary)}</p>` : ""}
        ${paragraphs}
      </article>

      <section ${S}="margin-top:32px">
        <h2>Learn more about Horalix</h2>
        <p>Horalix builds AI-powered echocardiography workflow software for faster, structured reporting. Explore our <a href="/solutions">solutions</a>, read in-depth <a href="/resources">resources on AI echocardiography</a>, or <a href="/#contact">request a demo</a>.</p>
      </section>

      <p ${S}="margin-top:16px"><a href="/news">More Horalix news</a> | <a href="/solutions">See workflow solutions</a> | <a href="/resources">Explore echocardiography resources</a> | <a href="/about">Learn about Horalix</a></p>

      ${footerNav("news-article-" + article.slug)}
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
    title: "Terms and Conditions | Horalix",
    description: "Read the terms and conditions for using Horalix services, including usage policies, privacy practices, and medical disclaimers.",
    canonicalPath: "/terms",
    body: wrap(`
      ${nav([{ href: "/", label: "Home" }, { href: "/terms", label: "Terms" }])}
      <h1>Terms and Conditions</h1>
      <p>These terms govern the use of the Horalix website and services. By accessing horalix.com, you agree to the following terms.</p>

      <section ${S}="margin-top:24px">
        <h2>About Horalix</h2>
        <p>Horalix builds AI-powered clinical workflow software for echocardiography reporting. The software is designed to assist clinical teams with measurement extraction and structured reporting — it does not replace clinical judgment, diagnosis, or treatment decisions.</p>
      </section>

      <section ${S}="margin-top:24px">
        <h2>Medical disclaimer</h2>
        <p>Content on this website is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Horalix software assists clinicians with workflow operations and does not make independent clinical decisions. Always consult qualified healthcare professionals for medical decisions.</p>
      </section>

      <section ${S}="margin-top:24px">
        <h2>Use of information</h2>
        <p>Information published on horalix.com, including resources, evidence disclosures, and product descriptions, is provided for educational and informational purposes. While Horalix strives for accuracy, the company does not warrant that all information is complete, current, or error-free.</p>
      </section>

      <section ${S}="margin-top:24px">
        <h2>Intellectual property</h2>
        <p>All content, trademarks, and intellectual property on this site are owned by Horalix unless otherwise noted. You may reference and link to Horalix content for educational, journalistic, or research purposes with proper attribution.</p>
      </section>

      <section ${S}="margin-top:24px">
        <h2>Contact</h2>
        <p>For questions about these terms, contact <a href="mailto:support@horalix.com">support@horalix.com</a>.</p>
      </section>

      <p ${S}="margin-top:24px"><a href="/">Return to homepage</a> | <a href="/about">About Horalix team</a> | <a href="/solutions">Browse solutions</a> | <a href="/resources">Read clinical AI guides</a> | <a href="/#contact">Contact support</a></p>

      ${footerNav("terms")}
    `),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": "https://horalix.com/terms#webpage",
        name: "Terms and Conditions",
        description: "Terms and conditions for using Horalix services.",
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

// ─── Data loading and generation ─────────────────────────────────────────────

async function loadDynamicData() {
  const config = getSupabaseConfig();

  if (!config) {
    console.warn("[static-pages] Missing Supabase env vars. Using fallback news and solution data.");
    return { solutions: defaultSolutions, newsItems: FALLBACK_NEWS };
  }

  const [solutions, newsItems] = await Promise.allSettled([
    fetchTable(config, "solutions", "slug,name,short_description,full_description,badge_text,featureList", [
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
