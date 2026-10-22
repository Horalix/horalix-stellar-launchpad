import type { Metadata } from "next";
import Link from "../../_components/ReliableLink";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../_components/SiteChrome";
import { getResource, resources } from "../../_data/resources";
import { personNode } from "../../_data/team";

export function generateStaticParams() { return resources.map((resource) => ({ slug: resource.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const resource = getResource(slug); if (!resource) return {};
  // Articles share the resources hub card; the review date is the article's own, not a build constant.
  const reviewed = new Date(resource.reviewed);
  const isoReviewed = Number.isNaN(reviewed.valueOf()) ? "2026-08-14" : reviewed.toISOString().slice(0, 10);
  const image = "/og/resources.jpg";
  return { title: resource.title, description: resource.description, alternates: { canonical: `/resources/${slug}` }, authors: [{ name: resource.author.name, url: `https://horalix.com/about#${resource.author.id}` }], openGraph: { type: "article", siteName: "Horalix", locale: "en_GB", title: resource.title, description: resource.description, url: `https://horalix.com/resources/${slug}`, publishedTime: isoReviewed, modifiedTime: isoReviewed, authors: [`https://horalix.com/about#${resource.author.id}`], images: [{ url: image, width: 1200, height: 630, alt: `${resource.title} — Horalix` }] }, twitter: { card: "summary_large_image", title: resource.title, description: resource.description, images: [image] } };
}

export default async function ResourceArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const resource = getResource(slug); if (!resource) notFound();
  const authorId = `https://horalix.com/about#${resource.author.id}`;
  const reviewerId = `https://horalix.com/about#${resource.reviewer.id}`;
  // Dates come from the article's own review date rather than a build-time constant.
  const parsedReview = new Date(resource.reviewed);
  const reviewedIso = Number.isNaN(parsedReview.valueOf()) ? "2026-08-14" : parsedReview.toISOString().slice(0, 10);
  const article = { "@context": "https://schema.org", "@graph": [{ "@type": "MedicalWebPage", "@id": `https://horalix.com/resources/${slug}#page`, name: resource.title, url: `https://horalix.com/resources/${slug}`, inLanguage: "en", medicalAudience: { "@type": "MedicalAudience", audienceType: "Clinicians and hospital decision-makers" }, specialty: "https://schema.org/Cardiovascular", dateReviewed: reviewedIso, reviewedBy: { "@id": reviewerId }, isPartOf: { "@id": "https://horalix.com/#website" } }, { "@type": "Article", headline: resource.title, description: resource.description, inLanguage: "en", datePublished: reviewedIso, dateModified: reviewedIso, author: { "@id": authorId }, reviewedBy: { "@id": reviewerId }, publisher: { "@id": "https://horalix.com/#organization" }, citation: resource.sources.map((source) => source.href), mainEntityOfPage: { "@id": `https://horalix.com/resources/${slug}#page` } }, personNode(resource.author.id), personNode(resource.reviewer.id), { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Horalix", item: "https://horalix.com/" }, { "@type": "ListItem", position: 2, name: "Resources", item: "https://horalix.com/resources" }, { "@type": "ListItem", position: 3, name: resource.title, item: `https://horalix.com/resources/${slug}` }] }] };
  return <><article><header className="article-hero"><div className="shell"><Breadcrumbs items={[{ label: "Resources", href: "/resources" }, { label: resource.label }]} /><p className="eyebrow">{resource.label}</p><h1>{resource.title}</h1><p className="lede">{resource.description}</p><div className="article-meta"><span>By <Link href={`/about#${resource.author.id}`}>{resource.author.name}</Link>, {resource.author.role}</span><span>Company review by <Link href={`/about#${resource.reviewer.id}`}>{resource.reviewer.name}</Link>, {resource.reviewer.role}</span><span>Reviewed {resource.reviewed}</span><span>{resource.readTime} read</span></div></div></header><div className="article-body narrow"><div className="answer-box"><strong>Short answer:</strong> {resource.answer}</div>{resource.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<div className="article-sources"><p className="eyebrow">Primary sources</p>{resource.sources.map((source) => <a href={source.href} key={source.href} rel="noreferrer">{source.title} ↗</a>)}</div><div className="article-related"><p className="eyebrow">Related Horalix context</p>{resource.related.map((item) => <Link href={item.href} key={item.href}>{item.title} <span aria-hidden="true">→</span></Link>)}</div><div className="note-box" style={{ marginTop: 40 }}>This educational resource does not establish Horalix product performance or suitability for a particular clinical environment. <Link href="/evidence">Review the Horalix evidence boundary.</Link></div></div></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} /></>;
}
