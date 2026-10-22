export type NewsItem = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  published: string;
  displayDate: string;
  image?: string;
  imageAlt?: string;
  status: string;
  paragraphs: string[];
  sources: { label: string; href: string }[];
  disclosure: string;
};

export const newsItems: NewsItem[] = [
  {
    slug: "maribor-hospital-pilot-ai-echocardiography-workflow",
    label: "Clinical collaboration",
    title: "Horalix begins an AI-assisted echocardiography workflow pilot with UKC Maribor",
    summary: "A scoped evaluation of Horalix inside a real echocardiography workflow under physician supervision.",
    published: "2026-06-19",
    displayDate: "19 June 2026",
    // Image withheld: /proof/ukc-maribor.webp is truncated in the repository and fails to
    // decode, so the card falls back to the brand graphic until an intact file is committed.
    status: "Company-confirmed active pilot collaboration",
    paragraphs: [
      "Horalix began a pilot collaboration with University Medical Centre Maribor to evaluate how its AI-assisted echocardiography workflow fits into real clinical review.",
      "The work is designed around physician supervision: suggested measurements and structured outputs remain subject to inspection, adjustment, rejection, and final clinician sign-off.",
      "This announcement describes an evaluation relationship. It does not report completed validation results and does not change Horalix’s pilot-stage, pre-clearance status.",
    ],
    sources: [{ label: "University Medical Centre Maribor", href: "https://www.ukc-mb.si/" }],
    disclosure: "Pilot collaboration does not imply regulatory clearance, completed clinical validation, or routine clinical use.",
  },
  {
    slug: "clinic-validation-in-sarajevo-poliklinika-dr-nabil",
    label: "Clinical collaboration",
    title: "Horalix evaluates its AI-assisted echocardiography workflow at Poliklinika Dr Nabil",
    summary: "A supervised Sarajevo evaluation focused on workflow fit and clinician review.",
    published: "2026-01-30",
    displayDate: "30 January 2026",
    // Image withheld: /proof/dr-nabil.webp is truncated in the repository and fails to decode.
    status: "Company-confirmed active pilot collaboration",
    paragraphs: [
      "Horalix is working with Poliklinika Dr Nabil in Sarajevo to evaluate its echo-first clinical-AI workflow in a supervised clinical setting.",
      "The collaboration examines practical workflow questions: study handling, review context, clinician control, and the operational conditions needed for responsible use.",
      "No performance outcome is claimed on this page. Evidence will be published only with its method, sample, product version, limitations, and review status.",
    ],
    sources: [{ label: "Poliklinika Dr Nabil", href: "https://www.nabil.ba/" }],
    disclosure: "Evaluation activity does not imply regulatory clearance, completed clinical validation, or routine clinical use.",
  },
  {
    slug: "horalix-nvidia-inception",
    label: "Company milestone",
    title: "Horalix joins NVIDIA Inception",
    summary: "Horalix is now a member of NVIDIA’s startup-support program for companies building with AI.",
    published: "2026-07-16",
    displayDate: "16 July 2026",
    status: "Verified program membership",
    paragraphs: [
      "Horalix has been accepted into NVIDIA Inception, a program designed to support startups developing technology with artificial intelligence.",
      "For Horalix, membership provides access to a broader technology ecosystem while the company continues to focus on echo workflow, clinical oversight, and evidence-led hospital evaluation.",
      "NVIDIA Inception membership is not an investment, product certification, clinical endorsement, regulatory designation, or validation result.",
    ],
    sources: [
      { label: "NVIDIA Inception", href: "https://www.nvidia.com/en-us/startups/" },
      { label: "Klix report", href: "https://www.klix.ba/biznis/startupi/dva-bh-startupa-primljena-u-prestizni-nvidia-program-za-umjetnu-inteligenciju/260716029" },
    ],
    disclosure: "Program membership does not imply investment, certification, endorsement, or clinical validation.",
  },
  {
    slug: "techstars-sarajevo-founder-catalyst",
    label: "Company milestone",
    title: "Horalix selected for Techstars Sarajevo Founder Catalyst",
    summary: "Horalix joined the Fall 2025 cohort of the first Techstars Sarajevo Startup Community Partnership Founder Catalyst program.",
    published: "2025-10-01",
    displayDate: "1 October 2025",
    status: "Verified cohort participation",
    paragraphs: [
      "Techstars listed Horalix among the startups selected for the Fall 2025 Sarajevo Founder Catalyst cohort.",
      "The founder-development program connected the Sarajevo startup community with mentorship, network access, and company-building support.",
      "We name the program precisely: Founder Catalyst participation is not a claim of Techstars investment, clinical validation, or regulatory endorsement.",
    ],
    sources: [{ label: "Techstars official cohort announcement", href: "https://www.techstars.com/blog/program-news/techstars-launches-first-startup-community-partnership-founder-catalyst" }],
    disclosure: "Program participation does not imply investment, product endorsement, or clinical validation.",
  },
];

export function getNewsItem(slug: string) { return newsItems.find((item) => item.slug === slug); }
