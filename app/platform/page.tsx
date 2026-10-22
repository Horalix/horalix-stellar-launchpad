import Link from "../_components/ReliableLink";
import Image from "next/image";
import { ProductFrame } from "../_components/ProductFrame";
import { Arrow, MetricRow, PageIntro, SplitCta } from "../_components/SiteChrome";
import { WorkflowRail } from "../_components/WorkflowRail";
import { pageMetadata } from "../_data/metadata";
import { imageNode, screenshot, screenshots } from "../_data/product";

const description = "Explore Horalix: a DICOM echocardiography workflow for structured measurements, contextual overlays, and clinician-controlled review.";
export const metadata = pageMetadata({ title: "AI Echocardiography Workflow Platform", description, path: "/platform" });

const questions = [
  { question: "What is Horalix?", answer: "Horalix is a pilot-stage, AI-assisted echocardiography workflow designed to prepare structured measurements, contextual overlays, and report-ready outputs from DICOM studies for clinician review." },
  { question: "Does Horalix diagnose without clinician review?", answer: "No. Horalix is not presented as independently diagnostic. The intended workflow keeps the clinician responsible for inspecting, adjusting, accepting, or rejecting suggestions before sign-off." },
  { question: "How does Horalix connect to an echo workflow?", answer: "Pilot scoping maps DICOM study intake, eligible-study routing, review, export, access, and failure handling against the hospital’s actual environment before deployment." },
  { question: "What is Horalix’s current regulatory status?", answer: "Horalix is pilot-stage and pre-clearance. This website does not claim regulatory clearance or routine clinical use." },
];

const platformGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://horalix.com/platform#software",
      name: "Horalix",
      applicationCategory: "HealthApplication",
      applicationSubCategory: "Echocardiography workflow software",
      operatingSystem: "Web",
      inLanguage: "en",
      description: "Pilot-stage AI-assisted echocardiography workflow for clinician review.",
      audience: { "@type": "MedicalAudience", audienceType: "Clinicians and hospital decision-makers" },
      publisher: { "@id": "https://horalix.com/#organization" },
      url: "https://horalix.com/platform",
      // Real interface captures. A product entity with no screenshot is weakly evidenced.
      screenshot: screenshots.map((shot) => ({ "@id": `https://horalix.com/platform#${shot.id}` })),
      featureList: [
        "DICOM echocardiography study intake with visible processing status",
        "AI-assisted measurement overlays anchored to their source view",
        "Left-ventricle segmentation with structured measurement output",
        "Clinician review with per-measurement edit, accept, and reject",
      ],
      offers: { "@type": "Offer", availability: "https://schema.org/LimitedAvailability" },
    },
    ...screenshots.map((shot) => imageNode(shot.id)),
    {
      "@type": "HowTo",
      "@id": "https://horalix.com/platform#workflow",
      name: "How the Horalix echocardiography workflow runs",
      description: "The three stages between a completed echocardiography study and a clinician-signed report.",
      totalTime: "PT10S",
      step: screenshots.map((shot, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: shot.caption.split("—")[0].trim(),
        text: shot.description,
        image: { "@id": `https://horalix.com/platform#${shot.id}` },
        url: `https://horalix.com/platform#step-${index + 1}`,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": "https://horalix.com/platform#questions",
      mainEntity: questions.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

/** Real interface capture in a neutral frame, so the app's own chrome reads as software. */
function ProductShot({ id }: { id: string }) {
  const shot = screenshot(id);
  return (
    <figure className="product-shot">
      <div className="product-shot-frame">
        <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(max-width: 900px) 100vw, 55vw" />
      </div>
      <figcaption>{shot.caption}</figcaption>
    </figure>
  );
}

export default function Platform() {
  return <>
    <PageIntro breadcrumb="Platform" path="/platform" eyebrow="The Horalix platform" title="Shorten the time from scan to signed report." copy="Horalix prepares structured measurements and overlays from DICOM echocardiography studies, then keeps the clinician in control of every review decision." actions={<><Link className="button button-light" href="/for-hospitals#request">Request hospital demo <Arrow /></Link><Link className="button button-ghost" href="/product-tour">Watch product tour</Link></>} />
    <section className="section-tight shell hero-product"><ProductFrame /></section>
    <MetricRow path="/platform" eyebrow="Current pilot build" heading="What one study gives a clinician before they open it." />
    {/* The map, before the three deep-dives below it. */}
    <WorkflowRail />
    <section className="section-tight shell"><div className="feature-stack">
      <article className="feature-block" id="step-1"><div className="feature-copy"><p className="eyebrow">01 · Study intake</p><h2>Meet the study where the workflow begins.</h2><p>Eligible DICOM echocardiography studies arrive with their identifier, acquisition date, and processing state visible, so the lab can see what is prepared and what is not.</p><ul className="feature-list"><li>Scoped DICOM workflow</li><li>Eligible-study routing</li><li>Visible unsupported-study handling</li></ul></div><ProductShot id="study-list" /></article>
      <article className="feature-block" id="step-2"><div className="feature-copy"><p className="eyebrow">02 · AI assistance</p><h2>Organize outputs around the image.</h2><p>Measurements are drawn on the study itself and can be toggled one by one, so a reviewer judges each value against the anatomy that produced it rather than a number in a table.</p><ul className="feature-list"><li>View-linked measurements</li><li>Per-measurement overlay control</li><li>The source DICOM is never modified</li></ul></div><ProductShot id="ai-overlay" /></article>
      <article className="feature-block" id="step-3"><div className="feature-copy"><p className="eyebrow">03 · Clinician review</p><h2>Make disagreement easy.</h2><p>Segmentation sits beside the full structured measurement set — keypoint values, valves, left ventricle, atria — each one editable before anything is signed.</p><ul className="feature-list"><li>Explicit review status</li><li>Editable suggestions</li><li>Clinician sign-off retained</li></ul></div><ProductShot id="measurements" /></article>
    </div></section>
    <section className="quote-band"><div className="shell"><blockquote>Designed to reduce repetitive preparation—not the clinician’s responsibility to interpret the study.</blockquote></div></section>
    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">Product status</p><h2>Know what is established before you deploy it.</h2></div><p className="lede">Horalix is pilot-stage and pre-clearance. It is not presented as independently diagnostic or cleared for routine clinical use.</p></div><div className="metricless-grid"><div className="metricless-card"><b>Scope</b><p>Echo-first product development keeps the workflow and evidence boundary clear.</p></div><div className="metricless-card"><b>Validation</b><p>Product claims are separated from field literature and tied to a version.</p></div><div className="metricless-card"><b>Oversight</b><p>Outputs require review and clinician sign-off.</p></div></div></section>
    <section className="section section-line shell"><div className="section-heading"><div><p className="eyebrow">Direct answers</p><h2>What clinical teams ask first.</h2></div><p className="lede">Clear answers for clinicians and hospital evaluators, using the same product boundaries on every page and in every conversation.</p></div><dl className="answer-grid">{questions.map(({ question, answer }) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl></section>
    <SplitCta /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(platformGraph) }} />
  </>;
}
