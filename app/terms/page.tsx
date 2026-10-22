import { Breadcrumbs } from "../_components/SiteChrome";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "Horalix Website Terms", description: "Terms for using the public Horalix website and its informational materials.", path: "/terms" });

const legalCrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://horalix.com/terms#breadcrumbs",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Horalix", item: "https://horalix.com/" },
    { "@type": "ListItem", position: 2, name: "Terms", item: "https://horalix.com/terms" },
  ],
};

export default function Terms() {
  return <><article><header className="article-hero"><div className="shell"><Breadcrumbs items={[{ label: "Horalix", href: "/" }, { label: "Terms" }]} /><p className="eyebrow">Legal</p><h1>Website terms.</h1><div className="article-meta"><span>Effective 13 August 2026</span><span>Approval required before production cutover</span></div></div></header><div className="article-body narrow"><div className="answer-box">The Horalix website provides general company, product, research, and business information. It is not medical advice, a diagnostic service, or an offer of regulated clinical use.</div><h2>Product status</h2><p>Horalix is presented as pilot-stage and pre-clearance. Product descriptions do not imply regulatory clearance, routine clinical use, independent diagnosis, or suitability for a particular hospital.</p><h2>No clinical submissions</h2><p>Do not submit patient information, DICOM files, protected health information, medical records, or requests for medical advice through this website.</p><h2>Informational materials</h2><p>Research summaries are educational and may change as sources or product context evolve. External literature does not validate Horalix. Internal benchmarks, when published, apply only to the stated version, sample, environment, method, and limitations.</p><h2>Intellectual property</h2><p>The Horalix name, visual identity, product interface, and original website content are protected to the extent provided by applicable law. Third-party names and sources remain the property of their respective owners.</p><h2>Links and availability</h2><p>External links are provided for context. Horalix does not control third-party availability or content. The website may be changed, suspended, or corrected without notice.</p><h2>Legal details pending</h2><p>Governing law, entity name, registered address, liability language, and formal notice details require legal approval before production cutover. This staging page uses a visible approval gate instead of inventing legal terms.</p></div></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(legalCrumbs) }} /></>;
}
