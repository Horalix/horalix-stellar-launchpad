import { Link } from "react-router-dom";
import { ArrowRight, FileCheck2 } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { benchmarkDisclosures, evidenceSourceOrder, evidenceSources } from "@/content/authorityData";
import { buildBreadcrumbJsonLd } from "@/lib/structuredData";

type SourceId = "S1" | "S2" | "S3";

const Evidence = () => {
  const sourceMap = evidenceSources as Record<SourceId, { id: SourceId; shortLabel: string; fullLabel: string; url: string }>;
  const sourceOrder = evidenceSourceOrder as SourceId[];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Evidence and Benchmarks",
      description: "Reference page for Horalix benchmark disclosures and external evidence links.",
      url: "https://horalix.com/evidence",
    },
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Evidence", path: "/evidence" },
    ]),
  ];

  return (
    <MainLayout>
      <SEO
        title="Evidence and Benchmarks | Horalix"
        description="Review Horalix benchmark disclosures, external evidence sources, and how the company separates internal benchmarks from external context."
        canonical="/evidence"
        jsonLd={jsonLd}
      />

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
                <BreadcrumbPage>Evidence</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest">
                <FileCheck2 className="h-4 w-4" />
                <span>Evidence and Benchmarks</span>
              </div>
              <h1 className="font-space text-4xl font-bold tracking-tight text-primary md:text-5xl">
                The trust layer behind Horalix product claims.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                This page separates internal product benchmarks from external evidence context so hospitals,
                partners, investors, and LLMs can read the claims with the right level of precision.
              </p>
            </div>

            <aside className="border border-border bg-card p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Governance rule
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Internal measurements stay labeled internal. External literature is linked only where the
                claim is actually supported by the cited source.
              </p>
            </aside>
          </header>

          <section className="mt-10 grid gap-6 md:grid-cols-2">
            {benchmarkDisclosures.map((disclosure) => (
              <article key={disclosure} className="border border-border bg-card p-6 shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Disclosure
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{disclosure}</p>
              </article>
            ))}
          </section>

          <section className="mt-10 space-y-4">
            {sourceOrder.map((sourceId) => {
              const source = sourceMap[sourceId];

              return (
                <article key={source.id} className="border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{source.id}</p>
                      <h2 className="mt-2 font-space text-2xl font-bold text-primary">{source.shortLabel}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{source.fullLabel}</p>
                    </div>

                    <Button asChild variant="outline">
                      <a href={source.url} target="_blank" rel="noreferrer">
                        Open Source
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-10 border border-primary/15 bg-primary p-6 text-primary-foreground shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary-foreground/70">
              Continue
            </p>
            <h2 className="mt-3 font-space text-2xl font-bold">Connect evidence to the workflow story.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-primary-foreground/80">
              The evidence page is strongest when read together with the homepage comparison section,
              the resource hub, and the solution pages that show where the software fits operationally.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/resources">Browse Resources</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/solutions">View Solutions</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Evidence;
