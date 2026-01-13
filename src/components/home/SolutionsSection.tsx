import { Link } from "react-router-dom";
import { ArrowRight, Layers, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ContentSlider } from "@/components/ui/content-slider";
import { Container } from "@/components/layout/Container";

/**
 * SolutionsSection - Displays available clinical solutions
 * Fetches from database with slider for 4+ items
 */

// Step 1: Define solution type
interface Solution {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  icon_name: string;
  badge_text: string | null;
  display_order: number;
}

// Step 2: Helper to get icon component dynamically
const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return icons[iconName] || LucideIcons.Boxes;
};

export const SolutionsSection = () => {
  // Step 3: Fetch solutions from database
  const { data: solutions, isLoading } = useQuery({
    queryKey: ["solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("id, name, slug, short_description, icon_name, badge_text, display_order")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as Solution[];
    },
  });

  // Render individual solution card
  const renderSolutionCard = (solution: Solution, index: number) => {
    const IconComponent = getIconComponent(solution.icon_name);
    
    return (
      <Link
        key={solution.id}
        to={`/solutions/${solution.slug}`}
        className="group border border-border bg-card hover:border-accent transition-all duration-300 flex flex-col h-full"
      >
        {/* Card header with icon */}
        <div className="p-6 border-b border-border bg-secondary/30 relative">
          {/* Index badge */}
          <div className="absolute top-4 right-4 font-mono text-[10px] text-muted-foreground">
            [{String(index + 1).padStart(2, "0")}]
          </div>
          
          <div className="w-12 h-12 border border-accent bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
            <IconComponent className="w-6 h-6" />
          </div>
          
          <h3 className="text-xl font-bold font-space text-primary group-hover:text-accent transition-colors">
            {solution.name}
          </h3>
          
          {solution.badge_text && (
            <Badge 
              variant="outline" 
              className="mt-2 text-[10px] uppercase tracking-wider border-accent text-accent"
            >
              {solution.badge_text}
            </Badge>
          )}
        </div>

        {/* Card body */}
        <div className="p-6 flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
            {solution.short_description}
          </p>
          
          <div className="flex items-center text-xs font-bold uppercase tracking-widest text-accent group-hover:gap-3 gap-2 transition-all">
            <span>View Protocol</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section
      id="solutions"
      className="py-24 bg-secondary border-b border-border relative z-10"
    >
      <Container>
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
              Deployed across 40+ institutions.
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
      </Container>
    </section>
  );
};
