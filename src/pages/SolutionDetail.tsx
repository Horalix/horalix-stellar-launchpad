import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getResourcesForSolution } from "@/content/authorityData";
import { supabase } from "@/integrations/supabase/client";
import { getSolutionIcon } from "@/lib/solutionIcons";
import { buildBreadcrumbJsonLd } from "@/lib/structuredData";

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: solution, isLoading, error } = useQuery({
    queryKey: ["solution", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <MainLayout>
        {/* [SEO] Prevent stale meta from previous route leaking during loading */}
        <SEO
          title={`${slug ? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Loading"} | Horalix`}
          description="Loading clinical AI workflow solution from Horalix."
          canonical={`/solutions/${slug ?? ""}`}
        />
        <div className="px-6 pb-24 pt-24 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <Skeleton className="mb-8 h-6 w-32" />
            <Skeleton className="mb-4 h-12 w-2/3" />
            <Skeleton className="mb-8 h-6 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !solution) {
    return (
      <MainLayout>
        <SEO
          title="Solution Not Found | Horalix"
          description="The solution you are looking for does not exist or is no longer available."
          canonical={`/solutions/${slug ?? ""}`}
          noindex
        />
        <div className="px-6 pb-24 pt-24 lg:px-12 text-center">
          <div className="mx-auto max-w-xl border border-border bg-card p-10 shadow-sm">
            <h1 className="font-space text-4xl font-bold text-primary">Solution Not Found</h1>
            <p className="mt-4 text-muted-foreground">
              The solution you are looking for does not exist or has been removed.
            </p>
            <Button asChild className="mt-6">
              <Link to="/solutions">Back to Solutions</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const IconComponent = getSolutionIcon(solution.icon_name);
  const specs = (solution.specs as Record<string, string>) || {};
  const features = (solution.features as string[]) || [];
  const relatedResources = getResourcesForSolution(solution.slug).slice(0, 3);
  const image =
    Array.isArray((solution as { image_urls?: string[] }).image_urls) &&
    (solution as { image_urls?: string[] }).image_urls &&
    (solution as { image_urls?: string[] }).image_urls?.length
      ? (solution as { image_urls?: string[] }).image_urls?.[0]
      : undefined;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: solution.name,
      description: solution.short_description,
      url: `https://horalix.com/solutions/${solution.slug}`,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      image: image ? [image] : undefined,
      publisher: {
        "@type": "Organization",
        name: "Horalix",
        url: "https://horalix.com/",
      },
    },
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
      { name: solution.name, path: `/solutions/${solution.slug}` },
    ]),
  ];

  return (
    <MainLayout>
      <SEO
        title={`${solution.name} | Horalix`}
        description={solution.short_description || "Clinical AI workflow software from Horalix."}
        canonical={`/solutions/${solution.slug}`}
        image={image}
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
                  <Link to="/solutions">Solutions</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{solution.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link
            to="/solutions"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            All Solutions
          </Link>

          <header className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-border bg-secondary text-accent">
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                {solution.badge_text && (
                  <span className="inline-flex items-center rounded border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {solution.badge_text}
                  </span>
                )}
                <h1 className="mt-4 font-space text-4xl font-bold tracking-tight text-primary md:text-5xl">
                  {solution.name}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {solution.short_description}
                </p>
              </div>
            </div>

            <aside className="border border-border bg-card p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Product framing
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This page positions the solution as workflow software: faster review, structured outputs,
                and operational repeatability inside clinical delivery.
              </p>
            </aside>
          </header>

          {Object.keys(specs).length > 0 && (
            <section className="mt-10 border border-border bg-card p-6 shadow-sm">
              <h2 className="font-space text-2xl font-bold text-primary">Technical Specifications</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="border border-border bg-background px-4 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {key}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {solution.full_description && (
            <section className="mt-10 border border-border bg-card p-8 shadow-sm">
              <h2 className="font-space text-2xl font-bold text-primary">Overview</h2>
              <div className="mt-5 space-y-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {solution.full_description}
              </div>
            </section>
          )}

          {features.length > 0 && (
            <section className="mt-10 border border-border bg-card p-8 shadow-sm">
              <h2 className="font-space text-2xl font-bold text-primary">Key Features</h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 border border-border bg-background px-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relatedResources.length > 0 && (
            <section className="mt-10 border border-border bg-card p-8 shadow-sm">
              <h2 className="font-space text-2xl font-bold text-primary">Related reading</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {relatedResources.map((resource) => (
                  <Link
                    key={resource.slug}
                    to={`/resources/${resource.slug}`}
                    className="border border-border bg-background px-5 py-5 transition-colors hover:border-accent"
                  >
                    <p className="font-space text-xl font-bold text-primary">{resource.title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{resource.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10 border-t border-border pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground">
                Interested in implementing {solution.name} at your facility?
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline">
                  <Link to="/resources">See Resources</Link>
                </Button>
                <Button asChild>
                  <Link to="/#contact">
                    Request Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </article>
    </MainLayout>
  );
};

export default SolutionDetail;
