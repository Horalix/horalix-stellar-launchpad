import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Linkedin, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import { ContentSlider } from "@/components/ui/content-slider";

/**
 * LinkedInSection - Homepage section displaying LinkedIn posts
 * Fetches visible posts from database and renders as cards with external links
 */

export const LinkedInSection = () => {
  // Step 1: Fetch visible LinkedIn posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["homepage-linkedin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Step 2: Don't render section if no posts
  if (!isLoading && (!posts || posts.length === 0)) {
    return null;
  }

  // Step 3: Render post card
  const renderPostCard = (post: NonNullable<typeof posts>[number]) => (
    <a
      key={post.id}
      href={post.post_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group cursor-pointer border border-border bg-secondary hover:bg-card hover:border-primary transition-all duration-300 flex flex-col h-full"
    >
      {/* LinkedIn embed iframe */}
      <div className="aspect-[4/5] w-full overflow-hidden border-b border-border relative bg-background">
        <iframe
          src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${post.post_id}`}
          className="w-full h-full pointer-events-none"
          frameBorder="0"
          allowFullScreen
          title="LinkedIn Post"
        />
        {/* Overlay to make entire card clickable */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-primary/5 transition-colors" />
      </div>

      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Linkedin className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-wider">LinkedIn</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary group-hover:text-accent transition-colors">
          View Post
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </a>
  );

  return (
    <section
      id="social"
      className="py-24 px-6 lg:px-12 bg-secondary/30 border-b border-border relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-4">
              <Linkedin className="w-4 h-4" />
              <span>Social Feed</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-space">
              Latest Updates
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <a
              href="https://www.linkedin.com/company/horalix"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors border border-border hover:border-primary px-4 py-2 rounded"
            >
              Follow on LinkedIn
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* Posts slider */}
        {!isLoading && posts && posts.length > 0 && (
          posts.length <= 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(renderPostCard)}
            </div>
          ) : (
            <ContentSlider itemsPerView={3}>
              {posts.map(renderPostCard)}
            </ContentSlider>
          )
        )}
      </div>
    </section>
  );
};
