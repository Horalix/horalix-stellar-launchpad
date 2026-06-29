import { contributors, defaultSolutions } from "@/content/authorityData";

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

export const homepageNewsFallbacks: PublicNewsArticle[] = [
  {
    id: "fallback-clinic-validation-in-sarajevo-poliklinika-dr-nabil",
    slug: "clinic-validation-in-sarajevo-poliklinika-dr-nabil",
    title: "Clinic Validation in Sarajevo, Poliklinika Dr Nabil",
    summary:
      "We tested Horalix in a real cardiology workflow at Poliklinika Dr Nabil in Sarajevo, ran echocardiography DICOM files through our platform, and got direct clinician validation and practical feedback for what to build next.",
    content:
      "Some days feel like a product milestone, not because of a press release, but because a real clinician looks at your output and says it makes sense.\n\nRecently, we spent a day at Poliklinika Dr Nabil in Sarajevo, Bosnia and Herzegovina, running Horalix in a real cardiology workflow using echocardiography DICOM inputs and comparing results to clinical review. The clinic is led by Prof. dr. sci. med. Nabil Naser, specialist in internal medicine and cardiology, and founder of Poliklinika Dr Nabil.\n\nThis visit happened because Nedim Dzaferovic reached out and wanted to see the system in action in a real setting. We scheduled a clinic session, made sure everything was ready, and focused on the part that matters most: verification.\n\nThe most valuable moment came after the numbers appeared. Prof. dr. Nabil and the team compared outputs against their clinical review and gave us direct feedback on what felt aligned, what could be improved, and what would genuinely help doctors inside the workflow.\n\nWe left that day with clinical validation, practical product direction from experienced cardiology leadership, and momentum. If you are a cardiologist, imaging lead, clinic director, or health tech partner in the region, we would love to talk through a demo or pilot.",
    category: "NEWS",
    location: null,
    image_urls: [
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1769802326425-r9xdyy4.png",
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1769802350501-748z6ya.jpeg",
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1769802356686-rol1bwb.jpeg",
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1769802361480-gj8h0nb.jpeg",
    ],
    image_focus: [
      { x: 50, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 50 },
    ],
    display_date: "2026-01-30T00:00:00+00:00",
    published_at: "2026-01-30T19:46:06.959+00:00",
    updated_at: "2026-01-30T19:46:07.224207+00:00",
  },
  {
    id: "fallback-horalix-at-fls",
    slug: "horalix-at-fls",
    title: "Horalix at Future Leaders Summit 2025!",
    summary:
      "Three days, one booth, and dozens of sharp conversations. FLS 2025 reminded us why building in Bosnia and Herzegovina feels exciting again.",
    content:
      "In December 2025, Sarajevo felt loud in the best way.\n\nFrom December 19-21 at Hotel Hills, the Future Leaders Summit brought together students, young professionals, diaspora voices, and people from the public and private sectors to talk about leadership, social change, and collective action. Horalix showed up with one simple plan: be present, be useful, and have real conversations.\n\nWe had a booth, which became the starting point for spontaneous ideas. Small talk quickly turned into conversations about healthcare, innovation, and what it takes to build serious products in Bosnia and Herzegovina.\n\nFLS pulled together different worlds without making it feel chaotic: science, medicine, entrepreneurship, civic leadership, youth activism, and career paths. The message was clear: communities move forward when capable people meet, learn, and decide to do something.\n\nWe left FLS 2025 with a full notebook, new contacts we are excited to follow up with, and the best post-event feeling you can get: next.",
    category: "NEWS",
    location: "Sarajevo, BA",
    image_urls: [
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1768326134417-hgi9qv6.jpeg",
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1768326133724-pj422xm.jpeg",
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1768326163696-tcfuex7.jpg",
    ],
    image_focus: [
      { x: 66, y: 100 },
      { x: 58, y: 64 },
      { x: 61, y: 72 },
    ],
    display_date: "2025-12-21T00:00:00+00:00",
    published_at: "2026-01-23T14:43:49.923+00:00",
    updated_at: "2026-01-23T14:43:50.417647+00:00",
  },
  {
    id: "fallback-demo-day",
    slug: "demo-day",
    title: "Techstars Demo Day",
    summary:
      "We pitched Horalix on Techstars Demo Day to a global audience of investors, and somehow made Zoom feel like a real stage.",
    content:
      "Techstars Demo Day is the kind of event where time behaves strangely.\n\nOne minute you are triple checking slides, audio, camera lighting, and whether your laptop is ready. The next minute, you are live, pitching Horalix to more than 100 investors joining from around the world.\n\nThe pitch went really well, and it drilled one lesson into our heads: clarity wins. If your story is sharp, your problem is concrete, and your why-now is obvious, the momentum carries you.\n\nWe shared the moment with Admir Demir from VoltiumAI and Lejla Zaciragic Eminovic from STIOKids. Pitching side by side made the whole day feel lighter, more human, and more memorable.\n\nTechstars Demo Day left us proud of how far we have come and very motivated for what comes next.",
    category: "NEWS",
    location: "Sarajevo, BA",
    image_urls: [
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1768359590853-a2pmacb.jpg",
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1768359563551-7i92zc2.png",
    ],
    image_focus: [
      { x: 57, y: 61 },
      { x: 57, y: 46 },
    ],
    display_date: "2025-12-18T00:00:00+00:00",
    published_at: "2026-01-23T14:46:10.497+00:00",
    updated_at: "2026-01-23T14:46:11.171241+00:00",
  },
  {
    id: "fallback-the-beginning",
    slug: "the-beginning",
    title: "The Beginning, Why We Built Horalix",
    summary:
      "Horalix started with a stubborn idea: clinical AI should feel like a calm assistant inside the workflow, not another noisy dashboard.",
    content:
      "Horalix started the way a lot of useful products start, with one frustrating moment that refused to leave.\n\nEchocardiography is one of the most information-rich tests in medicine. It is fast, visual, and incredibly valuable. Yet the workflow around it can feel like a puzzle made of clips, measurements, rechecks, and constant context switching.\n\nInstead of chasing a long list of AI features, we focused on the experience of clinical review. We asked a simple question: what if AI did not add another tool to manage, but made the existing workflow smoother and clearer?\n\nHoralix is built around the idea that trust comes from transparency. A single number is never the whole story. The story is the evidence, the frames, the context, and the ability to confirm what the system is suggesting.\n\nThis is just the beginning, but the direction is clear: build clinical decision support that respects real workflows, supports verification, and feels practical in deployment.",
    category: "NEWS",
    location: "Sarajevo, BA",
    image_urls: [
      "https://yyzrwjocniepskofoehu.supabase.co/storage/v1/object/public/news-images/1768326091158-yx07xab.png",
    ],
    image_focus: [{ x: 50, y: 50 }],
    display_date: "2024-08-01T00:00:00+00:00",
    published_at: "2026-01-23T14:50:05.711+00:00",
    updated_at: "2026-01-23T14:50:06.319143+00:00",
  },
];

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
