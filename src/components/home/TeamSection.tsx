import { Users, Loader2, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Container } from "@/components/layout/Container";

// Import local team photos as fallbacks
import affanPhoto from "@/assets/team/affan.jpg";
import amrPhoto from "@/assets/team/amr.jpg";
import kerimPhoto from "@/assets/team/kerim.jpg";
import neumanPhoto from "@/assets/team/neuman.jpg";

/**
 * TeamSection - Displays team members
 * Fetches from database with local photo fallbacks
 */

// Step 1: Define team member type
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  display_order: number;
}

// Step 2: Map for local photo fallbacks
const localPhotoMap: Record<string, string> = {
  affan: affanPhoto,
  amr: amrPhoto,
  kerim: kerimPhoto,
  neuman: neumanPhoto,
};

export const TeamSection = () => {
  // Step 3: Fetch active team members
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  // Helper to get photo URL with fallback
  const getPhotoUrl = (photoUrl: string | null): string => {
    if (photoUrl) return photoUrl;
    // Return first available local photo as generic fallback
    return affanPhoto;
  };

  return (
    <section
      id="team"
      className="py-24 bg-secondary border-b border-border relative z-10"
    >
      <Container>
        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-4">
            <Users className="w-4 h-4" />
            <span>Personnel Manifest</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-space">
            Leadership
          </h2>
        </div>

        {/* Step 3: Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* Step 4: Empty state */}
        {!isLoading && (!teamMembers || teamMembers.length === 0) && (
          <div className="text-center py-16 text-muted-foreground font-mono text-sm">
            No team members available.
          </div>
        )}

        {/* Step 5: Team members grid */}
        {!isLoading && teamMembers && teamMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <a
                key={member.id}
                href={member.linkedin_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-border bg-card hover:border-accent transition-all duration-300"
              >
                {/* Photo area */}
                <div className="aspect-[4/5] w-full overflow-hidden border-b border-border relative grayscale group-hover:grayscale-0 transition-all">
                  <img
                    src={getPhotoUrl(member.photo_url)}
                    alt={member.name}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* ID badge overlay */}
                  <div className="absolute bottom-0 left-0 bg-card/90 backdrop-blur px-3 py-1 border-t border-r border-border text-[10px] font-mono font-bold uppercase">
                    ID: HX-0{i + 1}
                  </div>
                  {/* LinkedIn indicator */}
                  {member.linkedin_url && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-accent text-accent-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Info section */}
                <div className="p-6">
                  <h4 className="font-space font-bold text-lg mb-1 group-hover:text-accent transition-colors">
                    {member.name}
                  </h4>
                  <div className="text-xs font-mono text-accent uppercase mb-4 tracking-wider">
                    {member.role}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {member.bio}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};
