import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, UserRound } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { contributors, getContributorBySlug } from "@/content/authorityData";
import { buildBreadcrumbJsonLd, buildProfilePageJsonLd } from "@/lib/structuredData";

const TeamProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const contributor = getContributorBySlug(slug || "");

  if (!contributor) {
    return (
      <MainLayout>
        <SEO
          title="Profile Not Found | Horalix"
          description="The team profile you are looking for does not exist."
          canonical={`/team/${slug ?? ""}`}
          noindex
        />
        <div className="px-6 pb-24 pt-24 lg:px-12">
          <div className="mx-auto max-w-3xl border border-border bg-card p-10 text-center">
            <h1 className="font-space text-4xl font-bold text-primary">Profile Not Found</h1>
            <p className="mt-4 text-muted-foreground">The requested team profile is not available.</p>
            <Button asChild className="mt-6">
              <Link to="/about">Back to About</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const relatedPeople = contributors.filter((item) => item.slug !== contributor.slug).slice(0, 3);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: contributor.name, path: `/team/${contributor.slug}` },
  ];

  const jsonLd = [
    buildProfilePageJsonLd(contributor),
    buildBreadcrumbJsonLd(breadcrumbItems),
  ];

  return (
    <MainLayout>
      <SEO
        title={`${contributor.name} | ${contributor.role} | Horalix`}
        description={contributor.bioShort}
        canonical={`/team/${contributor.slug}`}
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
                <BreadcrumbLink asChild>
                  <Link to="/about">About</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{contributor.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link
            to="/about"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to About
          </Link>

          <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
            <article className="border border-border bg-card p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-16 w-16 items-center justify-center border border-border bg-secondary text-accent">
                  <UserRound aria-hidden="true" className="h-8 w-8" />
                </span>
                <div>
                  <h1 className="font-space text-4xl font-bold tracking-tight text-primary">{contributor.name}</h1>
                  <p className="mt-2 text-sm uppercase tracking-[0.2em] text-accent">{contributor.role}</p>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
                    {contributor.bioLong}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="border border-border bg-background px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Credentials
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{contributor.credentials}</p>
                </div>
                <div className="border border-border bg-background px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Specialty
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{contributor.specialty}</p>
                </div>
              </div>

              <section className="mt-8">
                <h2 className="font-space text-2xl font-bold text-primary">Focus areas</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {contributor.focusAreas.map((focusArea) => (
                    <span
                      key={focusArea}
                      className="inline-flex items-center rounded border border-border bg-background px-3 py-1 text-sm text-muted-foreground"
                    >
                      {focusArea}
                    </span>
                  ))}
                </div>
              </section>
            </article>

            <aside className="space-y-6">
              <section className="border border-border bg-card p-6 shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Related people
                </p>
                <div className="mt-5 space-y-4">
                  {relatedPeople.map((person) => (
                    <Link
                      key={person.slug}
                      to={`/team/${person.slug}`}
                      className="block border border-border bg-background px-4 py-4 transition-colors hover:border-accent"
                    >
                      <p className="font-space text-lg font-bold text-primary">{person.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent">{person.role}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="border border-primary/15 bg-primary p-6 text-primary-foreground shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary-foreground/70">
                  Continue
                </p>
                <h2 className="mt-3 font-space text-2xl font-bold">See the workflow evidence.</h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                  The strongest picture comes from the contributor pages, the resource hub, and the evidence
                  page working together.
                </p>
                <div className="mt-6 space-y-3">
                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to="/evidence">View Evidence</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                    <Link to="/resources">
                      Browse Resources
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeamProfile;
