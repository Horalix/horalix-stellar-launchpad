import Link from "../_components/ReliableLink";
import { Arrow, PageIntro } from "../_components/SiteChrome";
import { resources, resourcesByCluster } from "../_data/resources";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "AI Echocardiography & Clinical AI Resources", description: "Expert-led guides on evaluating clinical AI, echo reporting burden, DICOM integration, GDPR, EU MDR, and reading echocardiography evidence honestly.", path: "/resources" });

const resourceCollection = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://horalix.com/resources#page",
      name: "Horalix AI echocardiography and clinical AI resources",
      description: "Source-led guides for evaluating AI-assisted echocardiography workflows.",
      url: "https://horalix.com/resources",
      inLanguage: "en",
      isPartOf: { "@id": "https://horalix.com/#website" },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: resources.map((resource, index) => ({ "@type": "ListItem", position: index + 1, name: resource.title, url: `https://horalix.com/resources/${resource.slug}` })),
      },
    }
  ],
};

export default function Resources() {
  const grouped = resourcesByCluster();
  return <><PageIntro breadcrumb="Resources" path="/resources" eyebrow="Research and resources" title="Practical answers for responsible clinical-AI decisions." copy="Concise, source-led guidance for clinicians, hospital teams, and investors evaluating AI-assisted echocardiography workflows." />
    {grouped.map((cluster) => (
      <section className="section-tight shell" key={cluster.name}>
        <div className="cluster-head"><h2>{cluster.name}</h2><p className="lede">{cluster.blurb}</p></div>
        <div className="resource-grid">{cluster.items.map((item) => <Link className="resource-card" href={`/resources/${item.slug}`} key={item.slug}><span className="card-label">{item.label}</span><h3>{item.title}</h3><p>{item.description}</p><footer><span>{item.readTime} · Reviewed {item.reviewed}</span><Arrow /></footer></Link>)}</div>
      </section>
    ))}
    <section className="section-tight section-dark"><div className="shell grid-2"><div><p className="eyebrow">Editorial standard</p><h2>Named scope. Primary sources. Review dates.</h2></div><p className="lede">Every resource begins with a direct answer, distinguishes product context from external evidence, and receives a scheduled review instead of silently ageing.</p></div></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(resourceCollection) }} /></>;
}
