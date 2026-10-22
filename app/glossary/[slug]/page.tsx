import type { Metadata } from "next";
import Link from "../../_components/ReliableLink";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../_components/SiteChrome";
import { getGlossaryTerm, glossary, glossaryReviewed, termLabel, termQuestion } from "../../_data/glossary";

export function generateStaticParams() { return glossary.map((term) => ({ slug: term.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const term = getGlossaryTerm((await params).slug);
  if (!term) return {};
  const title = termQuestion(term);
  const url = `https://horalix.com/glossary/${term.slug}`;
  // Terms share the glossary's card; the question is the headline people search for.
  const image = "/og/resources.jpg";
  return { title, description: term.definition, alternates: { canonical: `/glossary/${term.slug}` }, openGraph: { type: "article", siteName: "Horalix", locale: "en_GB", title, description: term.definition, url, modifiedTime: glossaryReviewed, images: [{ url: image, width: 1200, height: 630, alt: `${title} — Horalix glossary` }] }, twitter: { card: "summary_large_image", title, description: term.definition, images: [image] } };
}

export default async function GlossaryTerm({ params }: { params: Promise<{ slug: string }> }) {
  const term = getGlossaryTerm((await params).slug);
  if (!term) notFound();
  const url = `https://horalix.com/glossary/${term.slug}`;
  const question = termQuestion(term);
  const related = term.related.map(getGlossaryTerm).filter((item) => item !== undefined);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "DefinedTerm", "@id": `${url}#term`, name: termLabel(term), alternateName: term.alternateNames, description: term.definition, url, inDefinedTermSet: { "@id": "https://horalix.com/glossary#terms" } },
      { "@type": "MedicalWebPage", "@id": `${url}#page`, name: question, url, inLanguage: "en", about: { "@id": `${url}#term` }, mainEntity: { "@id": `${url}#term` }, medicalAudience: { "@type": "MedicalAudience", audienceType: "Clinicians and hospital decision-makers" }, specialty: "https://schema.org/Cardiovascular", dateModified: glossaryReviewed, author: { "@id": "https://horalix.com/#organization" }, publisher: { "@id": "https://horalix.com/#organization" }, citation: term.sources.map((source) => source.href), isPartOf: { "@id": "https://horalix.com/#website" } },
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: [{ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: term.definition } }] },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Horalix", item: "https://horalix.com/" }, { "@type": "ListItem", position: 2, name: "Glossary", item: "https://horalix.com/glossary" }, { "@type": "ListItem", position: 3, name: termLabel(term), item: url }] },
    ],
  };
  return <><article><header className="article-hero"><div className="shell"><Breadcrumbs items={[{ label: "Glossary", href: "/glossary" }, { label: term.abbreviation ?? term.name }]} /><p className="eyebrow">Glossary{term.abbreviation ? ` · ${term.abbreviation}` : ""}</p><h1>{question}</h1>{term.alternateNames && <p className="lede">Also called {term.alternateNames.join(", ")}.</p>}<div className="article-meta"><span>By the <Link href="/about#team">Horalix team</Link></span><span>Updated {new Date(glossaryReviewed).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</span></div></div></header>
    <div className="article-body narrow">
      <div className="answer-box"><strong>Short answer:</strong> {term.definition}</div>
      <section><h2>How it works</h2>{term.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
      <section><h2>Why it matters for AI-assisted echocardiography</h2><p>{term.inPractice}</p></section>
      {related.length > 0 && <section><h2>Related terms</h2><div className="article-related" style={{ marginTop: 0 }}>{related.map((item) => <Link href={`/glossary/${item.slug}`} key={item.slug}>{termLabel(item)} <span aria-hidden="true">→</span></Link>)}</div></section>}
      <div className="article-sources"><p className="eyebrow">Primary sources</p>{term.sources.map((source) => <a href={source.href} key={source.href} rel="noreferrer">{source.title} ↗</a>)}</div>
      <div className="article-related"><p className="eyebrow">Go deeper</p>{term.resources.map((item) => <Link href={item.href} key={item.href}>{item.title} <span aria-hidden="true">→</span></Link>)}<Link href="/glossary">All glossary terms <span aria-hidden="true">→</span></Link></div>
      <div className="note-box" style={{ marginTop: 40 }}>This is an educational definition, not medical advice, and it does not describe Horalix product performance. <Link href="/evidence">Review the Horalix evidence boundary.</Link></div>
    </div></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></>;
}
