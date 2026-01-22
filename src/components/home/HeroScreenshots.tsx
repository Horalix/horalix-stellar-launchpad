import { useMemo, useState } from "react";
import screenshotDashboard from "@/assets/hero/screenshot-dashboard.png";
import screenshotAnalysis from "@/assets/hero/screenshot-analysis.png";
import screenshotSegmentation from "@/assets/hero/screenshot-segmentation.png";

/**
 * HeroScreenshots
 * - Desktop/tablet: stacked collage with click-to-front + shuffle
 * - Mobile: single screenshot
 */

type ShotId = "dashboard" | "analysis" | "segmentation";

const capabilities = ["DICOM Upload", "Viewer Overlays", "Audit-ready Export"];

export const HeroScreenshots = () => {
  /**
   * Order maps 1:1 to slots:
   * index 0 -> top-left (back)
   * index 1 -> middle-right (mid)
   * index 2 -> bottom-left (front)  ✅ always most visible by default
   */
  const [order, setOrder] = useState<ShotId[]>([
    "dashboard",
    "analysis",
    "segmentation", // front by default
  ]);

  const bringToFront = (id: ShotId) => {
    setOrder((prev) => {
      const next = prev.filter((x) => x !== id);
      next.push(id); // last item becomes the front slot
      return next;
    });
  };

  const makeKeyHandlers =
    (id: ShotId) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        bringToFront(id);
      }
    };

  const slots = useMemo(
    () => [
      // slot 0: top-left (back)
      {
        className: "top-[8%] left-[5%] w-[68%] rotate-[-2.5deg] z-10",
        shadow:
          "shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18),0_4px_10px_-4px_rgba(0,0,0,0.10)]",
        border: "border-border/30",
      },
      // slot 1: middle-right (mid)
      {
        className: "top-[22%] right-[2%] w-[72%] rotate-[2deg] z-20",
        shadow:
          "shadow-[0_18px_36px_-10px_rgba(0,0,0,0.22),0_6px_14px_-6px_rgba(0,0,0,0.15)]",
        border: "border-border/40",
      },
      // slot 2: bottom-left (front) ✅
      {
        className: "bottom-[6%] left-[8%] w-[65%] rotate-[-1.5deg] z-30",
        shadow:
          "shadow-[0_22px_44px_-12px_rgba(0,0,0,0.26),0_10px_20px_-8px_rgba(0,0,0,0.18)]",
        border: "border-border/60",
      },
    ],
    []
  );

  const shots: Record<ShotId, { src: string; alt: string }> = {
    dashboard: { src: screenshotDashboard, alt: "Patient Studies Dashboard" },
    analysis: { src: screenshotAnalysis, alt: "AI Measurements Analysis" },
    segmentation: { src: screenshotSegmentation, alt: "AI Segmentations View" },
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* ========== COLLAGE SECTION ========== */}
      <div className="relative w-full flex items-center justify-center overflow-hidden md:overflow-visible py-6 md:py-0 min-h-[300px] sm:min-h-[340px] md:min-h-[420px] lg:min-h-[520px]">
        {/* Desktop/Tablet collage */}
        <div className="hidden md:block relative w-full max-w-[720px] mx-auto aspect-[16/11]">
          {order.map((id, idx) => {
            const slot = slots[idx];
            const isFront = idx === 2; // bottom-left slot

            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                aria-label={`Bring ${shots[id].alt} to front`}
                onClick={() => bringToFront(id)}
                onKeyDown={makeKeyHandlers(id)}
                className={[
                  "absolute aspect-[16/10] rounded-lg overflow-hidden bg-card",
                  "border cursor-pointer select-none",
                  // Smooth “deck shuffle” feel:
                  "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  // Hover polish:
                  "hover:-translate-y-1 hover:scale-[1.01]",
                  "focus:outline-none focus:ring-2 focus:ring-accent/40",
                  slot.className,
                  slot.shadow,
                  `border ${slot.border}`,
                  isFront ? "opacity-100" : "opacity-95",
                ].join(" ")}
              >
                <img
                  src={shots[id].src}
                  alt={shots[id].alt}
                  className="w-full h-full object-cover object-top block"
                  loading="eager"
                />
              </div>
            );
          })}

          {/* Bottom fade (kept subtle + no solid slab) */}
          <div className="absolute bottom-0 left-0 right-0 h-14 z-40 pointer-events-none bg-gradient-to-b from-transparent via-background/25 to-transparent" />
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
