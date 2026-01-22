import { useState } from "react";
import screenshotDashboard from "@/assets/hero/screenshot-dashboard.png";
import screenshotAnalysis from "@/assets/hero/screenshot-analysis.png";
import screenshotSegmentation from "@/assets/hero/screenshot-segmentation.png";

/**
 * HeroScreenshots
 * - Desktop/tablet: stacked collage with click-to-front
 * - Mobile: single screenshot
 */

type ShotId = "dashboard" | "analysis" | "segmentation";

const capabilities = ["DICOM Upload", "Viewer Overlays", "Audit-ready Export"];

export const HeroScreenshots = () => {
  const [active, setActive] = useState<ShotId>("analysis");

  const makeKeyHandlers =
    (id: ShotId) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(id);
      }
    };

  const z = (id: ShotId, base: string) => (active === id ? "z-50" : base);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* ========== COLLAGE SECTION ========== */}
      <div className="relative w-full flex items-center justify-center overflow-hidden md:overflow-visible py-6 md:py-0 min-h-[300px] sm:min-h-[340px] md:min-h-[420px] lg:min-h-[520px]">
        {/* Desktop/Tablet collage */}
        <div className="hidden md:block relative w-full max-w-[720px] mx-auto aspect-[16/11]">
          {/* Screenshot A */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Bring Patient Studies Dashboard screenshot to front"
            onClick={() => setActive("dashboard")}
            onKeyDown={makeKeyHandlers("dashboard")}
            className={[
              "absolute top-[8%] left-[5%] w-[68%] aspect-[16/10]",
              "rounded-lg overflow-hidden bg-card border border-border/30",
              "cursor-pointer select-none",
              "transition-transform duration-200 ease-out",
              "hover:-translate-y-1 hover:scale-[1.01]",
              "focus:outline-none focus:ring-2 focus:ring-accent/40",
              "rotate-[-2.5deg]",
              "shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18),0_4px_10px_-4px_rgba(0,0,0,0.10)]",
              z("dashboard", "z-10"),
              active === "dashboard" ? "scale-[1.02]" : "",
            ].join(" ")}
          >
            <img
              src={screenshotDashboard}
              alt="Patient Studies Dashboard"
              className="w-full h-full object-cover object-top block"
              loading="eager"
            />
          </div>

          {/* Screenshot B */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Bring AI Measurements Analysis screenshot to front"
            onClick={() => setActive("analysis")}
            onKeyDown={makeKeyHandlers("analysis")}
            className={[
              "absolute top-[22%] right-[2%] w-[72%] aspect-[16/10]",
              "rounded-lg overflow-hidden bg-card border border-border/40",
              "cursor-pointer select-none",
              "transition-transform duration-200 ease-out",
              "hover:-translate-y-1 hover:scale-[1.01]",
              "focus:outline-none focus:ring-2 focus:ring-accent/40",
              "rotate-[2deg]",
              "shadow-[0_18px_36px_-10px_rgba(0,0,0,0.22),0_6px_14px_-6px_rgba(0,0,0,0.15)]",
              z("analysis", "z-20"),
              active === "analysis" ? "scale-[1.02]" : "",
            ].join(" ")}
          >
            <img
              src={screenshotAnalysis}
              alt="AI Measurements Analysis"
              className="w-full h-full object-cover object-top block"
              loading="eager"
            />
          </div>

          {/* Screenshot C */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Bring AI Segmentations View screenshot to front"
            onClick={() => setActive("segmentation")}
            onKeyDown={makeKeyHandlers("segmentation")}
            className={[
              "absolute bottom-[6%] left-[8%] w-[65%] aspect-[16/10]",
              "rounded-lg overflow-hidden bg-card border border-border/50",
              "cursor-pointer select-none",
              "transition-transform duration-200 ease-out",
              "hover:-translate-y-1 hover:scale-[1.01]",
              "focus:outline-none focus:ring-2 focus:ring-accent/40",
              "rotate-[-1.5deg]",
              "shadow-[0_22px_44px_-12px_rgba(0,0,0,0.26),0_10px_20px_-8px_rgba(0,0,0,0.18)]",
              z("segmentation", "z-30"),
              active === "segmentation" ? "scale-[1.02]" : "",
            ].join(" ")}
          >
            <img
              src={screenshotSegmentation}
              alt="AI Segmentations View"
              className="w-full h-full object-cover object-top block"
              loading="eager"
            />
          </div>

          {/* Fade into the background (kept subtle) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[72px] z-40 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, hsl(var(--card) / 0.65) 55%, hsl(var(--card)) 100%)",
            }}
          />
        </div>

        {/* Mobile: Single screenshot */}
        <div className="block md:hidden relative w-full max-w-[92%] mx-auto px-4">
          <div className="rounded-lg overflow-hidden border border-border/50 shadow-xl bg-card aspect-[16/10]">
            <img
              src={screenshotAnalysis}
              alt="AI Measurements Analysis"
              className="w-full h-full object-cover object-top block"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* ========== TEXT SECTION ========== */}
      <div className="relative z-50 w-full flex flex-col items-center justify-start pt-6 lg:pt-8 px-4 pb-6">
        <div className="w-10 h-px bg-border mb-4" />

        <h3 className="text-lg font-semibold text-foreground tracking-tight text-center">
          Clinical review, built into the workflow
        </h3>

        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm text-center">
          Designed for real deployments, with clear overlays and audit-friendly outputs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {capabilities.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/50 border border-border/60 rounded-full"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
