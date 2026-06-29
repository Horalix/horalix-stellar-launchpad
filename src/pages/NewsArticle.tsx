import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Fragment } from "react";
import { Link, useParams } from "react-router-dom";

import SEO from "@/components/SEO";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ImageSlider } from "@/components/ui/image-slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { buildBreadcrumbJsonLd, buildNewsArticleJsonLd, buildSpeakableJsonLd } from "@/lib/structuredData";
import { getFallbackNewsArticleBySlug, mergeNewsArticleWithFallback } from "@/content/homepageFallbacks";
import type { PublicNewsArticle } from "@/content/homepageFallbacks";

const formatNewsArticleDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: queriedArticle, isLoading, error } = useQuery<PublicNewsArticle | null>({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) return null;

      return mergeNewsArticleWithFallback({
        id: data.id,
        slug: data.slug,
        title: data.title,
        summary: data.summary ?? "",
        content: data.content ?? "",
        category: data.category ?? "UPDATE",
        location: data.location ?? null,
        image_urls: Array.isArray(data.image_urls)
          ? data.image_urls.filter((url): url is string => typeof url === "string")
          : [],
        image_focus: Array.isArray(data.image_focus)
          ? data.image_focus.map((focus: { x?: number; y?: number }) => ({
              x: focus?.x ?? 50,
              y: focus?.y ?? 50,
            }))
          : [],
        display_date: data.display_date ?? data.published_at ?? "",
        published_at: data.published_at ?? "",
        updated_at: data.updated_at ?? null,
      });
    },
    enabled: isSupabaseConfigured && !!slug,
    retry: false,
  });

  const fallbackArticle = getFallbackNewsArticleBySlug(slug);
  const article = queriedArticle ?? fallbackArticle;
  const shouldShowLoading = isSupabaseConfigured && isLoading && !queriedArticle && !fallbackArticle;

  if (shouldShowLoading) {
    return (
      <MainLayout>
        {/* [SEO] Prevent stale meta from previous route leaking during loading */}
        <SEO
          title={`${slug ? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Loading"} | Horalix`}
          description="Loading news article from Horalix."
          canonical={`/news/${slug ?? ""}`}
        />
        <article className="px-6 pb-24 pt-24 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <Skeleton className="mb-8 h-6 w-32" />
            <Skeleton className="mb-4 h-12 w-full" />
            <Skeleton className="mb-8 h-6 w-1/2" />
            <Skeleton className="mb-8 h-64 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </article>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <SEO
          title="Article Not Found | Horalix"
          description="The article you are looking for does not exist or has been removed."
          canonical={`/news/${slug ?? ""}`}
          noindex
        />
        <div className="px-6 pb-24 pt-24 text-center lg:px-12">
          <div className="mx-auto max-w-xl border border-border bg-card p-10 shadow-sm">
            <h1 className="font-space text-4xl font-bold text-primary">Article Not Found</h1>
            <p className="mt-4 text-muted-foreground">
              The article you are looking for does not exist or has been removed.
            </p>
            <Button asChild className="mt-6">
              <Link to="/news">Back to News</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const image =
    Array.isArray((article as { image_urls?: string[] }).image_urls) &&
    (article as { image_urls?: string[] }).image_urls?.length
      ? (article as { image_urls?: string[] }).image_urls?.[0]
      : undefined;

  const description =
    article.summary ||
    (typeof article.content === "string" ? article.content.split("\n\n")[0] : "") ||
    "Read this update from Horalix.";

  const jsonLd = [
    buildNewsArticleJsonLd({
      slug: article.slug,
      title: article.title,
      summary: description,
      category: article.category,
      display_date: article.display_date,
      published_at: article.published_at,
      updated_at: article.updated_at,
      image_urls: article.image_urls.length > 0 ? article.image_urls : image ? [image] : undefined,
      keywords: article.keywords,
    }),
    buildSpeakableJsonLd(`https://horalix.com/news/${article.slug}`, [
      "h1",
      "[data-speakable]",
      "article h2",
    ]),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "News", path: "/news" },
      { name: article.title, path: `/news/${article.slug}` },
    ]),
  ];

  const images = article.image_urls;
  const imageFocus = article.image_focus;

  return (
    <MainLayout>
      <SEO
        title={`${article.title} | Horalix`}
        description={description}
        canonical={`/news/${article.slug}`}
        image={image}
        type="article"
        jsonLd={jsonLd}
      />

      <article className="px-6 pb-24 pt-24 lg:px-12">
        <div className="mx-auto max-w-4xl">
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
                  <Link to="/news">News</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{article.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link
            to="/news"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            All News
          </Link>

          <header className="border-b border-border pb-8">
            <span className="inline-flex items-center rounded border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              {article.category}
            </span>

            <h1 className="mt-4 font-space text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {(article.display_date || article.published_at) && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatNewsArticleDate(article.display_date || article.published_at)}
                </span>
              )}
              {article.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {article.location}
                </span>
              )}
            </div>
          </header>

          {images.length > 0 && (
            <ImageSlider images={images} alt={article.title} className="mt-8" imageFocus={imageFocus} />
          )}

          <p className="mt-8 border-l-2 border-accent pl-4 text-lg leading-relaxed text-muted-foreground">
            {article.summary}
          </p>

          <div className="mt-8 space-y-4">
            {renderArticleBlocks(article.content || article.summary)}
          </div>

          <footer className="mt-12 border-t border-border pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline">
                <Link to="/news">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to News
                </Link>
              </Button>
              <Button asChild>
                <Link to="/resources">Browse Resources</Link>
              </Button>
            </div>
          </footer>
        </div>
      </article>
    </MainLayout>
  );
};

const renderArticleBlocks = (content: string) => {
  return content
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const key = `${index}-${block.slice(0, 24)}`;

      const lines = block.split("\n");

      if (lines[0]?.startsWith("## ")) {
        const paragraph = lines.slice(1).join("\n").trim();

        return (
          <Fragment key={key}>
            <h2 className="pt-6 font-space text-2xl font-bold tracking-tight text-primary md:text-3xl">
              {lines[0].slice(3)}
            </h2>
            {paragraph && (
              <p data-speakable className="text-base leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            )}
          </Fragment>
        );
      }

      if (lines.length > 1 && lines.every((line) => line.startsWith("- "))) {
        return (
          <ul key={key} className="space-y-2 border-l border-border pl-5 text-base leading-relaxed text-muted-foreground">
            {lines.map((line) => (
              <li key={line} className="list-disc">
                {line.slice(2)}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={key} data-speakable className="text-base leading-relaxed text-muted-foreground">
          {block}
        </p>
      );
    });
};

export default NewsArticle;
