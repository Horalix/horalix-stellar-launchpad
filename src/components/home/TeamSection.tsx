import { Link } from "react-router-dom";
import { Users, ExternalLink } from "lucide-react";

// Import team member photos
import affanPhoto from "@/assets/team/affan.jpg";
import kerimPhoto from "@/assets/team/kerim.jpg";
import neumanPhoto from "@/assets/team/neuman.jpg";
import amrPhoto from "@/assets/team/amr.jpg";

/**
 * TeamSection - Displays the founding team members
 * Each member card links to their LinkedIn profile
 */

// Team member data - order: Kerim, Affan, Neuman, Amr
const TEAM_MEMBERS = [
  {
    name: "Kerim Sabic",
    role: "CEO & Co-Founder",
    bio: "Strategic vision. Background in MedTech scaling and enterprise AI architecture.",
    photo: kerimPhoto,
    linkedIn: "https://www.linkedin.com/in/kerims/",
  },
  {
    name: "Affan Kapidzic",
    role: "CTO",
    bio: "Systems architect. Leading development of proprietary diagnostic neural networks.",
    photo: affanPhoto,
    linkedIn: "https://www.linkedin.com/in/affan-kapidzic/",
  },
  {
    name: "Neuman Alkhalil",
    role: "Chief Science Officer",
    bio: "Clinical oversight. Ensuring algorithmic compliance with medical standards.",
    photo: neumanPhoto,
    linkedIn: "https://www.linkedin.com/in/neuman-alkhalil/",
  },
  {
    name: "Amr Husain",
    role: "Co-Founder",
    bio: "Operations lead. Bridging the gap between clinical needs and technical reality.",
    photo: amrPhoto,
    linkedIn: "https://www.linkedin.com/in/amr-husain-6ab6b71b/",
  },
];

export const TeamSection = () => {
  return (
    <section
      id="team"
      className="py-24 px-6 lg:px-12 bg-secondary border-b border-border relative z-10"
    >
      <div className="max-w-7xl mx-auto">
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

        {/* Team members grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, i) => (
            <a
              key={member.name}
              href={member.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-border bg-card hover:border-accent transition-all duration-300"
            >
              {/* Photo area */}
              <div className="aspect-[4/5] w-full overflow-hidden border-b border-border relative grayscale group-hover:grayscale-0 transition-all">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                />
                {/* ID badge overlay */}
                <div className="absolute bottom-0 left-0 bg-card/90 backdrop-blur px-3 py-1 border-t border-r border-border text-[10px] font-mono font-bold uppercase">
                  ID: HX-0{i + 1}
                </div>
                {/* LinkedIn indicator */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-accent text-accent-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4" />
                </div>
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
      </div>
    </section>
  );
};
