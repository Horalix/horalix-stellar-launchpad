import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

/**
 * News - News listing page
 * Displays all published news articles from the database
 */

const News = () => {
  // Step 1: Fetch all published articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <MainLayout>
      <div className="pt-32 pb-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Page header */}
          <header className="border-b border-border pb-8 mb-12">
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-4">
              <Newspaper className="w-4 h-4" />
              <span>Press & Updates</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-space tracking-tight">
              News
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              The latest updates, announcements, and insights from Horalix.
            </p>
          </header>

          {/* Articles list */}
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border p-6">
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-8 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="space-y-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/news/${article.slug}`}
                  className="group block bg-card border border-border p-6 md:p-8 hover:border-accent transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Article image (if available) */}
                    {article.image_url && (
                      <div className="md:w-48 md:h-32 shrink-0 overflow-hidden bg-secondary">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground mb-3">
                        <span className="bg-secondary px-2 py-0.5 uppercase">
                          {article.category}
                        </span>
                        {article.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(article.published_at), "MMM d, yyyy")}
                          </span>
                        )}
                        {article.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {article.location}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl md:text-2xl font-bold font-space group-hover:text-accent transition-colors mb-2">
                        {article.title}
                      </h2>

                      {/* Summary */}
                      <p className="text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>

                      {/* Read more */}
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        Read Article
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-16 border border-border">
              <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold font-space mb-2">No Articles Yet</h2>
              <p className="text-muted-foreground">
                Check back soon for the latest updates from Horalix.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default News;
