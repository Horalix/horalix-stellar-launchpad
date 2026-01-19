import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Waves, ScanLine, Microscope, Activity, CheckCircle, Bone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";

/**
 * SolutionDetail - Individual solution/product page
 * Fetches solution data from database and displays detailed information
 */

// Icon mapping for dynamic icon rendering
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Waves,
  ScanLine,
  Microscope,
  Activity,
  Bone,
};

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  // Step 1: Fetch solution data from database
  const { data: solution, isLoading, error } = useQuery({
    queryKey: ["solution", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Step 2: Render loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="pt-32 pb-24 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-2/3 mb-4" />
            <Skeleton className="h-6 w-full mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Step 3: Render error/not found state
  if (error || !solution) {
    return (
      <MainLayout>
        {/* Set SEO for not found page */}
        <SEO
          title="Solution Not Found | Horalix"
          description="The solution you're looking for doesn't exist or has been removed."
          canonical={`/solutions/${slug ?? ""}`}
        />
        <div className="pt-32 pb-24 px-6 lg:px-12 text-center">
          <div className="max-w-xl mx-auto">
            <h1 className="text-4xl font-bold font-space mb-4">Solution Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The solution you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/#solutions">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Solutions
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Step 4: Parse specs and features from JSON
  const specs = (solution.specs as Record<string, string>) || {};
  const features = (solution.features as string[]) || [];
  const IconComponent = ICON_MAP[solution.icon_name] || Activity;

  // Metadata for SEO / GEO
  const title = `${solution.name} | Horalix`;
  const description =
    solution.short_description ||
    "Discover more about this innovative solution by Horalix.";
  const canonical = `/solutions/${solution.slug}`;
  // Attempt to extract the first image from image_urls if present
  // Casting to any since image_urls might not be defined on type
  const image =
    Array.isArray((solution as any).image_urls) &&
    (solution as any).image_urls.length > 0
      ? (solution as any).image_urls[0]
      : undefined;
  // Construct structured data for this product
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: solution.name,
    description: solution.short_description,
    image: image ? [image] : undefined,
    url: canonical,
    brand: {
      "@type": "Organization",
      name: "Horalix",
    },
  };
  
  return (
    <MainLayout>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        image={image}
        type="product"
        jsonLd={jsonLd}
      />
      <article className="pt-32 pb-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Back navigation */}
          <Link
            to="/#solutions"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All Solutions
          </Link>

          {/* Header section */}
          <header className="border-b border-border pb-8 mb-12">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-secondary border border-border flex items-center justify-center text-accent shrink-0">
                <IconComponent className="w-8 h-8" />
              </div>

              <div className="flex-1">
                {/* Badge */}
                {solution.badge_text && (
                  <span className="inline-block text-[10px] font-bold bg-accent text-accent-foreground px-2 py-0.5 uppercase mb-3">
                    {solution.badge_text}
                  </span>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold font-space tracking-tight mb-4">
                  {solution.name}
                </h1>

                {/* Short description */}
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {solution.short_description}
                </p>
              </div>
            </div>
          </header>

          {/* Specs grid */}
          {Object.keys(specs).length > 0 && (
            <section className="bg-secondary border border-border p-6 mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-sm">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="border-l-2 border-accent pl-3">
                    <div className="text-xs text-muted-foreground uppercase">{key}</div>
                    <div className="text-primary font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Full description */}
          {solution.full_description && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold font-space mb-6">Overview</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {solution.full_description}
              </div>
            </section>
          )}

          {/* Features list */}
          {features.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold font-space mb-6">Key Features</h2>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA section */}
          <section className="border-t border-border pt-8 mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground">
                Interested in implementing {solution.name} at your facility?
              </p>
              <Link to="/#contact">
                <Button size="lg" className="font-bold uppercase tracking-widest">
                  Request Demo
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </MainLayout>
  );
};

export default SolutionDetail;
