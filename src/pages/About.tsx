import { Link } from "react-router-dom";
import { ArrowRight, Building2, ShieldCheck, Users } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { contributors, organizationProfile } from "@/content/authorityData";
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildPersonJsonLd,
} from "@/lib/structuredData";

const About = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": "https://horalix.com/about#aboutpage",
      name: "About Horalix",
      description: organizationProfile.description,
      url: "https://horalix.com/about",
      publisher: { "@id": "https://horalix.com/#organization" },
    },
    buildOrganizationJsonLd(),
    ...contributors.map((c) => buildPersonJsonLd(c)),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  ];

  return (
    <MainLayout>
      <SEO
        title="About | Horalix Clinical AI Infrastructure"
        description="Learn what Horalix builds, who leads the company, and how it approaches clinical AI workflow trust."
        canonical="/about"
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
                <BreadcrumbPage>About</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest">
                <Building2 className="h-4 w-4" />
                <span>About Horalix</span>
              </div>
              <h1 className="font-space text-4xl font-bold tracking-tight text-primary md:text-5xl">
                Clinical AI infrastructure built around real reporting and measurement friction.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {organizationProfile.description} {organizationProfile.regionFocus}
              </p>
            </div>

            <aside className="border border-border bg-card p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Company posture
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Horalix focuses on workflow leverage, defensible benchmarks, and trust-first positioning
                rather than broad claims about solving all of medical AI.
              </p>
            </aside>
          </header>

          <section className="mt-10 grid gap-6 lg:grid-cols-3">
            <article className="border border-border bg-card p-6 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <h2 className="mt-4 font-space text-2xl font-bold text-primary">Trust by design</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Internal benchmarks are labeled clearly, external benchmark context is cited precisely, and
                workflow claims stay tied to defensible operational outcomes.
              </p>
            </article>

            <article className="border border-border bg-card p-6 shadow-sm">
              <Users className="h-6 w-6 text-accent" />
              <h2 className="mt-4 font-space text-2xl font-bold text-primary">Built by operators</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The team spans product, engineering, science, finance, and healthcare context so the
                software is grounded in deployment reality rather than demo-only AI.
              </p>
            </article>

            <article className="border border-border bg-card p-6 shadow-sm">
              <Building2 className="h-6 w-6 text-accent" />
              <h2 className="mt-4 font-space text-2xl font-bold text-primary">Europe-first clarity</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The company speaks in precise workflow language, which is the right foundation for trust,
                partnerships, and later multilingual expansion across Europe.
              </p>
            </article>
          </section>

          <section className="mt-12 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="grid gap-6 md:grid-cols-2">
              {contributors.map((contributor) => (
                <article key={contributor.slug} className="border border-border bg-card p-6 shadow-sm">
                  <p className="font-space text-2xl font-bold text-primary">{contributor.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent">{contributor.role}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{contributor.bioShort}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{contributor.credentials}</p>
                  <Button asChild variant="outline" className="mt-6 w-full">
                    <Link to={`/team/${contributor.slug}`}>
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </article>
              ))}
            </div>

            <aside className="border border-primary/15 bg-primary p-6 text-primary-foreground shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary-foreground/70">
                Next step
              </p>
              <h2 className="mt-3 font-space text-2xl font-bold">Review the trust and evidence layer.</h2>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                The fastest way to understand Horalix is to look at the workflow proof, the evidence page,
                and the named contributor pages together.
              </p>
              <div className="mt-6 space-y-3">
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/evidence">View Evidence</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/resources">Browse Resources</Link>
                </Button>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
