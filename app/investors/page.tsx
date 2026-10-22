import Link from "../_components/ReliableLink";
import { Arrow, MetricRow, PageIntro } from "../_components/SiteChrome";
import { ProgramLogos } from "../_components/ProgramLogos";
import { approvedClaim } from "../_data/claims";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "Horalix Investor Overview — Sarajevo medical AI", description: "Horalix investor overview: echo workflow product, active clinical collaborations, Techstars Sarajevo Founder Catalyst, NVIDIA Inception, and private materials request.", path: "/investors" });

const questions = [
  { question: "What stage is Horalix at?", answer: "Pilot-stage and pre-clearance. The product runs in three company-confirmed clinical collaborations, has published internal build benchmarks, and has no completed clinical validation study or regulatory clearance. Horalix publishes that boundary rather than implying more." },
  { question: "What is the initial market?", answer: "European hospital echocardiography, entered through scoped pilots. The company is Sarajevo-based and Europe-first, which shapes both the regulatory route and the early clinical relationships." },
  { question: "What makes the approach defensible?", answer: "Product learning spans image understanding, structured output, integration, review behaviour, and evidence operations. The narrow echo-first scope is deliberate: it produces a clearer validation path than a broad multi-modality claim." },
  { question: "Does this page contain fundraising terms?", answer: "No. This website carries no financial projections, fundraising terms, valuation, or market-size figures. Qualified investors can request current materials directly through the form on this page." },
  { question: "Do the programs mean investment?", answer: "No. Techstars Sarajevo Founder Catalyst is a founder-development programme and NVIDIA Inception is a startup-support programme. Neither implies investment, certification, endorsement, or clinical validation." },
];

const investorGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://horalix.com/investors#page",
      url: "https://horalix.com/investors",
      name: "Horalix investor overview",
      description: "Company overview for investors: product scope, verified traction, programs, and how to request private materials.",
      inLanguage: "en",
      isPartOf: { "@id": "https://horalix.com/#website" },
      about: { "@id": "https://horalix.com/#organization" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://horalix.com/investors#faq",
      mainEntity: questions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

export default function Investors() {
  return <>
    <PageIntro breadcrumb="Investors" path="/investors" eyebrow="Investor overview" title="The workflow layer between echo acquisition and the signed report." copy="Horalix is a Sarajevo medical-AI company developing an echo-first, review-led product for the space between DICOM acquisition and report-ready output." actions={<><a className="button button-light" href="#access">Request investor materials <Arrow /></a><Link className="button button-ghost" href="/platform">Explore the product</Link></>} />
    <section className="section shell"><div className="grid-2"><div><p className="eyebrow">The problem</p><h2>Echo interpretation carries repetitive preparation around high-value judgment.</h2></div><div><p className="lede">Manual measurement and reporting steps can fragment attention and make workflow consistency difficult. The opportunity is not to remove clinical judgment—it is to prepare a clearer, structured review surface around it.</p><div className="disclosure"><strong>Investor disclosure:</strong> Horalix is pilot-stage and pre-clearance. This page contains no financial projections, fundraising terms, or unsupported market-size figures.</div></div></div></section>
    <section className="section section-dark"><div className="shell"><div className="section-heading"><div><p className="eyebrow">Why this approach</p><h2>Focus creates a more credible path to evidence.</h2></div><p className="lede">Echo-first scope, workflow context, clinician control, and claim governance reinforce one another.</p></div><div className="grid-3"><div className="metricless-card"><b>Focus</b><p>A deliberately bounded initial modality and workflow.</p></div><div className="metricless-card"><b>Defensibility</b><p>Product learning spans image understanding, structured output, integration, review behavior, and evidence operations.</p></div><div className="metricless-card"><b>Trust</b><p>Claims, product status, and limitations are governed as part of the product—not polished later.</p></div></div></div></section>
    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">Verified traction</p><h2>Specific progress, with the boundary attached.</h2></div><p className="lede">{approvedClaim("active-pilot-collaborations")}</p></div><div className="timeline"><div className="timeline-row"><b>Clinical</b><div><h3>Three active pilot collaborations</h3><p>UKC Maribor, ASA Hospital, and Poliklinika Dr Nabil are company-confirmed evaluation relationships. No completed validation result is implied.</p></div></div><div className="timeline-row"><b>Founder network</b><div><h3>Techstars Sarajevo Founder Catalyst</h3><p>Horalix was selected for the Fall 2025 cohort named in Techstars’ official announcement.</p></div></div><div className="timeline-row"><b>AI ecosystem</b><div><h3>NVIDIA Inception</h3><p>Horalix is a member of NVIDIA’s startup-support program. Membership is not investment, certification, endorsement, or clinical validation.</p></div></div></div><p className="microcopy"><Link className="text-link" href="/news">Open the sourced milestone archive <Arrow /></Link></p></section>
    <ProgramLogos tone="dark" eyebrow="External programs" heading="Selected into two programs, on the record." />
    <MetricRow path="/investors" eyebrow="Product today" heading="What the current build already prepares." />
    <section className="section section-blue"><div className="shell grid-2"><div><p className="eyebrow">Why now</p><h2>Clinical AI is moving from model fascination to deployment discipline.</h2></div><p className="lede">Hospitals increasingly need evidence, integration, human factors, governance, and economic value to align. Horalix is being built for that more demanding buying environment.</p></div></section>
    {/* The form lives on /contact so every request routes through one place. */}
    <section className="section-tight shell" id="access"><div className="closing-cta"><p className="eyebrow">Private follow-up</p><h2>Request the investor overview.</h2><p className="lede">Qualified investors can request current company materials, verified milestones, and a focused conversation with the team.</p><div className="button-row"><Link className="button button-accent" href="/contact?for=investor">Request investor materials <span className="button-dot" aria-hidden="true">→</span></Link></div><p className="microcopy">No public fundraising terms, projections, or unsupported TAM figures are presented on this website.</p></div></section>
    <section className="section section-line shell"><div className="section-heading"><div><p className="eyebrow">Direct answers</p><h2>The questions we get asked first.</h2></div><p className="lede">Stage, market, defensibility, and what this page deliberately does not contain.</p></div><dl className="answer-grid">{questions.map(({ question, answer }) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(investorGraph) }} />
  </>;
}
