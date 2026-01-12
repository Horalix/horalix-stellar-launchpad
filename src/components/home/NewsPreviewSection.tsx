import { Link } from "react-router-dom";
import { Globe, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentSlider } from "@/components/ui/content-slider";
import { format } from "date-fns";

/**
 * NewsPreviewSection - Shows news articles on homepage with slider when > 3
 * Fetches published articles from database
 */

// Step 1: Default placeholder image for articles without images
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2670&auto=format&fit=crop";

export const NewsPreviewSection = () => {
  // Step 2: Fetch published articles from database (no limit for slider)
  const { data: articles, isLoading } = useQuery({
    queryKey: ["homepage-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("id, slug, title, summary, image_url, category, location, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Step 3: Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "---";
    return format(new Date(dateString), "yyyy.MM.dd");
  };

  // Step 4: Render article card
  const renderArticleCard = (article: NonNullable<typeof articles>[number]) => (
    <Link
      key={article.id}
      to={`/news/${article.slug}`}
      className="group cursor-pointer border border-border bg-secondary hover:bg-card hover:border-primary transition-all duration-300 flex flex-col h-full"
    >
      {/* Image area */}
      <div className="aspect-video w-full overflow-hidden border-b border-border relative">
        <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
        <img
          src={article.image_url || PLACEHOLDER_IMAGE}
          alt={article.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-mono font-bold uppercase z-20">
          [{article.category}]
        </div>
      </div>

      {/* Content area */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          <span>{formatDate(article.published_at)}</span>
          <span>{article.location || "GLOBAL"}</span>
        </div>
        <h3 className="text-lg font-bold font-space leading-tight mb-3 group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-6 line-clamp-3 flex-grow">
          {article.summary}
        </p>
        <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          Read Log
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );

  return (
    <section
      id="news"
      className="py-24 px-6 lg:px-12 bg-card border-b border-border relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-4">
              <Globe className="w-4 h-4" />
              <span>System Logs</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-space">
              Intelligence Reports
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/news">
              <Button variant="outline" className="text-xs font-bold uppercase tracking-widest">
                View All Reports
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Step 5: Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* Step 6: Empty state */}
        {!isLoading && (!articles || articles.length === 0) && (
          <div className="text-center py-16 text-muted-foreground font-mono text-sm">
            No intelligence reports available.
          </div>
        )}

        {/* Step 7: News cards with slider when > 3 */}
        {!isLoading && articles && articles.length > 0 && (
          articles.length <= 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(renderArticleCard)}
            </div>
          ) : (
            <ContentSlider itemsPerView={3}>
              {articles.map(renderArticleCard)}
            </ContentSlider>
          )
        )}
      </div>
    </section>
  );
};
