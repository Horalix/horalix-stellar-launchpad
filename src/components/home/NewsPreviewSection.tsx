import { Link } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * NewsPreviewSection - Shows the latest 3 news articles on homepage
 * Links to full news listing page
 */

// Sample news data - will be replaced with database fetch
const SAMPLE_NEWS = [
  {
    id: "news-01",
    slug: "future-leaders-summit",
    date: "2024.10.12",
    location: "SARAJEVO, BA",
    category: "EVENT_LOG",
    title: "Future Leaders Summit",
    summary:
      "Horalix leadership engaged with regional innovators to discuss the ethics of algorithmic diagnostics in developing medical infrastructures.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a5093df45?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: "news-02",
    slug: "v42-algorithm-patch",
    date: "2024.09.28",
    location: "BOSTON, MA",
    category: "SYS_UPDATE",
    title: "v4.2 Algorithm Patch",
    summary:
      "Deployment of the new cardiovascular detection node. False positive rates reduced by 14% across all partner clinics.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: "news-03",
    slug: "series-a-funding-secured",
    date: "2024.08.15",
    location: "REMOTE_LINK",
    category: "PRESS_REL",
    title: "Series A Funding Secured",
    summary:
      "Horalix secures $12M in funding to scale operations. Lead investor: Helix Ventures.",
    image:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2670&auto=format&fit=crop",
  },
];

export const NewsPreviewSection = () => {
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

        {/* News cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_NEWS.map((article) => (
            <Link
              key={article.id}
              to={`/news/${article.slug}`}
              className="group cursor-pointer border border-border bg-secondary hover:bg-card hover:border-primary transition-all duration-300 flex flex-col h-full"
            >
              {/* Image area */}
              <div className="aspect-video w-full overflow-hidden border-b border-border relative">
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src={article.image}
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
                  <span>{article.date}</span>
                  <span>{article.location}</span>
                </div>
                <h3 className="text-lg font-bold font-space leading-tight mb-3 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                  {article.summary}
                </p>
                <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  Read Log
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
