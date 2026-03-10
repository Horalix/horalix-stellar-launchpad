/**
 * Schema builders for generate-static-pages.mjs
 * Plain JavaScript mirror of src/lib/structuredData.ts
 * Used by the build pipeline which cannot import TypeScript.
 */

const CANONICAL_SITE_URL = "https://horalix.com";

const absoluteUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${CANONICAL_SITE_URL}${normalizedPath}`;
};

const buildBreadcrumbJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: typeof item.url === "string" ? item.url : absoluteUrl(item.path),
  })),
});

const buildOrganizationJsonLd = () => ({
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
    "Horalix builds AI-powered clinical workflow software for faster, more structured echocardiography reporting.",
  slogan: "Building the future of clinical AI infrastructure.",
  foundingDate: "2024",
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

const buildWebSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${CANONICAL_SITE_URL}/#website`,
  name: "Horalix",
  url: `${CANONICAL_SITE_URL}/`,
  inLanguage: "en",
  publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
});

const buildPersonJsonLd = (contributor) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": absoluteUrl(`/team/${contributor.slug}#person`),
  name: contributor.name,
  jobTitle: contributor.role,
  description: contributor.bioLong,
  url: absoluteUrl(`/team/${contributor.slug}`),
  worksFor: { "@id": `${CANONICAL_SITE_URL}/#organization` },
  knowsAbout: contributor.focusAreas || [],
  sameAs: contributor.sameAs || [],
});

const buildArticleJsonLd = (resource, authorName, authorSlug) => ({
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

const buildCollectionWithItemsJsonLd = (name, description, path, items) => ({
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
      url: item.url || absoluteUrl(item.path),
      ...(item.description ? { description: item.description } : {}),
    })),
  },
});

const buildSoftwareApplicationJsonLd = (solution) => ({
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

const buildProfilePageJsonLd = (contributor) => ({
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
    knowsAbout: contributor.focusAreas || [],
    sameAs: contributor.sameAs || [],
  },
});

const buildNewsArticleJsonLd = (article) => {
  const datePublished = article.display_date || article.published_at || new Date().toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": absoluteUrl(`/news/${article.slug}#article`),
    headline: article.title,
    description: article.summary || "",
    datePublished,
    ...(article.updated_at ? { dateModified: article.updated_at } : {}),
    ...(article.image_urls?.length ? { image: article.image_urls } : {}),
    url: absoluteUrl(`/news/${article.slug}`),
    author: {
      "@type": "Organization",
      "@id": `${CANONICAL_SITE_URL}/#organization`,
      name: "Horalix",
      url: `${CANONICAL_SITE_URL}/`,
    },
    publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
  };
};

const buildFAQPageJsonLd = (faqItems) => ({
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

export {
  absoluteUrl,
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
};
