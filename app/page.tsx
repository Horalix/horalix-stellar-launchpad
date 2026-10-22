import Image from "next/image";
import Link from "./_components/ReliableLink";
import { ProductFrame } from "./_components/ProductFrame";
import { Arrow, MetricRow, SplitCta } from "./_components/SiteChrome";
import { ProgramLogoRow } from "./_components/ProgramLogos";
import { BenefitGrid } from "./_components/BenefitGrid";
import { approvedClaim } from "./_data/claims";
import { getResource } from "./_data/resources";
import { team } from "./_data/team";

// Three entry points into the library, one per buyer question: what is it, does it fit, is it governed.
const featuredResources = ["ai-echocardiography-software-guide", "echo-reporting-burden", "clinical-ai-procurement-checklist"]
  .map((slug) => getResource(slug))
  .filter((item) => item !== undefined);

const faq = [
  {
    question: "What is Horalix?",
    answer: "Horalix is a Sarajevo-based medical-AI startup developing an AI-assisted echocardiography workflow that prepares structured measurements and report-ready outputs for clinician review.",
  },
  {
    question: "Does Horalix replace the cardiologist?",
    answer: "No. Horalix is designed to assist preparation. Clinicians inspect, edit, accept, or reject suggestions and retain final review and sign-off.",
  },
  {
    question: "Is Horalix cleared for independent diagnosis?",
    answer: "No. Horalix is pilot-stage and pre-clearance. It is not presented as an independent diagnostic system or as approved for routine clinical use.",
  },
];

const homePageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://horalix.com/#home",
      url: "https://horalix.com/",
      name: "Horalix — Sarajevo medical AI for echocardiography workflow",
      description: "Horalix is a Sarajevo medical-AI startup building an AI-assisted echocardiography workflow for clinician review.",
      inLanguage: "en",
      isPartOf: { "@id": "https://horalix.com/#website" },
      about: [{ "@id": "https://horalix.com/#organization" }, { "@id": "https://horalix.com/platform#software" }],
      primaryImageOfPage: { "@type": "ImageObject", url: "https://horalix.com/og.jpg" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://horalix.com/#faq",
      mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <link rel="preload" href="/media/horalix-brand-film-poster.webp" as="image" type="image/webp" fetchPriority="high" />

      <section className="hero">
        <Image unoptimized className="hero-monogram" src="/brand/horalix-mark-white.png" alt="" aria-hidden="true" width={653} height={863} sizes="52vw" priority />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">AI-assisted echocardiography workflow</p>
            <h1>Make every echo <span>ready for review.</span></h1>
            <p className="lede">Horalix turns DICOM echocardiograms into structured measurements and report-ready outputs, helping clinicians review faster while retaining final control.</p>
            <div className="button-row hero-cta"><Link className="button button-accent" href="/contact">Request a demo <span className="button-dot" aria-hidden="true">→</span></Link></div>
            <p className="hero-disclosure">Pilot-stage · Pre-clearance · Not for diagnostic use</p>
            <ul className="hero-chips" aria-label="Product status">
              <li>Pilot-stage</li><li>Europe-first</li><li>DICOM-compatible</li><li>Clinician sign-off</li>
            </ul>
          </div>
          <div className="hero-partners">
            <p className="hero-partners-label">Clinical collaborations</p>
            <ul>
              <li><Image unoptimized src="/proof/ukc-maribor-logo.png" alt="UKC Maribor" width={900} height={179} /></li>
              <li><Image unoptimized src="/proof/asa-hospital-logo.svg" alt="ASA Hospital" width={1920} height={223} className="is-wide" /></li>
              <li><Image unoptimized className="is-tonal" src="/proof/dr-nabil-logo.svg" alt="Poliklinika Dr Nabil" width={257} height={72} /></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-tight shell hero-product">
        <ProductFrame />
        <p className="hero-caption"><b>Human control is the product boundary.</b> Suggested outputs stay inside a clinician review path.</p>
      </section>

      <MetricRow path="/" eyebrow="Current pilot build" heading="What one study produces before a clinician opens it." />

      <section className="section shell" id="pilots">
        <div className="section-heading">
          <div><p className="eyebrow">Active clinical collaborations</p><h2>Already running inside real echo workflows.</h2></div>
          <div>
            <p className="lede">{approvedClaim("active-pilot-collaborations")}</p>
            <p className="microcopy">“Pilot” means a scoped evaluation collaboration. It does not imply completed clinical validation, regulatory clearance, or routine clinical use.</p>
          </div>
        </div>
        <div className="pilot-grid">
          {/* Marks are knocked to white so the row reads as one set, and return to their
              true brand colour on hover. Logo use is subject to each site's permission. */}
          <article className="pilot-card pilot-card-logo">
            <div className="pilot-plate"><Image unoptimized className="pilot-logo" src="/proof/ukc-maribor-logo.png" alt="UKC Maribor" width={900} height={179} /></div>
            <div>
              <span className="pilot-state">Active pilot · Slovenia</span>
              <h3>UKC Maribor</h3>
              <p>A university medical centre running Horalix against its own echocardiography studies under physician supervision.</p>
              <dl className="pilot-facts">
                <div><dt>Setting</dt><dd>Tertiary university medical centre</dd></div>
                <div><dt>Under evaluation</dt><dd>Workflow fit and review behaviour on real studies</dd></div>
              </dl>
              <Link className="text-link" href="/news/maribor-hospital-pilot-ai-echocardiography-workflow">Read the pilot note <Arrow /></Link>
            </div>
          </article>
          <article className="pilot-card pilot-card-asa">
            <div className="pilot-plate"><Image unoptimized className="pilot-logo pilot-logo-wide" src="/proof/asa-hospital-logo.svg" alt="ASA Hospital" width={1920} height={223} /></div>
            <div>
              <span className="pilot-state">Active pilot · Bosnia and Herzegovina</span>
              <h3>ASA Hospital</h3>
              <p>A company-confirmed collaboration inside a private hospital group. Scope and outcomes will be published only after joint approval.</p>
              <dl className="pilot-facts">
                <div><dt>Setting</dt><dd>Private hospital, Sarajevo</dd></div>
                <div><dt>Under evaluation</dt><dd>Integration path and reporting workflow fit</dd></div>
              </dl>
              <a className="text-link" href="https://asabolnica.ba/" rel="noreferrer">Visit ASA Hospital <Arrow /></a>
            </div>
          </article>
          <article className="pilot-card pilot-card-logo">
            <div className="pilot-plate"><Image unoptimized className="pilot-logo pilot-logo-tonal" src="/proof/dr-nabil-logo.svg" alt="Poliklinika Dr Nabil" width={257} height={72} /></div>
            <div>
              <span className="pilot-state">Active pilot · Sarajevo</span>
              <h3>Poliklinika Dr Nabil</h3>
              <p>An outpatient cardiology setting evaluating Horalix inside a supervised review workflow.</p>
              <dl className="pilot-facts">
                <div><dt>Setting</dt><dd>Outpatient polyclinic</dd></div>
                <div><dt>Under evaluation</dt><dd>Review ergonomics and output usefulness</dd></div>
              </dl>
              <Link className="text-link" href="/news/clinic-validation-in-sarajevo-poliklinika-dr-nabil">Read the evaluation note <Arrow /></Link>
            </div>
          </article>
        </div>
        {/* Programmes ride inside the collaborations section rather than taking a band of
            their own — same proof, one less screen of scrolling. */}
        <ProgramLogoRow />
      </section>

      <BenefitGrid
        eyebrow="Why this shape"
        heading="Six things an echo lab actually gets."
        lede="Not a list of model capabilities — the operational differences a lab and its IT team would notice in the first month."
      />

      {/* The standalone evidence band restated the hero disclosure and carried two links.
          Both links moved into the team strip; the posture line stays with the metrics. */}
      <section className="section-tight shell team-strip">
        <div className="team-strip-head">
          <div><p className="eyebrow">The team</p><h2>Four disciplines, one clinical workflow.</h2></div>
          <Link className="text-link" href="/about#team">Meet the team <Arrow /></Link>
        </div>
        <div className="team-strip-faces">
          {team.map((person) => (
            <Link className="team-face" href={`/about#${person.id}`} key={person.id}>
              <Image src={person.image} alt="" aria-hidden="true" width={200} height={200} sizes="72px" />
              <span><b>{person.name}</b><small>{person.role}</small></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Research and FAQ share one band. Both are answer surfaces, so splitting them cost a
          heading and a full section of padding for no reader benefit. */}
      <section className="section-tight shell faq-section">
        <div className="section-heading">
          <div><p className="eyebrow">Clear answers</p><h2>Horalix, in plain language.</h2></div>
          <p className="lede">Concise, source-aligned answers for clinicians, hospitals, investors, search engines, and AI assistants.</p>
        </div>
        <div className="faq-list">
          {faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        {/* Slim links rather than cards: the research library keeps its homepage inbound
            links without three more card-heights of scrolling. */}
        <div className="research-links">
          <p className="eyebrow">Selected research</p>
          <ul>
            {featuredResources.map((item) => (
              <li key={item.slug}>
                <Link href={`/resources/${item.slug}`}>
                  <span className="card-label">{item.label}</span>
                  <b>{item.title}</b>
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
          <p className="section-note"><Link className="text-link" href="/resources">Browse the full research library <Arrow /></Link></p>
        </div>
      </section>

      <SplitCta />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }} />
    </>
  );
}
