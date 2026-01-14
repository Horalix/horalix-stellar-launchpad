import screenshotDashboard from "@/assets/hero/screenshot-dashboard.png";
import screenshotAnalysis from "@/assets/hero/screenshot-analysis.png";
import screenshotSegmentation from "@/assets/hero/screenshot-segmentation.png";

/**
 * HeroScreenshots - Layered 3D screenshot display for hero section
 * Features three product UI screenshots with staggered depth positioning
 * Back images are clearly visible with meaningful UI shown
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
      {/* Screenshot stack container - centered with controlled width */}
      <div className="relative w-full max-w-[660px] mx-auto" style={{ minHeight: "340px" }}>
        
        {/* Screenshot 1 (Back): Dashboard - offset right and up, scaled down */}
        <div 
          className="absolute z-10 w-[70%] rounded-lg overflow-hidden border border-border/30"
          style={{ 
            top: "0px",
            left: "50%",
            transform: "translateX(-50%) translateX(90px) translateY(-30px) scale(0.92)",
            boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.2), 0 6px 12px -6px rgba(0, 0, 0, 0.15)"
          }}
        >
          <img
            src={screenshotDashboard}
            alt="Patient Studies Dashboard"
            className="w-full h-auto"
            loading="eager"
          />
        </div>

        {/* Screenshot 2 (Middle): Analysis - slight offset, medium scale */}
        <div 
          className="absolute z-20 w-[70%] rounded-lg overflow-hidden border border-border/40"
          style={{ 
            top: "0px",
            left: "50%",
            transform: "translateX(-50%) translateX(40px) translateY(-10px) scale(0.96)",
            boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.2)"
          }}
        >
          <img
            src={screenshotAnalysis}
            alt="AI Measurements Analysis"
            className="w-full h-auto"
            loading="eager"
          />
        </div>

        {/* Screenshot 3 (Front): Segmentation - centered, full scale */}
        <div 
          className="absolute z-30 w-[70%] rounded-lg overflow-hidden border border-border/50"
          style={{ 
            top: "0px",
            left: "50%",
            transform: "translateX(-50%) translateX(0px) translateY(20px) scale(1.0)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 12px 24px -8px rgba(0, 0, 0, 0.25)"
          }}
        >
          <img
            src={screenshotSegmentation}
            alt="AI Segmentations View"
            className="w-full h-auto"
            loading="eager"
          />
        </div>

        {/* Subtle bottom fade overlay - blends into page background */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[112px] z-40 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background) / 0.6) 50%, hsl(var(--background)) 100%)"
          }}
        />
      </div>

      {/* Text block - tight spacing, clinical typography */}
      <div className="relative z-50 w-full max-w-md mx-auto text-center mt-4 px-4">
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
