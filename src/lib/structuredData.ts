import { CANONICAL_SITE_URL } from "@/lib/canonical";

// ─── Types ────────────────────────────────────────────────────────────────────

type BreadcrumbItem = {
  name: string;
  path: string;
};

type ContributorInput = {
  name: string;
  role: string;
  bioLong: string;
  slug: string;
  focusAreas: string[];
  sameAs: string[];
};

type ResourceInput = {
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  slug: string;
};

type SolutionInput = {
  name: string;
  slug: string;
  short_description: string;
  icon_name?: string;
  featureList?: string[];
  screenshot?: string;
};

type CollectionItem = {
  name: string;
  url?: string;
  path?: string;
  description?: string;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

export const absoluteUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${CANONICAL_SITE_URL}${normalizedPath}`;
};

// ─── Schema Builders ──────────────────────────────────────────────────────────

export const buildBreadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

// [SEO] Full Organization with @id, contactPoint, logo as ImageObject
export const buildOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${CANONICAL_SITE_URL}/#organization`,
  name: "Horalix",
  alternateName: "Horalix Clinical AI",
  url: `${CANONICAL_SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    "@id": `${CANONICAL_SITE_URL}/#logo`,
    url: `${CANONICAL_SITE_URL}/assets/horalix-logo-white.png`,
    contentUrl: `${CANONICAL_SITE_URL}/assets/horalix-logo-white.png`,
  },
  description:
    "Horalix is a Sarajevo-based (Bosnia and Herzegovina) medical-AI company building automated echocardiography analysis. Its CardiologyAI module extracts 50+ structured measurements from cardiac ultrasound for faster, DICOM-compatible clinician review.",
  slogan: "Building the future of clinical AI infrastructure.",
  foundingDate: "2024",
  // [ENTITY] HQ makes Horalix resolvable as a Sarajevo/Bosnia entity for the
  // Knowledge Graph + LLMs (the "best AI startup Bosnia" query ring).
  foundingLocation: {
    "@type": "Place",
    name: "Sarajevo, Bosnia and Herzegovina",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sarajevo",
    addressCountry: "BA",
  },
  areaServed: "Europe",
  industry: "Medical Software",
  numberOfEmployees: { "@type": "QuantitativeValue", minValue: 2, maxValue: 10 },
  knowsAbout: [
    "AI echocardiography",
    "Cardiac ultrasound AI",
    "Automated echocardiography reporting",
    "Clinical workflow automation",
    "Medical imaging AI",
    "DICOM integration",
    "Structured clinical reporting",
  ],
  sameAs: ["https://www.linkedin.com/company/horalix/"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: "support@horalix.com",
    telephone: "+387-62-340-020",
    areaServed: "Europe",
  },
});

// [SEO] WebSite with @id and publisher reference
export const buildWebSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${CANONICAL_SITE_URL}/#website`,
  name: "Horalix",
  url: `${CANONICAL_SITE_URL}/`,
  inLanguage: "en",
  publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
});

// [SEO][E-E-A-T] Person with @id, worksFor reference, knowsAbout
export const buildPersonJsonLd = (contributor: ContributorInput) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": absoluteUrl(`/team/${contributor.slug}#person`),
  name: contributor.name,
  jobTitle: contributor.role,
  description: contributor.bioLong,
  url: absoluteUrl(`/team/${contributor.slug}`),
  worksFor: { "@id": `${CANONICAL_SITE_URL}/#organization` },
  knowsAbout: contributor.focusAreas,
  sameAs: contributor.sameAs,
});

// [SEO] Article with @id, author as Person reference, publisher reference
export const buildArticleJsonLd = (
  resource: ResourceInput,
  authorName: string,
  authorSlug: string,
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": absoluteUrl(`/resources/${resource.slug}#article`),
  headline: resource.title,
  description: resource.summary,
  datePublished: resource.publishedAt,
  dateModified: resource.updatedAt,
  url: absoluteUrl(`/resources/${resource.slug}`),
  inLanguage: "en",
  author: {
    "@type": "Person",
    "@id": absoluteUrl(`/team/${authorSlug}#person`),
    name: authorName,
    url: absoluteUrl(`/team/${authorSlug}`),
  },
  publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
  isPartOf: { "@id": absoluteUrl("/resources#collection") },
});

// [SEO] CollectionPage with ItemList enumeration for rich results
export const buildCollectionWithItemsJsonLd = (
  name: string,
  description: string,
  path: string,
  items: CollectionItem[],
) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": absoluteUrl(`${path}#collection`),
  name,
  description,
  url: absoluteUrl(path),
  publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url || absoluteUrl(item.path || "/"),
      ...(item.description ? { description: item.description } : {}),
    })),
  },
});

// [SEO] SoftwareApplication for solution detail pages
export const buildSoftwareApplicationJsonLd = (solution: SolutionInput) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": absoluteUrl(`/solutions/${solution.slug}#software`),
  name: solution.name,
  description: solution.short_description,
  url: absoluteUrl(`/solutions/${solution.slug}`),
  applicationCategory: "HealthApplication",
  applicationSubCategory: "Medical Imaging Software",
  operatingSystem: "Web",
  applicationSuite: "Horalix Clinical AI Platform",
  ...(solution.featureList?.length ? { featureList: solution.featureList.join(", ") } : {}),
  ...(solution.screenshot ? { screenshot: solution.screenshot } : {}),
  publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
});

// [SEO] ProfilePage for team member detail pages
export const buildProfilePageJsonLd = (contributor: ContributorInput) => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": absoluteUrl(`/team/${contributor.slug}#profile`),
  url: absoluteUrl(`/team/${contributor.slug}`),
  description: contributor.bioLong,
  mainEntity: {
    "@type": "Person",
    "@id": absoluteUrl(`/team/${contributor.slug}#person`),
    name: contributor.name,
    jobTitle: contributor.role,
    description: contributor.bioLong,
    url: absoluteUrl(`/team/${contributor.slug}`),
    worksFor: { "@id": `${CANONICAL_SITE_URL}/#organization` },
    knowsAbout: contributor.focusAreas,
    sameAs: contributor.sameAs,
  },
});

// [SEO] NewsArticle schema
export const buildNewsArticleJsonLd = (article: {
  title: string;
  summary: string;
  slug: string;
  category?: string;
  published_at?: string;
  display_date?: string;
  updated_at?: string;
  image_urls?: string[];
  keywords?: string[];
  authorName?: string;
  authorSlug?: string;
}) => {
  const datePublished = article.display_date ?? article.published_at ?? new Date().toISOString();
  const keywords = article.keywords?.length
    ? article.keywords
    : [
        "Horalix",
        "AI echocardiography",
        "clinical AI",
        "cardiac ultrasound AI",
        "medical imaging workflow",
      ];
  const author =
    article.authorName && article.authorSlug
      ? {
          "@type": "Person" as const,
          "@id": absoluteUrl(`/team/${article.authorSlug}#person`),
          name: article.authorName,
          url: absoluteUrl(`/team/${article.authorSlug}`),
        }
      : {
          "@type": "Organization" as const,
          "@id": `${CANONICAL_SITE_URL}/#organization`,
          name: "Horalix",
          url: `${CANONICAL_SITE_URL}/`,
        };

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": absoluteUrl(`/news/${article.slug}#article`),
    headline: article.title,
    description: article.summary,
    datePublished,
    ...(article.updated_at ? { dateModified: article.updated_at } : {}),
    ...(article.image_urls?.length ? { image: article.image_urls } : {}),
    articleSection: article.category || "News",
    keywords: keywords.join(", "),
    url: absoluteUrl(`/news/${article.slug}`),
    mainEntityOfPage: { "@id": absoluteUrl(`/news/${article.slug}#webpage`) },
    about: keywords.map((keyword) => ({
      "@type": "Thing",
      name: keyword,
    })),
    isPartOf: { "@id": absoluteUrl("/news#collection") },
    inLanguage: "en",
    author,
    publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
  };
};

// [AEO] FAQPage — wins featured snippets / "People also ask" / AI Overviews.
// Mirror of buildFAQPageJsonLd in scripts/schemaBuilders.js — keep in sync.
export const buildFAQPageJsonLd = (
  faqItems: Array<{ question: string; answer: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const buildSpeakableJsonLd = (
  url: string,
  cssSelectors: string[] = ["h1", "h2", "[data-speakable]"],
) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${url}#webpage`,
  url,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: cssSelectors,
  },
});
