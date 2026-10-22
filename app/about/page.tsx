import Image from "next/image";
import Link from "../_components/ReliableLink";
import { Arrow, PageIntro, SplitCta } from "../_components/SiteChrome";
import { NvidiaInceptionMark, TechstarsMark } from "../_components/ProgramLogos";
import { pageMetadata } from "../_data/metadata";
import { advisorNode, advisors, personNode, team } from "../_data/team";

export const metadata = pageMetadata({ title: "About Horalix — Sarajevo medical AI team", description: "Meet the Sarajevo-based Horalix team building an echo-first clinical-AI workflow around transparency, clinician control, and responsible hospital evaluation.", path: "/about" });

const people = team;

const teamSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://horalix.com/about#page",
      url: "https://horalix.com/about",
      name: "About Horalix",
      description: "The Sarajevo-based team building an echo-first clinical-AI workflow around transparency, clinician control, and responsible hospital evaluation.",
      inLanguage: "en",
      isPartOf: { "@id": "https://horalix.com/#website" },
      mainEntity: { "@id": "https://horalix.com/#organization" },
    },
    ...people.map((person) => personNode(person.id)),
    ...advisors.map((advisor) => advisorNode(advisor.id)),
    // Advisors attach to the organization as `member` — an affiliation, not employment.
    { "@id": "https://horalix.com/#organization", member: advisors.map((advisor) => ({ "@id": `https://horalix.com/about#${advisor.id}` })) },
  ],
};

export default function About() {
  return <>
    <PageIntro breadcrumb="About" path="/about" eyebrow="About Horalix" title="Clinical AI should earn trust through the way it is built." copy="Horalix is a Sarajevo-based medical-AI company developing an echo-first workflow around clinician agency, transparent evidence, and the operational realities of hospital deployment." actions={<Link className="button button-light" href="/contact">Talk with Horalix <Arrow /></Link>} />
    <section className="section shell"><div className="grid-2"><div><p className="eyebrow">Our mission</p><h2>Give echo teams a clearer path from study to review.</h2></div><div><p className="lede">We believe the best role for AI in echocardiography is to prepare structured, inspectable work while preserving the expertise and final authority of the clinician.</p><div className="location-line"><span>Sarajevo</span><span>Bosnia &amp; Herzegovina</span><span>Europe-first</span></div></div></div></section>

    <section className="section section-dark" id="team"><div className="shell"><div className="section-heading"><div><p className="eyebrow">The team</p><h2>Four disciplines. One clinical workflow.</h2></div><p className="lede">Horalix connects clinical workflow and product direction with company operations, platform engineering, and machine-learning evaluation around one echo-first focus.</p></div><div className="team-grid">{people.map((person, index) => <article id={person.id} className="team-card" key={person.name}>{person.image ? <Image src={person.image} alt={`${person.name}, ${person.role} at Horalix`} width={900} height={900} sizes="(max-width: 720px) 100vw, (max-width: 1024px) 50vw, 25vw" /> : <div className="team-monogram" aria-hidden="true"><span>{person.initials}</span><i /></div>}<div className="team-card-copy"><span className="team-index">0{index + 1}</span><h3>{person.name}</h3><b>{person.role}</b><p>{person.focus}</p><a className="team-link" href={person.linkedin} rel="noreferrer" aria-label={`${person.name} on LinkedIn`}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21H9z" /></svg>LinkedIn</a></div></article>)}</div></div></section>

    <section className="section-tight shell" id="advisors"><div className="section-heading"><div><p className="eyebrow">Advisors</p><h2>Clinical and operating guidance from outside the company.</h2></div><p className="lede">Advisors challenge our clinical assumptions and our company decisions.</p></div><div className="advisor-grid">{advisors.map((advisor) => <article id={advisor.id} className="advisor-card" key={advisor.name}>{advisor.image ? <Image className="advisor-face" src={advisor.image} alt={`${advisor.name}, ${advisor.role} to Horalix`} width={480} height={480} sizes="(max-width: 720px) 50vw, 25vw" /> : <div className="advisor-face advisor-monogram" aria-hidden="true"><span>{advisor.initials}</span></div>}<h3>{advisor.name}</h3><b>{advisor.role}</b><p>{advisor.bio}</p></article>)}</div></section>

    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">External milestones</p><h2>Specific programs, stated precisely.</h2></div><p className="lede">Horalix was selected for the Techstars Sarajevo Founder Catalyst Fall 2025 cohort and is a member of NVIDIA Inception.</p></div><div className="milestone-grid"><a href="https://www.techstars.com/blog/program-news/techstars-launches-first-startup-community-partnership-founder-catalyst" rel="noreferrer"><span>Founder development</span><div className="milestone-mark"><TechstarsMark /></div><h3>Techstars Sarajevo Founder Catalyst</h3><p>Selected for the first Sarajevo Startup Community Partnership Founder Catalyst cohort.</p><small>Participation does not imply investment or product validation. ↗</small></a><a href="https://www.nvidia.com/en-us/startups/" rel="noreferrer"><span>Technology ecosystem</span><div className="milestone-mark"><NvidiaInceptionMark /></div><h3>NVIDIA Inception</h3><p>Member of NVIDIA’s startup-support program for companies building with AI.</p><small>Membership does not imply investment, certification, endorsement, or clinical validation. ↗</small></a></div></section>

    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">Operating principles</p><h2>How we want to build.</h2></div></div><div className="workflow-grid"><article className="workflow-step"><span className="step-no">01 · FOCUS</span><h3>Stay close to the workflow.</h3><p>Build from the real work of echo teams, not a generic story about AI.</p></article><article className="workflow-step"><span className="step-no">02 · SHOW</span><h3>Make evidence traceable.</h3><p>Publish sources, methods, versions, limitations, and review dates together.</p></article><article className="workflow-step"><span className="step-no">03 · RESPECT</span><h3>Preserve clinical agency.</h3><p>Design for inspection, correction, rejection, and final sign-off.</p></article></div></section>
    <SplitCta />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }} />
  </>;
}
