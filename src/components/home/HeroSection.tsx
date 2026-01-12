import { Link } from "react-router-dom";
import { ArrowRight, ScanLine, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContentBatch } from "@/hooks/useSiteContent";

/**
 * HeroSection - Main homepage hero with tagline and CTAs
 * Supports dynamic content from CMS
 */

// Step 1: Default content fallbacks
const DEFAULTS = {
  hero_title: "PRECISION MEDICINE QUANTIFIED.",
  hero_subtitle: "Eliminating margin of error through advanced algorithmic diagnostics. The future of care is binary, precise, and absolute.",
};

export const HeroSection = () => {
  // Step 2: Fetch dynamic content with fallbacks
  const content = useSiteContentBatch(["hero_title", "hero_subtitle"]);

  const heroTitle = content.hero_title || DEFAULTS.hero_title;
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

            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-primary mb-8 leading-[0.9] font-space">
              {heroTitle}
            </h1>

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

        {/* Right data column */}
        <div className="lg:col-span-5 bg-card flex flex-col relative overflow-hidden border-b lg:border-b-0 border-border">
          {/* ECG background decoration */}
          <svg
            className="absolute top-1/2 left-0 w-[200%] h-32 opacity-5 pointer-events-none -translate-y-1/2"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 L20,50 L30,20 L40,80 L50,50 L100,50 L110,50 L120,10 L130,90 L140,50 L400,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className="animate-pulse"
            />
          </svg>

          <div className="p-10 flex-1 flex flex-col justify-center relative">
            {/* Progress bar decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-border">
              <div className="h-full bg-accent w-1/3 animate-marquee" />
            </div>

            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Live Analysis
            </h3>

            <div className="font-mono text-xl md:text-2xl leading-tight mb-8">
              <span className="text-accent mr-2">&gt;&gt;</span>
              AWAITING INPUT STREAM... PATIENT DATA REQUIRED FOR SYNTHESIS.
              <span className="animate-pulse ml-1">_</span>
            </div>

            {/* Mission points */}
            <div className="grid grid-cols-1 gap-4">
              {["ACCURACY", "SPEED", "PRIVACY"].map((point, idx) => (
                <div
                  key={point}
                  className="flex items-center justify-between border-b border-border pb-2 group cursor-default"
                >
                  <span className="font-bold text-sm uppercase group-hover:text-accent transition-colors">
                    {point}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    0{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
