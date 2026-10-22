import Link from "../_components/ReliableLink";
import { Arrow, PageIntro } from "../_components/SiteChrome";
import { glossaryAlphabetical, glossaryReviewed, termLabel } from "../_data/glossary";
import { pageMetadata } from "../_data/metadata";

export const metadata = pageMetadata({ title: "Echocardiography & Clinical AI Glossary", description: "Plain-language definitions of echo and clinical-AI terms: LVEF, GLS, E/e′, TAPSE, the biplane method, DICOM, human oversight and automation bias.", path: "/glossary", image: "/og/resources.jpg" });

export default function Glossary() {
  const terms = glossaryAlphabetical();
  // Every definition is on this page as well as its own, so one fetch answers any term.
  const termSet = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTermSet",
        "@id": "https://horalix.com/glossary#terms",
        name: "Horalix echocardiography and clinical AI glossary",
        description: "Definitions of echocardiography measurements, imaging standards and clinical-AI governance terms.",
        url: "https://horalix.com/glossary",
        inLanguage: "en",
        dateModified: glossaryReviewed,
        publisher: { "@id": "https://horalix.com/#organization" },
        isPartOf: { "@id": "https://horalix.com/#website" },
        hasDefinedTerm: terms.map((term) => ({
          "@type": "DefinedTerm",
          "@id": `https://horalix.com/glossary/${term.slug}#term`,
          name: termLabel(term),
          alternateName: term.alternateNames,
          description: term.definition,
          url: `https://horalix.com/glossary/${term.slug}`,
          inDefinedTermSet: { "@id": "https://horalix.com/glossary#terms" },
        })),
      },
    ],
  };
  return <><PageIntro breadcrumb="Glossary" path="/glossary" title="The language of echo reporting and clinical AI, defined." copy="Short, source-led definitions of the measurements, standards and oversight terms that come up when a hospital evaluates AI-assisted echocardiography." />
    <section className="section-tight shell">
      <div className="cluster-head"><h2>All terms, A to Z</h2><p className="lede">{terms.length} definitions, reviewed {new Date(glossaryReviewed).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}.</p></div>
      <div className="resource-grid">{terms.map((term) => <Link className="resource-card" href={`/glossary/${term.slug}`} key={term.slug} id={term.slug}><span className="card-label">{term.abbreviation ?? "Term"}</span><h3>{term.name}</h3><p>{term.definition}</p><footer><span>Read the full definition</span><Arrow /></footer></Link>)}</div>
    </section>
    <section className="section-tight section-dark"><div className="shell grid-2"><div><h2>Definitions first. Primary sources. No product claims.</h2></div><p className="lede">Each entry opens with a direct answer, follows the published guideline or standard it names, and keeps Horalix product context separate from the definition. <Link className="text-link" href="/resources">Read the research library <Arrow /></Link></p></div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(termSet) }} /></>;
}
