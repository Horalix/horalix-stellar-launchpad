import screenshotDashboard from "@/assets/hero/screenshot-dashboard.png";
import screenshotAnalysis from "@/assets/hero/screenshot-analysis.png";
import screenshotSegmentation from "@/assets/hero/screenshot-segmentation.png";

/**
 * HeroScreenshots - Zig-zag collage layout for hero section
 * Three screenshots: top-left, middle-right (front), bottom-left
 * Each screenshot shows meaningful UI with minimal overlap
 */

// Capability chips data
const capabilities = [
  "DICOM Upload",
  "Viewer Overlays", 
  "Audit-ready Export"
];

export const HeroScreenshots = () => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start pt-2 lg:pt-4">
      
      {/* Desktop: Zig-zag collage layout */}
      <div className="hidden md:block relative w-full max-w-[700px] mx-auto h-[420px] overflow-visible">
        
        {/* Screenshot A (back, top-left) */}
        <div 
          className="absolute top-0 left-0 w-[75%] z-10 rounded-lg overflow-hidden border border-border/30"
          style={{ 
            transform: "rotate(-3deg)",
            boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.2), 0 6px 12px -6px rgba(0, 0, 0, 0.12)"
          }}
        >
          <img
            src={screenshotDashboard}
            alt="Patient Studies Dashboard"
            className="w-full h-auto"
            loading="eager"
          />
        </div>

        {/* Screenshot B (front, middle-right, largest) */}
        <div 
          className="absolute top-[70px] right-0 w-[85%] z-30 rounded-lg overflow-hidden border border-border/50"
          style={{ 
            transform: "rotate(2deg)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.28), 0 12px 24px -8px rgba(0, 0, 0, 0.2)"
          }}
        >
          <img
            src={screenshotAnalysis}
            alt="AI Measurements Analysis"
            className="w-full h-auto"
            loading="eager"
          />
        </div>

        {/* Screenshot C (back, bottom-left) */}
        <div 
          className="absolute bottom-0 left-[40px] w-[70%] z-20 rounded-lg overflow-hidden border border-border/40"
          style={{ 
            transform: "rotate(-2deg)",
            boxShadow: "0 18px 40px -10px rgba(0, 0, 0, 0.22), 0 8px 16px -6px rgba(0, 0, 0, 0.15)"
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
          className="absolute bottom-0 left-0 right-0 h-[112px] z-40 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background) / 0.7) 60%, hsl(var(--background)) 100%)"
          }}
        />
      </div>

      {/* Mobile: Single front screenshot (clean, no overlap) */}
      <div className="block md:hidden relative w-full max-w-[90%] mx-auto">
        <div className="rounded-lg overflow-hidden border border-border/50 shadow-xl">
          <img
            src={screenshotAnalysis}
            alt="AI Measurements Analysis"
            className="w-full h-auto"
            loading="eager"
          />
        </div>
      </div>

      {/* Text block - tight spacing, clinical typography */}
      <div className="relative z-50 w-full max-w-md mx-auto text-center mt-5 px-4">
        {/* Thin divider line for cohesion */}
        <div className="w-10 h-px bg-border mx-auto mb-3" />
        
        {/* Headline - clinical and confident */}
        <h3 className="text-lg font-semibold text-foreground tracking-tight">
          Clinical review, built into the workflow
        </h3>
        
        {/* Supporting line - single sentence, no exaggeration */}
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
          DICOM-in, viewer-first, with AI-assisted measurements and visual overlays for fast verification.
        </p>

        {/* Capability chips - compact row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
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
