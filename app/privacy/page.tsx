import { Breadcrumbs } from "../_components/SiteChrome";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "Horalix Website Privacy Notice", description: "How Horalix handles website enquiries, analytics, retention, security, third-party services, and privacy rights.", path: "/privacy" });

const legalCrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://horalix.com/privacy#breadcrumbs",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Horalix", item: "https://horalix.com/" },
    { "@type": "ListItem", position: 2, name: "Privacy", item: "https://horalix.com/privacy" },
  ],
};

export default function Privacy() {
  return <><article><header className="article-hero"><div className="shell"><Breadcrumbs items={[{ label: "Horalix", href: "/" }, { label: "Privacy" }]} /><p className="eyebrow">Legal</p><h1>Website privacy notice.</h1><div className="article-meta"><span>Effective 13 August 2026</span><span>Review by 13 February 2027</span></div></div></header><div className="article-body narrow"><div className="answer-box">This notice covers the public Horalix website and its business-enquiry forms. It does not authorize submission of patient information, DICOM files, or other clinical data.</div><h2>Information we collect</h2><p>When you submit a hospital or investor request, we collect your name, work email, organization, role, country, optional message, consent version, source page, and approved campaign fields. We do not intentionally collect patient information through this website.</p><h2>Why we use it</h2><p>We use enquiry details to respond, qualify the appropriate business follow-up, maintain consent records, protect the form from abuse, and keep an accountable record of the conversation.</p><h2>Retention</h2><p>Website enquiries are scheduled for deletion after 180 days unless a documented business relationship or legal obligation requires a different period. The form does not store raw IP addresses.</p><h2>Analytics</h2><p>We record a small set of anonymous funnel events such as demo starts, submissions, product-video plays, evidence-page engagement, and broad referral categories. Form contents are never sent to analytics. Cloudflare Web Analytics may be activated with its privacy-first configuration.</p><h2>Third-party services</h2><p>Cloudflare Turnstile protects forms. YouTube’s privacy-enhanced player loads only after you choose to play the product video. Scheduling services load only after a deliberate scheduling action.</p><h2>Your choices and rights</h2><p>You may ask to access, correct, or delete your website-enquiry information, subject to applicable law and legitimate retention requirements. Email <a href="mailto:support@horalix.com">support@horalix.com</a>.</p><h2>Controller details</h2><p>Production legal entity name, registered address, company number, and jurisdiction must be inserted and approved before the public domain cutover. This staging notice deliberately does not invent those details.</p></div></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(legalCrumbs) }} /></>;
}
