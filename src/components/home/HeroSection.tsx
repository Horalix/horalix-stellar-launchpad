import { Link } from "react-router-dom";
import { ArrowRight, ScanLine, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContentBatch } from "@/hooks/useSiteContent";
import { TypewriterHeadline } from "./TypewriterHeadline";
import { HeroScreenshots } from "./HeroScreenshots";

/**
 * HeroSection - Main homepage hero with tagline and CTAs
 * Features animated typewriter headline and enterprise slider
 */

// Step 1: Default content fallbacks
const DEFAULTS = {
  hero_subtitle: "Eliminating margin of error through advanced algorithmic diagnostics. The future of care is binary, precise, and absolute.",
};

export const HeroSection = () => {
  // Step 2: Fetch dynamic content with fallbacks
  const content = useSiteContentBatch(["hero_subtitle"]);

  const heroSubtitle = content.hero_subtitle || DEFAULTS.hero_subtitle;

  return (
    <section className="relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-84px)]">
        {/* Left hero content */}
        <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center border-r border-border bg-secondary/30 relative">
          {/* Decorative corner */}
          <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-primary opacity-30" />

          <div className="relative z-10 max-w-2xl">
            {/* Version badge */}
            <div className="inline-flex items-center gap-2 mb-8 border border-primary/20 px-3 py-1 bg-card shadow-sm">
              <Activity className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-primary">
                Diagnostics Suite v4.0
              </span>
            </div>

            {/* Animated typewriter headline */}
            <TypewriterHeadline />

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg border-l-2 border-accent pl-6 py-1">
              {heroSubtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/#contact">
                <Button 
                  size="lg"
                  className="group text-xs font-bold uppercase tracking-widest"
                >
                  <span>Request Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/#solutions">
                <Button 
                  variant="outline"
                  size="lg"
                  className="text-xs font-bold uppercase tracking-widest"
                >
                  <ScanLine className="w-4 h-4" />
                  View Protocols
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right hero screenshots */}
        <div className="lg:col-span-5 bg-card flex flex-col relative overflow-hidden border-b lg:border-b-0 border-border">
          <HeroScreenshots />
        </div>
      </div>
    </section>
  );
};
