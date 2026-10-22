import Link from "../_components/ReliableLink";
import { ProductFrame } from "../_components/ProductFrame";
import { Arrow, PageIntro, SplitCta } from "../_components/SiteChrome";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "AI-Assisted Echocardiography for Clinicians", description: "See how Horalix keeps source views, AI-assisted echo measurements, corrections, and clinician sign-off in one review-led workflow.", path: "/for-clinicians" });

const questions = [
  { question: "Does Horalix change how I scan?", answer: "No. Standard views are captured as they are today. Horalix works from the resulting DICOM study, so acquisition practice, probe protocol, and bedside workflow stay as they are." },
  { question: "Can I see where a measurement came from?", answer: "Yes. Suggested measurements and overlays are presented beside the view that produced them, so a value can be checked against its source image rather than accepted on trust." },
  { question: "What happens if I disagree with a suggested value?", answer: "Adjust it or reject it. Correction happens inside the review context without leaving the study, and a rejected suggestion does not block the rest of the workflow." },
  { question: "Who signs the report?", answer: "You do. Horalix prepares material for review and holds no authority over interpretation or the final report. Clinical judgement and sign-off remain entirely with the responsible clinician." },
  { question: "Is this a diagnostic device?", answer: "No. Horalix is pilot-stage and pre-clearance. It is not cleared or CE-marked as a medical device, is not authorised for routine clinical use, and must not be relied upon for diagnosis." },
];

const cliniciansGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalWebPage",
      "@id": "https://horalix.com/for-clinicians#page",
      url: "https://horalix.com/for-clinicians",
      name: "AI-assisted echocardiography for clinicians",
      description: "How Horalix keeps source views, AI-assisted echo measurements, corrections, and clinician sign-off in one review-led workflow.",
      inLanguage: "en",
      specialty: "https://schema.org/Cardiovascular",
      audience: { "@type": "MedicalAudience", audienceType: "Cardiologists and sonographers" },
      about: { "@id": "https://horalix.com/platform#software" },
      isPartOf: { "@id": "https://horalix.com/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://horalix.com/for-clinicians#faq",
      mainEntity: questions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

export default function Clinicians() {
  return <>
    <PageIntro breadcrumb="For clinicians" path="/for-clinicians" eyebrow="For clinicians" title="Check the measurement instead of producing it." copy="Review the source image, inspect the suggested measurement, correct what needs correction, and retain final sign-off." actions={<><Link className="button button-light" href="/product-tour">Watch product tour <Arrow /></Link><Link className="button button-ghost" href="/evidence">Read the evidence approach</Link></>} />
    <section className="section shell"><div className="grid-2"><div><p className="eyebrow">Review in context</p><h2>Judge every value against the anatomy behind it.</h2><p className="lede">Measurements without their source view invite over-trust. Horalix is designed so suggested outputs remain traceable to the relevant echo image or loop.</p><ul className="feature-list"><li>Source-linked measurements and overlays</li><li>Visible review status</li><li>Clear missing or unsupported output states</li></ul></div><ProductFrame compact /></div></section>
    <section className="section section-dark"><div className="shell"><div className="section-heading"><div><p className="eyebrow">Human oversight</p><h2>Control means being able to disagree.</h2></div><p className="lede">Useful clinical AI should make correction straightforward and limitations visible at the moment of review.</p></div><div className="trust-list"><div className="trust-row"><span>Inspect</span><p>See the source view and suggested overlay together.</p></div><div className="trust-row"><span>Adjust</span><p>Correct a suggested result without leaving the review context.</p></div><div className="trust-row"><span>Reject</span><p>Remove an unsuitable suggestion instead of working around it.</p></div><div className="trust-row"><span>Sign off</span><p>Retain responsibility for the final reviewed output.</p></div></div></div></section>
    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">Intended workflow</p><h2>Support for preparation, not an independent diagnosis.</h2></div><div><p className="lede">Horalix is pilot-stage and pre-clearance. Published materials do not imply clearance, routine clinical use, or independently validated performance.</p><div className="disclosure"><strong>Important:</strong> Outputs require clinician review. Suitability, compatibility, and pilot use are confirmed for each environment.</div></div></div></section>
    <section className="section section-line shell"><div className="section-heading"><div><p className="eyebrow">Direct answers</p><h2>What clinicians ask first.</h2></div><p className="lede">The questions that come up in every first conversation, answered without hedging.</p></div><dl className="answer-grid">{questions.map(({ question, answer }) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl></section>
    <SplitCta />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cliniciansGraph) }} />
  </>;
}
