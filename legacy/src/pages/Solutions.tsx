import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getResourcesForSolution } from "@/content/authorityData";
import { homepageSolutionFallbacks } from "@/content/homepageFallbacks";
import type { HomepageSolution } from "@/content/homepageFallbacks";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { getSolutionIcon } from "@/lib/solutionIcons";
import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/structuredData";

const Solutions = () => {
  const { data: queriedSolutions, isLoading } = useQuery<HomepageSolution[]>({
    queryKey: ["solutions-hub"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []).map((solution, index) => ({
        id: solution.id,
        slug: solution.slug,
        name: solution.name,
        short_description: solution.short_description,
        full_description: solution.full_description ?? null,
        icon_name: solution.icon_name || "Activity",
        specs:
          typeof solution.specs === "object" && solution.specs !== null && !Array.isArray(solution.specs)
            ? Object.fromEntries(Object.entries(solution.specs).map(([key, value]) => [key, String(value)]))
            : {},
        features: Array.isArray(solution.features) ? solution.features.map(String) : [],
        badge_text: solution.badge_text ?? null,
        display_order: solution.display_order ?? index + 1,
      }));
    },
    enabled: isSupabaseConfigured,
    retry: false,
  });

  const cards = queriedSolutions && queriedSolutions.length > 0 ? queriedSolutions : homepageSolutionFallbacks;
  const shouldShowLoading = isSupabaseConfigured && isLoading && !queriedSolutions;

  const jsonLd = [
    buildCollectionWithItemsJsonLd(
      "Horalix Solutions",
      "Explore Horalix clinical AI workflow solutions across cardiology, radiology, and pathology.",
      "/solutions",
      cards.map((s) => ({ name: s.name, path: `/solutions/${s.slug}`, description: s.short_description })),
    ),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
    ]),
  ];

  return (
    <MainLayout>
      <SEO
        title="Solutions | Horalix Clinical AI Workflow"
        description="Explore Horalix clinical AI workflow solutions across cardiology, radiology, and pathology."
        canonical="/solutions"
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
                <BreadcrumbPage>Solutions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest">
                <Layers className="h-4 w-4" />
                <span>Solution Hub</span>
              </div>
              <h1 className="font-space text-4xl font-bold tracking-tight text-primary md:text-5xl">
                Clinical AI workflow products built around real operational bottlenecks.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Horalix positions software inside high-friction clinical workflows where speed,
                structured outputs, and repeatability matter more than isolated model theater.
              </p>
            </div>

            <aside className="border border-border bg-card p-5 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Buyer lens
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Each solution is framed by workflow leverage, reporting readiness, and operational
                standardization rather than abstract AI hype.
              </p>
            </aside>
          </header>

          <section className="mt-10 grid gap-6 lg:grid-cols-3">
            {shouldShowLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border border-border bg-card p-8">
                  <Skeleton className="h-12 w-12 mb-6" />
                  <Skeleton className="h-8 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}

            {!shouldShowLoading &&
              cards.map((solution) => {
                const Icon = getSolutionIcon(solution.icon_name);
                const relatedResources = getResourcesForSolution(solution.slug).slice(0, 2);

                return (
                  <article key={solution.slug} className="group border border-border bg-card p-8 shadow-sm transition-all hover:border-accent">
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex h-14 w-14 items-center justify-center border border-border bg-secondary text-accent">
                        <Icon aria-hidden="true" className="h-7 w-7" />
                      </span>
                      {"badge_text" in solution && solution.badge_text ? (
                        <span className="inline-flex items-center rounded border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                          {solution.badge_text}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-6 font-space text-2xl font-bold text-primary">{solution.name}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {solution.short_description}
                    </p>

                    {relatedResources.length > 0 && (
                      <div className="mt-6 border-t border-border pt-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Related reading
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {relatedResources.map((resource) => (
                            <Link
                              key={resource.slug}
                              to={`/resources/${resource.slug}`}
                              className="inline-flex items-center rounded border border-border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                            >
                              {resource.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8">
                      <Button asChild className="w-full">
                        <Link to={`/solutions/${solution.slug}`}>
                          Explore Solution
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Solutions;
