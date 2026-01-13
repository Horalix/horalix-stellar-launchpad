import { ArrowRight, Linkedin, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ContentSlider } from "@/components/ui/content-slider";
import { Container } from "@/components/layout/Container";

/**
 * LinkedInSection - Displays recent LinkedIn posts
 * Shows embedded posts with slider for 4+ items
 */

// Step 1: Define post type
interface LinkedInPost {
  id: string;
  post_id: string;
  post_url: string;
  post_date: string | null;
  display_order: number;
}

export const LinkedInSection = () => {
  // Step 2: Fetch visible posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["linkedin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .select("id, post_id, post_url, post_date, display_order")
        .eq("is_visible", true)
        .order("display_order");

      if (error) throw error;
      return data as LinkedInPost[];
    },
  });

  // Step 3: Render post card with embedded preview
  const renderPostCard = (post: LinkedInPost) => {
    return (
      <div
        key={post.id}
        className="border border-border bg-card hover:border-accent transition-all duration-300 flex flex-col h-full"
      >
        {/* Embedded post preview (simplified - actual embed would need LinkedIn API) */}
        <div className="aspect-square w-full bg-secondary/50 border-b border-border flex items-center justify-center">
          <div className="text-center p-6">
            <Linkedin className="w-12 h-12 text-accent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-mono">
              LinkedIn Post
            </p>
          </div>
        </div>

        {/* Post link */}
        <div className="p-4">
          <a
            href={post.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs font-bold uppercase tracking-widest text-accent hover:gap-3 gap-2 transition-all"
          >
            <span>View Post</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <section
      id="social"
      className="py-24 bg-secondary/30 border-b border-border relative z-10"
    >
      <Container>
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
      </Container>
    </section>
  );
};
