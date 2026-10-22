import Link from "../_components/ReliableLink";
import { Arrow, PageIntro } from "../_components/SiteChrome";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "Clinical AI Security, Privacy & Deployment", description: "Review Horalix's security-by-design approach to pilot scoping, data flow, access, retention, vendor review, resilience, and privacy.", path: "/security" });

const questions = [
  { question: "Is the hospital the data controller?", answer: "Yes. In a Horalix pilot the hospital determines the purposes and means of processing and acts as data controller. Horalix expects to act as a processor under a written data processing agreement naming purpose, categories of data, retention, subprocessors, and deletion obligations." },
  { question: "Where is clinical data processed and stored?", answer: "Horalix operates Europe-first. Processing location, storage location, and any cross-border transfer are fixed per pilot and recorded in the agreement rather than asserted in advance. Where governance requires a specific residency or an on-premise deployment, that is settled during scoping." },
  { question: "How are DICOM identifiers handled?", answer: "Identifier handling is part of pilot scoping and includes checks for identifiers burned into DICOM pixel data, not only header tags. De-identification approaches are tested against studies from the hospital's own scanners before a pilot begins." },
  { question: "What is logged and who can access it?", answer: "Access is role-based and least-privilege, with account lifecycle defined at the start. Which system and review events are logged, how long they are retained, and who may inspect them are agreed during scoping so an investigation remains possible later." },
  { question: "Does Horalix hold security certifications?", answer: "Horalix does not claim certifications it has not completed. Detailed architecture and control evidence is shared privately under qualified diligence, subject to current documentation and pilot scope." },
];

const securityGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://horalix.com/security#page",
      url: "https://horalix.com/security",
      name: "Clinical AI security, privacy and deployment",
      description: "Horalix's approach to pilot scoping, data flow, access, retention, resilience, and privacy.",
      inLanguage: "en",
      isPartOf: { "@id": "https://horalix.com/#website" },
      about: { "@id": "https://horalix.com/#organization" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://horalix.com/security#faq",
      mainEntity: questions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

export default function Security() {
  return <>
    <PageIntro breadcrumb="Security" path="/security" eyebrow="Security and deployment" title="Clear information governance before a single study moves." copy="Horalix scopes architecture, data flow, access, logging, retention, resilience, and responsibilities against the actual deployment environment." actions={<><Link className="button button-light" href="/for-hospitals#request">Start security review <Arrow /></Link><Link className="button button-ghost" href="/privacy">Read website privacy</Link></>} />
    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">Security posture</p><h2>Specific where verified. Explicit where pending.</h2></div><p className="lede">The public site does not claim certifications, deployment models, or controls that have not passed company and legal approval.</p></div><div className="metricless-grid"><div className="metricless-card"><b>Data flow</b><p>Document every system, transfer, processing step, export, and operational owner.</p></div><div className="metricless-card"><b>Least privilege</b><p>Define role-based access, account lifecycle, and the minimum access required for the pilot.</p></div><div className="metricless-card"><b>Auditability</b><p>Agree which system and review events are logged, retained, and available for investigation.</p></div></div></section>
    <section className="section section-dark"><div className="shell"><div className="section-heading"><div><p className="eyebrow">Hospital diligence</p><h2>A review package built around your environment.</h2></div><p className="lede">Detailed architecture and control evidence is shared privately during qualified diligence, subject to current documentation and scope.</p></div><div className="trust-list"><div className="trust-row"><span>Architecture</span><p>Proposed hosting, network boundaries, integrations, data direction, third parties, and administrative access.</p></div><div className="trust-row"><span>Data protection</span><p>Data classification, purpose limitation, encryption expectations, retention, deletion, subprocessor review, and checks for burned-in DICOM identifiers.</p></div><div className="trust-row"><span>Operations</span><p>Monitoring, incident communication, recovery, change management, vulnerability handling, and pilot exit.</p></div><div className="trust-row"><span>People</span><p>Access responsibilities, support contacts, and training needs are assigned before go-live. Security enquiries: <a href="mailto:support@horalix.com">support@horalix.com</a>.</p></div></div></div></section>
    <section className="section shell"><div className="grid-2"><div><p className="eyebrow">Website privacy</p><h2>Lead capture without clinical data.</h2><p className="lede">The public website form is for business enquiries. It warns against patient submissions, rejects likely clinical content, avoids raw IP storage, and keeps personal details out of analytics.</p></div><div><div className="timeline"><div className="timeline-row"><b>Retention</b><p>Business enquiries are scheduled for deletion after 180 days unless a legitimate business relationship requires a documented alternative.</p></div><div className="timeline-row"><b>Protection</b><p>Same-origin checks, server-side Turnstile verification, a honeypot, input limits, and privacy-preserving rate controls protect submissions.</p></div><div className="timeline-row"><b>Third parties</b><p>Video and scheduling services load only after deliberate interaction. Analytics events contain no form details.</p></div></div></div></div></section>
    <section className="section section-line shell"><div className="section-heading"><div><p className="eyebrow">Direct answers</p><h2>What security and governance teams ask.</h2></div><p className="lede">The answers we give in a diligence call, written down so your DPO and IT lead can read them before it.</p></div><dl className="answer-grid">{questions.map(({ question, answer }) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(securityGraph) }} />
  </>;
}
