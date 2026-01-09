import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

/**
 * NewsArticle - Individual news article page
 * Fetches and displays a single article by slug
 */

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();

  // Step 1: Fetch article data
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Step 2: Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <article className="pt-32 pb-24 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-6 w-32 mb-8" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </article>
      </MainLayout>
    );
  }

  // Step 3: Not found state
  if (error || !article) {
    return (
      <MainLayout>
        <div className="pt-32 pb-24 px-6 lg:px-12 text-center">
          <div className="max-w-xl mx-auto">
            <h1 className="text-4xl font-bold font-space mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/news">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <article className="pt-32 pb-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Back navigation */}
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All News
          </Link>

          {/* Article header */}
          <header className="border-b border-border pb-8 mb-8">
            {/* Category badge */}
            <span className="inline-block text-[10px] font-bold bg-accent text-accent-foreground px-2 py-0.5 uppercase mb-4">
              {article.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-space tracking-tight mb-6">
              {article.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {article.published_at && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(article.published_at), "MMMM d, yyyy")}
                </span>
              )}
              {article.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {article.location}
                </span>
              )}
            </div>
          </header>

          {/* Featured image */}
          {article.image_url && (
            <figure className="mb-8">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full aspect-video object-cover border border-border"
              />
            </figure>
          )}

          {/* Summary (lead paragraph) */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-2 border-accent pl-4">
            {article.summary}
          </p>

          {/* Article content */}
          <div className="prose prose-invert max-w-none">
            {article.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Footer */}
          <footer className="border-t border-border pt-8 mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link to="/news">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to News
                </Button>
              </Link>
              <Link to="/#contact">
                <Button>Contact Us</Button>
              </Link>
            </div>
          </footer>
        </div>
      </article>
    </MainLayout>
  );
};

export default NewsArticle;
