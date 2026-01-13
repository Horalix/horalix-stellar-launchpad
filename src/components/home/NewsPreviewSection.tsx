import { Link } from "react-router-dom";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ContentSlider } from "@/components/ui/content-slider";
import { Container } from "@/components/layout/Container";

/**
 * NewsPreviewSection - Displays latest news articles on homepage
 * Shows up to 6 articles with slider for 4+ items
 */

// Step 1: Define article type
interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  display_date: string | null;
  published_at: string | null;
  image_urls: string[] | null;
}

export const NewsPreviewSection = () => {
  // Step 2: Fetch latest published articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ["news-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("id, title, slug, summary, category, display_date, published_at, image_urls")
        .eq("is_published", true)
        .order("display_date", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as NewsArticle[];
    },
  });

  // Step 3: Format date helper
  const formatDate = (article: NewsArticle) => {
    const dateStr = article.display_date || article.published_at;
    if (!dateStr) return "No date";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Step 4: Render individual article card
  const renderArticleCard = (article: NewsArticle) => {
    const imageUrl = article.image_urls?.[0];
    
    return (
      <Link
        key={article.id}
        to={`/news/${article.slug}`}
        className="group border border-border bg-card hover:border-accent transition-all duration-300 flex flex-col h-full"
      >
        {/* Image area */}
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden border-b border-border bg-secondary">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Content area */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
              {article.category}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {formatDate(article)}
            </span>
          </div>
          
          <h3 className="text-lg font-bold font-space text-primary group-hover:text-accent transition-colors mb-3 line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {article.summary}
          </p>

          <div className="flex items-center text-xs font-bold uppercase tracking-widest text-accent group-hover:gap-3 gap-2 transition-all">
            <span>Read Report</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section
      id="news"
      className="py-24 bg-card border-b border-border relative z-10"
    >
      <Container>
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
      </Container>
    </section>
  );
};
