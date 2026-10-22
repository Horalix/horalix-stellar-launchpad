import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { contributors, getContributorBySlug, resources } from "@/content/authorityData";
import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/structuredData";

const Resources = () => {
  const jsonLd = [
    buildCollectionWithItemsJsonLd(
      "Horalix Resources",
      "Read Horalix resources on AI echocardiography, echo workflow automation, automated reporting, and clinical AI operations.",
      "/resources",
      resources.map((r) => ({ name: r.title, path: `/resources/${r.slug}`, description: r.summary })),
    ),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Resources", path: "/resources" },
    ]),
  ];

  return (
    <MainLayout>
      <SEO
        title="Resources | AI Echocardiography and Clinical Workflow | Horalix"
        description="Read Horalix resources on AI echocardiography, echo workflow automation, automated reporting, and clinical AI operations."
        canonical="/resources"
        jsonLd={jsonLd}
      />

      <div className="px-6 pb-24 pt-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Resources</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest">
                <BookOpenText className="h-4 w-4" />
                <span>Authority Hub</span>
              </div>
              <h1 className="font-space text-4xl font-bold tracking-tight text-primary md:text-5xl">
                Category pages built around the workflows Horalix actually wants to win.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                This is the educational layer behind the product: AI echocardiography, manual versus
                AI measurement, workflow automation, report readiness, and Europe-first deployment logic.
              </p>
            </div>

            <aside className="border border-border bg-card p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Why this exists
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Search engines and LLMs need more than a homepage. They need a clear topic graph with
                named contributors, precise claims, and internal links across the subject area.
              </p>
            </aside>
          </header>

          <section className="mt-10 grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="grid gap-6 lg:grid-cols-2">
              {resources.map((resource) => {
                const author = getContributorBySlug(resource.authorSlug);

                return (
                  <article key={resource.slug} className="group border border-border bg-card p-8 shadow-sm transition-all hover:border-accent">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                        {resource.heroKicker}
                      </span>
                      <span className="inline-flex items-center rounded border border-border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {resource.regionScope}
                      </span>
                    </div>

                    <h2 className="mt-4 font-space text-2xl font-bold text-primary">{resource.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{resource.summary}</p>

                    <div className="mt-5 grid gap-2">
                      {resource.keyTakeaways.slice(0, 2).map((takeaway) => (
                        <div key={takeaway.label} className="border border-border bg-background px-4 py-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {takeaway.label}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{takeaway.text}</p>
                        </div>
                      ))}
                    </div>

                    {author && (
                      <p className="mt-5 text-xs text-muted-foreground">
                        By{" "}
                        <Link to={`/team/${author.slug}`} className="font-medium text-foreground transition-colors hover:text-accent">
                          {author.name}
                        </Link>
                      </p>
                    )}

                    <div className="mt-6">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/resources/${resource.slug}`}>
                          Read Resource
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit border border-border bg-card p-6 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Contributors
              </p>
              <div className="mt-5 space-y-4">
                {contributors.map((contributor) => (
                  <Link
                    key={contributor.slug}
                    to={`/team/${contributor.slug}`}
                    className="block border border-border bg-background px-4 py-4 transition-colors hover:border-accent"
                  >
                    <p className="font-space text-lg font-bold text-primary">{contributor.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent">{contributor.role}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{contributor.bioShort}</p>
                  </Link>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Resources;
