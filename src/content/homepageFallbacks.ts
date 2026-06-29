import { contributors, defaultSolutions } from "@/content/authorityData";
import { fallbackNewsArticles } from "@/content/newsFallbackData";

export type HomepageSolution = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string | null;
  icon_name: string;
  specs: Record<string, string>;
  features: string[];
  badge_text: string | null;
  display_order: number;
};

export type HomepageTeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  linkedin_url: string | null;
  display_order: number;
};

export type PublicNewsArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  location: string | null;
  image_urls: string[];
  image_focus: Array<{ x: number; y: number }>;
  display_date: string;
  published_at: string;
  updated_at: string | null;
  keywords?: string[];
};

export type HomepageFAQItem = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

const solutionIconsBySlug: Record<string, string> = {
  "cardiology-ai": "HeartPulse",
  "pathology-ai": "Microscope",
  "radiology-ai": "Scan",
};

const solutionSpecsBySlug: Record<string, Record<string, string>> = {
  "cardiology-ai": {
    Focus: "Echocardiography",
    Outputs: "50+ measurements",
    Workflow: "DICOM-compatible",
  },
  "pathology-ai": {
    Focus: "Pathology review",
    Outputs: "Structured reports",
    Workflow: "Operational throughput",
  },
  "radiology-ai": {
    Focus: "Imaging operations",
    Outputs: "Repeatable workflows",
    Workflow: "Team scalability",
  },
};

const solutionDescriptionsBySlug: Record<string, string> = {
  "cardiology-ai":
    "CardiologyAI supports echocardiography teams by extracting structured measurements from cardiac ultrasound studies and preparing report-ready outputs for clinician review.",
  "pathology-ai":
    "PathologyAI extends the same workflow-first approach into pathology review, helping teams standardize outputs and reduce operational drag.",
  "radiology-ai":
    "RadiologyAI is designed around scalable imaging operations where repeatable reporting support matters across high-volume teams.",
};

const teamPhotosBySlug: Record<string, string> = {
  "kerim-sabic": "/assets/team/kerim.jpg",
  "amr-husain": "/assets/team/amr.jpg",
  "affan-kapidzic": "/assets/team/affan.jpg",
  "neuman-alkhalil": "/assets/team/neuman.jpg",
};

export const homepageSolutionFallbacks: HomepageSolution[] = defaultSolutions.map((solution, index) => ({
  id: `fallback-${solution.slug}`,
  slug: solution.slug,
  name: solution.name,
  short_description: solution.short_description,
  full_description: solutionDescriptionsBySlug[solution.slug] ?? solution.short_description,
  icon_name: solutionIconsBySlug[solution.slug] ?? "Activity",
  specs: solutionSpecsBySlug[solution.slug] ?? {},
  features: solution.featureList ?? [],
  badge_text: solution.badge_text ?? null,
  display_order: index + 1,
}));

export const homepageTeamFallbacks: HomepageTeamMember[] = contributors.map((contributor, index) => ({
  id: `fallback-${contributor.slug}`,
  name: contributor.name,
  role: contributor.role,
  bio: contributor.bioShort,
  photo_url: teamPhotosBySlug[contributor.slug] ?? null,
  linkedin_url: contributor.linkedinUrl ?? contributor.sameAs?.[0] ?? null,
  display_order: index + 1,
}));

export const homepageNewsFallbacks: PublicNewsArticle[] = fallbackNewsArticles;

export const homepageFAQFallbacks: HomepageFAQItem[] = [
  {
    id: "fallback-what-is-horalix",
    question: "What is Horalix?",
    answer:
      "Horalix is AI-powered clinical workflow software that helps echocardiography teams move from manual measurement to faster, more structured reporting. It automates post-acquisition measurement extraction and produces report-ready outputs while keeping clinicians in control of review and sign-off.",
    sort_order: 1,
  },
  {
    id: "fallback-workflow",
    question: "How does Horalix improve echocardiography workflow?",
    answer:
      "Horalix compresses the manual post-scan workload by automatically extracting measurements from echocardiographic images. Instead of manually clicking and entering each parameter, clinicians review structured AI-generated outputs.",
    sort_order: 2,
  },
  {
    id: "fallback-clinicians",
    question: "Is Horalix a replacement for clinicians?",
    answer:
      "No. Horalix is an AI-assisted workflow tool, not a replacement for clinical judgment. Clinicians remain in full control of interpretation, review, and final sign-off.",
    sort_order: 3,
  },
  {
    id: "fallback-evidence",
    question: "What evidence supports Horalix product claims?",
    answer:
      "Horalix separates internal product benchmarks from external evidence context. Internal benchmarks describe observed product performance, while external benchmark context refers to published peer-reviewed literature on AI-assisted echocardiography.",
    sort_order: 4,
  },
  {
    id: "fallback-systems",
    question: "Does Horalix integrate with existing hospital systems?",
    answer:
      "Horalix is designed for DICOM-compatible workflow integration, fitting into existing echocardiography lab infrastructure and producing structured outputs compatible with clinical reporting systems.",
    sort_order: 5,
  },
];

export const getFallbackSolutionBySlug = (slug?: string): HomepageSolution | null =>
  homepageSolutionFallbacks.find((solution) => solution.slug === slug) ?? null;

export const getFallbackNewsArticleBySlug = (slug?: string): PublicNewsArticle | null =>
  homepageNewsFallbacks.find((article) => article.slug === slug) ?? null;

export const mergeNewsArticleWithFallback = (article: PublicNewsArticle): PublicNewsArticle => {
  const fallback = getFallbackNewsArticleBySlug(article.slug);
  if (!fallback) return article;

  return {
    ...article,
    title: fallback.title,
    summary: fallback.summary,
    content: fallback.content,
    category: fallback.category,
    location: fallback.location,
    image_urls: fallback.image_urls,
    image_focus: fallback.image_focus,
    keywords: fallback.keywords,
    display_date: article.display_date || fallback.display_date,
    published_at: article.published_at || fallback.published_at,
    updated_at: article.updated_at ?? fallback.updated_at,
  };
};
