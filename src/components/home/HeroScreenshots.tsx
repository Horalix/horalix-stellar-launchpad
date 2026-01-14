import screenshotDashboard from "@/assets/hero/screenshot-dashboard.png";
import screenshotAnalysis from "@/assets/hero/screenshot-analysis.png";
import screenshotSegmentation from "@/assets/hero/screenshot-segmentation.png";

/**
 * HeroScreenshots - Layered 3D screenshot display for hero section
 * Features three product UI screenshots with overlapping corners and depth
 * Includes subtle fade and clinical text block underneath
 */

export const HeroScreenshots = () => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start pt-4 lg:pt-8">
      {/* Screenshot stack container - centered with controlled width */}
      <div className="relative w-full max-w-[660px] mx-auto" style={{ minHeight: "380px" }}>
        
        {/* Screenshot 1: Top-left position - increased size ~20% */}
        <div 
          className="absolute top-0 left-0 w-[72%] z-10 rounded-lg overflow-hidden shadow-xl border border-border/40"
          style={{ 
            transform: "perspective(1200px) rotateY(8deg) rotateX(-2deg)",
            boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.2)"
          }}
        >
          <img
            src={screenshotDashboard}
            alt="Patient Studies Dashboard"
            className="w-full h-auto"
            loading="eager"
          />
        </div>

        {/* Screenshot 2: Center-right position - increased size ~20% */}
        <div 
          className="absolute top-[12%] right-0 w-[78%] z-20 rounded-lg overflow-hidden shadow-2xl border border-border/50"
          style={{ 
            transform: "perspective(1200px) rotateY(-6deg) rotateX(2deg)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 12px 24px -8px rgba(0, 0, 0, 0.25)"
          }}
        >
          <img
            src={screenshotAnalysis}
            alt="AI Measurements Analysis"
            className="w-full h-auto"
            loading="eager"
          />
        </div>

        {/* Screenshot 3: Bottom-left position - increased size ~20% */}
        <div 
          className="absolute top-[28%] left-[8%] w-[66%] z-30 rounded-lg overflow-hidden shadow-2xl border border-border/50"
          style={{ 
            transform: "perspective(1200px) rotateY(10deg) rotateX(-3deg)",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.35), 0 16px 32px -8px rgba(0, 0, 0, 0.25)"
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
            background: "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.8) 40%, transparent 100%)"
          }}
        />
      </div>

      {/* Text block - tight spacing, clinical typography */}
      <div className="relative z-50 w-full max-w-md mx-auto text-center mt-5 px-4">
        {/* Thin divider line for cohesion */}
        <div className="w-10 h-px bg-border mx-auto mb-4" />
        
        {/* Headline - clinical and confident */}
        <h3 className="text-lg font-semibold text-foreground tracking-tight">
          Clinical review, built into the workflow
        </h3>
        
        {/* Supporting line - single sentence, no exaggeration */}
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          DICOM-in, viewer-first, with AI-assisted measurements and visual overlays for fast verification.
        </p>
      </div>
    </div>
  );
};
