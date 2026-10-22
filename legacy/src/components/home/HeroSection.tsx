import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Activity, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContentBatch } from "@/hooks/useSiteContent";
import { INTERACTIVE_DEMO_PATH } from "@/lib/constants";
import { TypewriterHeadline } from "./TypewriterHeadline";
import { HeroScreenshots } from "./HeroScreenshots";
/**
 * HeroSection - Main homepage hero with tagline and CTAs
 * Features animated typewriter headline and enterprise slider
 */

// Step 1: Default content fallbacks
const DEFAULTS = {
  hero_subtitle:
    "Horalix turns echocardiograms into 50+ structured measurements for fast clinician review — DICOM-compatible, and in active hospital pilots.",
};

export const HeroSection = () => {
  const location = useLocation();
  
  // Step 2: Fetch dynamic content with fallbacks
  const content = useSiteContentBatch(["hero_subtitle"]);

  const heroSubtitle = content.hero_subtitle || DEFAULTS.hero_subtitle;

  // Step 3: Handle smooth scroll for solutions and contact section
  const handleHeroClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("/#") && location.pathname === "/") {
      e.preventDefault();
      const sectionId = href.substring(2);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-84px)]">
        {/* Left hero content */}
        <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center border-r border-border bg-secondary/30 relative overflow-hidden">
          {/* [ART] Atmospheric depth — soft accent glows anchor the focal area */}
          <div
            aria-hidden="true"
            className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/[0.08] blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-40 right-[-10%] h-[24rem] w-[24rem] rounded-full bg-sky-400/[0.07] blur-3xl"
          />
          {/* Decorative corner */}
          <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-primary opacity-30" />

          <div className="relative z-10 max-w-2xl">
            {/* [MOTION] Load-entrance stagger (70ms cadence) — orientation, not
                decoration: the eye lands badge → claim → proof → action.
                Reduced-motion users see everything immediately (index.css). */}
            {/* Category badge — states the wedge up front (5-second test + entity/AEO) */}
            <div className="hero-enter inline-flex items-center gap-2 mb-8 rounded-full border border-accent/25 px-3.5 py-1.5 bg-card/70 backdrop-blur shadow-sm">
              <Activity className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-primary">
                Echocardiography AI
              </span>
            </div>

            {/* Fixed value headline — stable, scannable, names what Horalix does */}
            <h1
              data-speakable
              style={{ "--enter-delay": "70ms" } as React.CSSProperties}
              className="hero-enter text-4xl sm:text-5xl lg:text-6xl font-bold font-space tracking-tight text-primary leading-[1.05] mb-4"
            >
              From echo capture to{" "}
              {/* [ART] Gradient on the payoff phrase — one focal moment per screen */}
              <span className="bg-gradient-to-r from-accent-strong via-accent to-sky-500 bg-clip-text text-transparent">
                report-ready in seconds.
              </span>
            </h1>

            {/* Kinetic tagline — brand flavor only; reduced-motion safe */}
            <div style={{ "--enter-delay": "140ms" } as React.CSSProperties} className="hero-enter">
              <TypewriterHeadline />
            </div>

            {/* Subheadline */}
            <p
              data-speakable
              style={{ "--enter-delay": "210ms" } as React.CSSProperties}
              className="hero-enter text-lg text-muted-foreground mt-6 mb-10 leading-relaxed max-w-lg border-l-2 border-accent pl-6 py-1"
            >
              {heroSubtitle}
            </p>

            {/* CTAs — one primary (experience the product), one secondary (talk to us) */}
            <div
              style={{ "--enter-delay": "280ms" } as React.CSSProperties}
              className="hero-enter flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                className="text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-accent/25"
              >
                <a href={INTERACTIVE_DEMO_PATH}>
                  <MonitorPlay className="w-4 h-4" />
                  Try Interactive Demo
                </a>
              </Button>

              <Link to="/#contact" onClick={(e) => handleHeroClick(e, "/#contact")}>
                <Button
                  variant="outline"
                  size="lg"
                  className="group text-xs font-bold uppercase tracking-widest"
                >
                  <span>Book a Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* [PSYCH][TRUST] Persistent trust strip — surfaces the buyer's de-risking
                signals (compliance, integration, clinician control) above the fold,
                not just on the contact form. */}
            <ul
              style={{ "--enter-delay": "350ms" } as React.CSSProperties}
              className="hero-enter mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
            >
              {[
                "GDPR-aligned",
                "EU data residency",
                "DICOM-compatible",
                "Clinician sign-off",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 shadow-sm backdrop-blur"
                >
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>

            {/* [SIGNATURE] ECG trace — the clinical pulse of the brand, drawn on
                loop. Static line for reduced-motion users (index.css). */}
            <svg
              aria-hidden="true"
              viewBox="0 0 600 40"
              style={{ "--enter-delay": "420ms" } as React.CSSProperties}
              className="hero-enter mt-10 h-8 w-full max-w-lg text-accent/70"
              preserveAspectRatio="none"
            >
              <path
                className="ecg-path"
                d="M0 24 H150 l12 -7 12 7 h60 l8 -18 10 30 8 -34 10 26 6 -11 h70 l10 -6 10 6 h234"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Right hero screenshots */}
        <div
          style={{ "--enter-delay": "200ms" } as React.CSSProperties}
          className="hero-enter lg:col-span-5 bg-card flex flex-col relative overflow-hidden border-b lg:border-b-0 border-border"
        >
          {/* [ART] Glow behind the product collage — the screenshots read as the hero moment */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,hsl(217_91%_65%/0.10),transparent_55%)]"
          />
          <HeroScreenshots />
        </div>
      </div>
    </section>
  );
};
