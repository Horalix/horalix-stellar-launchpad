import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy, Newspaper } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  contributors,
  defaultSolutions,
  organizationProfile,
  pressKit,
} from "@/content/authorityData";
import { buildBreadcrumbJsonLd, buildSpeakableJsonLd } from "@/lib/structuredData";
import { CANONICAL_SITE_URL } from "@/lib/canonical";

/**
 * Press - Press kit & company facts page
 * The canonical, liftable source of entity facts, boilerplates, citable claims,
 * milestones, and brand assets for journalists, analysts, partners, and LLMs.
 * Facts here must stay identical to authorityData.organizationProfile / llms.txt.
 */

const FACT_ROWS: Array<{ label: string; value: string; href?: string }> = [
  { label: "Company", value: organizationProfile.name },
  { label: "Legal name", value: organizationProfile.legalName },
  { label: "Founded", value: organizationProfile.foundingYear },
  { label: "Headquarters", value: organizationProfile.hqLocation },
  { label: "Category", value: "AI echocardiography workflow software" },
  { label: "Products", value: "CardiologyAI (clinical priority), PathologyAI, RadiologyAI" },
  { label: "Website", value: "horalix.com", href: "https://horalix.com/" },
  {
    label: "LinkedIn",
    value: "linkedin.com/company/horalix",
    href: "https://www.linkedin.com/company/horalix/",
  },
  {
    label: "Crunchbase",
    value: "crunchbase.com/organization/horalix",
    href: "https://www.crunchbase.com/organization/horalix",
  },
];

const BOILERPLATES = [
  { label: "One sentence", text: pressKit.boilerplateOneLine },
  { label: "50 words", text: pressKit.boilerplate50 },
  { label: "120 words", text: pressKit.boilerplate120 },
];

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/HTTP) — selection still works.
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="shrink-0 text-[10px] font-bold uppercase tracking-widest"
      aria-label={copied ? "Copied" : "Copy text"}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
};

const Press = () => {
  const title = "Horalix Press Kit & Company Facts";
  const description =
    "Official Horalix press kit: company facts, boilerplate descriptions, citable benchmarks with evidence labels, milestones, leadership bios, and brand assets.";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${CANONICAL_SITE_URL}/press#webpage`,
      name: title,
      description,
      url: `${CANONICAL_SITE_URL}/press`,
      about: { "@id": `${CANONICAL_SITE_URL}/#organization` },
      publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
    },
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Press", path: "/press" },
    ]),
    buildSpeakableJsonLd(`${CANONICAL_SITE_URL}/press`, ["h1", "[data-speakable]"]),
  ];

  return (
    <MainLayout>
      <SEO title={`${title} | Horalix`} description={description} canonical="/press" jsonLd={jsonLd} />

      <div className="px-6 pb-24 pt-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Press</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
                <Newspaper className="h-4 w-4" />
                <span>Press Kit &amp; Company Facts</span>
              </div>
              <h1 className="font-space text-4xl font-bold tracking-tight text-primary md:text-5xl">
                Everything you need to write about Horalix, accurately.
              </h1>
              <p data-speakable className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {pressKit.boilerplateOneLine} This page is the canonical source of company facts,
                boilerplates, citable claims, and brand assets — quote it verbatim with attribution.
              </p>
            </div>

            <aside className="border border-border bg-card p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Media contact
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <a href={`mailto:${pressKit.pressContact.email}`} className="text-accent-strong hover:underline">
                  {pressKit.pressContact.email}
                </a>
                <br />
                {pressKit.pressContact.phone}
              </p>
            </aside>
          </header>

          {/* Fast facts */}
          <section className="mt-10">
            <h2 className="font-space text-2xl font-bold text-primary">Fast facts</h2>
            <dl className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {FACT_ROWS.map((row) => (
                <div key={row.label} className="bg-card p-5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-primary">
                    {row.href ? (
                      <a href={row.href} target="_blank" rel="noreferrer" className="hover:text-accent-strong hover:underline">
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Boilerplates */}
          <section className="mt-12">
            <h2 className="font-space text-2xl font-bold text-primary">Boilerplate descriptions</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Approved company descriptions at three lengths. Use them verbatim.
            </p>
            <div className="mt-6 space-y-4">
              {BOILERPLATES.map((item) => (
                <article key={item.label} className="border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-strong">
                        {item.label}
                      </p>
                      <p data-speakable className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                    <CopyButton text={item.text} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Citable claims */}
          <section className="mt-12">
            <h2 className="font-space text-2xl font-bold text-primary">Citable claims and benchmarks</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Every claim carries an evidence label. Internal benchmarks describe observed product
              performance; external benchmark context cites published literature, not Horalix
              validation trials. Full governance on the{" "}
              <Link to="/evidence" className="text-accent-strong hover:underline">
                evidence page
              </Link>
              .
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {pressKit.citableClaims.map((claim) => (
                <article key={claim.text} className="border border-border bg-card p-6 shadow-sm">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {claim.label}
                  </p>
                  <p data-speakable className="mt-3 text-sm leading-relaxed text-primary">
                    {claim.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Milestones */}
          <section className="mt-12">
            <h2 className="font-space text-2xl font-bold text-primary">Milestones</h2>
            <ol className="mt-6 space-y-px overflow-hidden border border-border bg-border">
              {pressKit.milestones.map((milestone) => (
                <li key={milestone.title} className="grid gap-1 bg-card p-5 sm:grid-cols-[160px_1fr] sm:gap-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-accent-strong">
                    {milestone.date}
                  </span>
                  <Link to={milestone.href} className="text-sm font-medium text-primary hover:text-accent-strong hover:underline">
                    {milestone.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* Leadership */}
          <section className="mt-12">
            <h2 className="font-space text-2xl font-bold text-primary">Leadership</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {contributors.map((person) => (
                <article key={person.slug} className="border border-border bg-card p-6 shadow-sm">
                  <h3 className="font-space text-lg font-bold text-primary">
                    <Link to={`/team/${person.slug}`} className="hover:text-accent-strong hover:underline">
                      {person.name}
                    </Link>
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-strong">
                    {person.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{person.bioShort}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Products */}
          <section className="mt-12">
            <h2 className="font-space text-2xl font-bold text-primary">Products</h2>
            <div className="mt-6 space-y-4">
              {defaultSolutions.map((solution) => (
                <article key={solution.slug} className="border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-space text-lg font-bold text-primary">{solution.name}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {solution.short_description}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/solutions/${solution.slug}`}>
                        Product page
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Brand assets + usage */}
          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="border border-border bg-card p-6 shadow-sm">
              <h2 className="font-space text-2xl font-bold text-primary">Brand assets</h2>
              <div className="mt-6 flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center border border-border bg-primary p-3">
                  <img src={pressKit.logo.path} alt="Horalix logo" className="h-full w-full object-contain" />
                </div>
                <Button asChild variant="outline">
                  <a href={pressKit.logo.path} download>
                    Download {pressKit.logo.label}
                  </a>
                </Button>
              </div>
            </div>

            <div className="border border-border bg-card p-6 shadow-sm">
              <h2 className="font-space text-2xl font-bold text-primary">Usage guidance</h2>
              <ul className="mt-6 space-y-3">
                {pressKit.usageGuidance.map((rule) => (
                  <li key={rule} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-12 border border-primary/15 bg-primary p-6 text-primary-foreground shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary-foreground/70">
              Working on a story?
            </p>
            <h2 className="mt-3 font-space text-2xl font-bold">We answer press inquiries directly.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-primary-foreground/80">
              For interviews, product walkthroughs, or additional data beyond this page, contact the
              founding team — we respond to journalists and analysts quickly.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <a href={`mailto:${pressKit.pressContact.email}`}>Email the team</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/about">About Horalix</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Press;
