import screenshotDashboard from "@/assets/hero/screenshot-dashboard.png";
import screenshotAnalysis from "@/assets/hero/screenshot-analysis.png";
import screenshotSegmentation from "@/assets/hero/screenshot-segmentation.png";

/**
 * HeroScreenshots - 60/40 vertical split layout
 * CollageSection (60%): Triangular screenshot arrangement
 * TextSection (40%): Headline, supporting line, capability chips
 */

// Capability chips data
const capabilities = [
  "DICOM Upload",
  "Viewer Overlays", 
  "Audit-ready Export"
];

export const HeroScreenshots = () => {
  return (
    <div className="relative w-full h-full flex flex-col">
      
      {/* ========== COLLAGE SECTION (~60% of height) ========== */}
      <div 
        className="relative flex-[6] w-full flex items-end justify-center overflow-visible"
        style={{ minHeight: "clamp(440px, 38vw, 660px)" }}
      >
        {/* Desktop: Triangular collage layout */}
        <div className="hidden md:block relative w-full max-w-[720px] mx-auto h-full">
          
          {/* Screenshot A (TOP - behind, lowest z-index) */}
          <div 
            className="absolute z-10 w-[68%] rounded-lg overflow-hidden border border-border/30"
            style={{ 
              top: "8%",
              left: "5%",
              transform: "rotate(-2.5deg)",
              boxShadow: "0 12px 28px -8px rgba(0, 0, 0, 0.18), 0 4px 10px -4px rgba(0, 0, 0, 0.1)"
            }}
          >
            <img
              src={screenshotDashboard}
              alt="Patient Studies Dashboard"
              className="w-full h-auto"
              loading="eager"
            />
          </div>

          {/* Screenshot B (MIDDLE - mid z-index) */}
          <div 
            className="absolute z-20 w-[72%] rounded-lg overflow-hidden border border-border/40"
            style={{ 
              top: "22%",
              right: "2%",
              transform: "rotate(2deg)",
              boxShadow: "0 18px 36px -10px rgba(0, 0, 0, 0.22), 0 6px 14px -6px rgba(0, 0, 0, 0.15)"
            }}
          >
            <img
              src={screenshotAnalysis}
              alt="AI Measurements Analysis"
              className="w-full h-auto"
              loading="eager"
            />
          </div>

          {/* Screenshot C (BOTTOM-LEFT - FRONT, highest z-index) */}
          <div 
            className="absolute z-30 w-[65%] rounded-lg overflow-hidden border border-border/50"
            style={{ 
              bottom: "4%",
              left: "8%",
              transform: "rotate(-1.5deg)",
              boxShadow: "0 22px 44px -12px rgba(0, 0, 0, 0.26), 0 10px 20px -8px rgba(0, 0, 0, 0.18)"
            }}
          >
            <img
              src={screenshotSegmentation}
              alt="AI Segmentations View"
              className="w-full h-auto"
              loading="eager"
            />
          </div>

          {/* Subtle bottom fade overlay */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[100px] z-40 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, hsl(var(--card) / 0.8) 60%, hsl(var(--card)) 100%)"
            }}
          />
        </div>

        {/* Mobile: Single screenshot */}
        <div className="block md:hidden relative w-full max-w-[90%] mx-auto px-4 pb-4">
          <div className="rounded-lg overflow-hidden border border-border/50 shadow-xl">
            <img
              src={screenshotAnalysis}
              alt="AI Measurements Analysis"
              className="w-full h-auto"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* ========== TEXT SECTION (~40% of height) ========== */}
      <div className="relative z-50 flex-[4] w-full flex flex-col items-center justify-start pt-6 lg:pt-8 px-4">
        {/* Thin divider line for cohesion */}
        <div className="w-10 h-px bg-border mb-4" />
        
        {/* Headline - clinical and confident */}
        <h3 className="text-lg font-semibold text-foreground tracking-tight text-center">
          Clinical review, built into the workflow
        </h3>
        
        {/* Supporting line - single sentence, no exaggeration */}
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm text-center">
          DICOM-in, viewer-first, with AI-assisted measurements and visual overlays for fast verification.
        </p>

        {/* Capability chips - compact row */}
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
