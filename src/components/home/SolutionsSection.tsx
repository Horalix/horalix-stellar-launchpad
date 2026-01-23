import { Link } from "react-router-dom";
import { 
  Layers, 
  ArrowRight, 
  Loader2, 
  Activity, 
  Scan, 
  Microscope, 
  HeartPulse, 
  FileText,
  Brain,
  Stethoscope,
  Dna,
  Bone
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentSlider } from "@/components/ui/content-slider";
import type { LucideIcon } from "lucide-react";

/**
 * SolutionsSection - Displays active solutions from database
 * Uses slider when more than 3 items
 */

// Step 1: Icon mapping for supported icons
const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Scan,
  Microscope,
  HeartPulse,
  FileText,
  Brain,
  Stethoscope,
  Dna,
  Layers,
  Bone,
};

const getIconComponent = (iconName: string): LucideIcon => {
  return ICON_MAP[iconName] || Activity;
};

export const SolutionsSection = () => {
  // Step 2: Fetch active solutions from database
  const { data: solutions, isLoading } = useQuery({
    queryKey: ["homepage-solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("id, slug, name, short_description, icon_name, specs, badge_text, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Step 3: Render solution card
  const renderSolutionCard = (solution: NonNullable<typeof solutions>[number]) => {
    const IconComponent = getIconComponent(solution.icon_name);
    const specs = (solution.specs as Record<string, string>) || {};

    return (
      <Link
        key={solution.id}
        to={`/solutions/${solution.slug}`}
        className="group bg-card border border-border p-8 hover:border-accent hover:shadow-lg transition-all relative overflow-hidden h-full flex flex-col"
      >
        {/* Background icon */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconComponent className="w-24 h-24 text-primary" />
        </div>

        {/* Badge if present */}
        {solution.badge_text && (
          <div className="absolute top-4 right-4 text-[10px] font-bold bg-accent text-accent-foreground px-2 py-0.5 uppercase">
            {solution.badge_text}
          </div>
        )}

        {/* Icon */}
        <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center mb-6 text-accent">
          <IconComponent className="w-6 h-6" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold font-space mb-2 group-hover:text-accent transition-colors">
          {solution.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed flex-grow">
          {solution.short_description}
        </p>

        {/* Specs */}
        {Object.keys(specs).length > 0 && (
          <div className="border-t border-border pt-4 space-y-2 font-mono text-xs text-muted-foreground">
            {Object.entries(specs).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className="text-primary">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* View more indicator */}
        <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          View Details
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    );
  };

  return (
    <section
      id="solutions"
      className="py-24 px-6 lg:px-12 bg-secondary border-b border-border relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-4">
              <Layers className="w-4 h-4" />
              <span>Product Ecosystem</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-space">
              Clinical Solutions
            </h2>
          </div>
          <div className="text-right hidden md:block">
            <p className="font-mono text-xs text-muted-foreground max-w-xs">
              Pilots underway with leading regional healthcare providers.
              <br />
              Select a module for specification details.
            </p>
          </div>
        </div>

        {/* Step 4: Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* Step 5: Empty state */}
        {!isLoading && (!solutions || solutions.length === 0) && (
          <div className="text-center py-16 text-muted-foreground font-mono text-sm">
            No solutions available.
          </div>
        )}

        {/* Step 6: Solution cards with slider when > 3 */}
        {!isLoading && solutions && solutions.length > 0 && (
          solutions.length <= 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.map(renderSolutionCard)}
            </div>
          ) : (
            <ContentSlider itemsPerView={3}>
              {solutions.map(renderSolutionCard)}
            </ContentSlider>
          )
        )}
      </div>
    </section>
  );
};
