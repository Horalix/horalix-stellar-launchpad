import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  evidenceSources,
  getContributorBySlug,
  getRelatedResources,
  getResourceBySlug,
} from "@/content/authorityData";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/structuredData";

type SourceId = "S1" | "S2" | "S3";

const ResourceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const resource = getResourceBySlug(slug || "");

  if (!resource) {
    return (
      <MainLayout>
        <SEO
          title="Resource Not Found | Horalix"
          description="The resource you are looking for does not exist."
          canonical={`/resources/${slug ?? ""}`}
          noindex
        />
        <div className="px-6 pb-24 pt-24 lg:px-12">
          <div className="mx-auto max-w-3xl border border-border bg-card p-10 text-center">
            <h1 className="font-space text-4xl font-bold text-primary">Resource Not Found</h1>
            <p className="mt-4 text-muted-foreground">
              The requested resource does not exist or is no longer public.
            </p>
            <Button asChild className="mt-6">
              <Link to="/resources">Back to Resources</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const author = getContributorBySlug(resource.authorSlug);
  const relatedResources = getRelatedResources(resource);
  const sourceMap = evidenceSources as Record<SourceId, { id: SourceId; shortLabel: string; fullLabel: string; url: string }>;

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: resource.title, path: `/resources/${resource.slug}` },
  ];

  const jsonLd = [
    buildArticleJsonLd(resource, author?.name || "Horalix", author?.slug || ""),
    buildBreadcrumbJsonLd(breadcrumbItems),
  ];

  return (
    <MainLayout>
      <SEO
        title={resource.seoTitle}
        description={resource.seoDescription}
        canonical={`/resources/${resource.slug}`}
        type="article"
        jsonLd={jsonLd}
      />

      <article className="px-6 pb-24 pt-24 lg:px-12">
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
                <BreadcrumbLink asChild>
                  <Link to="/resources">Resources</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{resource.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link
            to="/resources"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>

          <header className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  {resource.heroKicker}
                </span>
                <span className="inline-flex items-center rounded border border-border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {resource.audience}
                </span>
              </div>
              <h1 className="font-space text-4xl font-bold tracking-tight text-primary md:text-5xl">
                {resource.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {resource.summary}
              </p>

              {author && (
                <div className="mt-5 text-sm text-muted-foreground">
                  By{" "}
                  <Link to={`/team/${author.slug}`} className="font-medium text-foreground transition-colors hover:text-accent">
                    {author.name}
                  </Link>
                  <span className="mx-2 text-border">/</span>
                  <span>{author.role}</span>
                </div>
              )}
            </div>

            <aside className="border border-border bg-card p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Search intent
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{resource.primaryKeyword}</p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Region scope
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{resource.regionScope}</p>
            </aside>
          </header>

          <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <section className="grid gap-4 md:grid-cols-3">
                {resource.keyTakeaways.map((takeaway) => (
                  <article key={takeaway.label} className="border border-border bg-card p-5 shadow-sm">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {takeaway.label}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{takeaway.text}</p>
                  </article>
                ))}
              </section>

              {resource.sections.map((section) => (
                <section key={section.title} className="border border-border bg-card p-8 shadow-sm">
                  <h2 className="font-space text-2xl font-bold text-primary">{section.title}</h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-base leading-relaxed text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-5 grid gap-3 md:grid-cols-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="border border-border bg-background px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <section className="border border-border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-2">
                  <BookOpenText className="h-5 w-5 text-accent" />
                  <h2 className="font-space text-2xl font-bold text-primary">Evidence context</h2>
                </div>
                <div className="mt-5 space-y-4">
                  {resource.citedClaims.map((claim) => (
                    <div key={claim.text} className="border border-border bg-background px-4 py-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">{claim.text}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {claim.sourceIds.map((sourceId) => {
                          const source = sourceMap[sourceId as SourceId];
                          return (
                            <a
                              key={source.id}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                            >
                              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                                {source.id}
                              </span>
                              <span>{source.shortLabel}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="border border-border bg-card p-6 shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Related reading
                </p>
                <div className="mt-5 space-y-4">
                  {relatedResources.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/resources/${item.slug}`}
                      className="block border border-border bg-background px-4 py-4 transition-colors hover:border-accent"
                    >
                      <p className="font-space text-lg font-bold text-primary">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="border border-primary/15 bg-primary p-6 text-primary-foreground shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary-foreground/70">
                  Next step
                </p>
                <h2 className="mt-3 font-space text-2xl font-bold">{resource.ctaTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                  Move from category reading to a concrete workflow review with the Horalix team.
                </p>
                <div className="mt-6 space-y-3">
                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to="/#contact">
                      Book a Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {resource.solutionSlugs[0] && (
                    <Button asChild variant="outline" className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                      <Link to={`/solutions/${resource.solutionSlugs[0]}`}>View Related Solution</Link>
                    </Button>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </article>
    </MainLayout>
  );
};

export default ResourceDetail;
