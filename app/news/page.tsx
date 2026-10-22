import Image from "next/image";
import Link from "../_components/ReliableLink";
import { Arrow, PageIntro } from "../_components/SiteChrome";
import { newsItems } from "../_data/news";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "Horalix News — pilots, Techstars and NVIDIA Inception", description: "Verified Horalix updates from Sarajevo, including hospital pilot collaborations, Techstars Sarajevo Founder Catalyst, and NVIDIA Inception membership.", path: "/news" });

const newsGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://horalix.com/news#page",
      url: "https://horalix.com/news",
      name: "Horalix news",
      description: "Verified Horalix updates on hospital collaborations, company programs, product development, and evidence.",
      inLanguage: "en",
      isPartOf: { "@id": "https://horalix.com/#website" },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: newsItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: `https://horalix.com/news/${item.slug}` })),
      },
    }
  ],
};

export default function News() {
  return <><PageIntro breadcrumb="News" path="/news" eyebrow="News" title="Progress, with the status attached." copy="Verified Horalix updates on hospital collaborations, company programs, product development, and evidence—each published with its scope and limitations." />
    <section className="section shell"><div className="news-grid">{newsItems.map((item) => <article className="news-card" key={item.slug}>{item.image ? <Image src={item.image} alt={item.imageAlt ?? ""} width={1200} height={676} sizes="(max-width: 720px) 100vw, 50vw" /> : <div className="news-card-graphic" aria-hidden="true"><span>H</span><i /></div>}<div><span className="card-label">{item.label} · {item.displayDate}</span><h2>{item.title}</h2><p>{item.summary}</p><Link className="text-link" href={`/news/${item.slug}`}>Read the verified update <Arrow /></Link></div></article>)}</div></section>
    <section className="section-tight section-dark"><div className="shell">
      <div className="section-heading"><div><p className="eyebrow">Publication standard</p><h2>No milestone without its boundary.</h2></div><p className="lede">Pilot, programme, and partner announcements do not imply regulatory clearance, completed validation, investment, certification, or endorsement unless the source explicitly establishes it.</p></div>
      <div className="trust-list">
        <div className="trust-row"><span>Sourced</span><p>Every update links the primary source — a programme announcement, an independent report, or a named company confirmation. Nothing rests on our own summary alone.</p></div>
        <div className="trust-row"><span>Bounded</span><p>Each article carries an explicit status and limitation note stating what the milestone does not establish, published alongside the news rather than buried in a footer.</p></div>
        <div className="trust-row"><span>Approval-gated</span><p>Where a clinical partner has not agreed to publication, scope and outcomes stay unpublished. We would rather post less than post something a partner has not signed off.</p></div>
        <div className="trust-row"><span>Correctable</span><p>If something here is wrong, tell us at <a href="mailto:support@horalix.com">support@horalix.com</a> and we will correct it and say that we did.</p></div>
      </div>
    </div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsGraph) }} /></>;
}
