import screenshotDashboard from "@/assets/hero/screenshot-dashboard.png";
import screenshotAnalysis from "@/assets/hero/screenshot-analysis.png";
import screenshotSegmentation from "@/assets/hero/screenshot-segmentation.png";

/**
 * HeroScreenshots - Layered 3D screenshot display for hero section
 * Features three product UI screenshots with overlapping corners and depth
 */

export const HeroScreenshots = () => {
  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col p-8">
      {/* Screenshot container with relative positioning for layering */}
      <div className="relative flex-1 max-w-xl mx-auto w-full">
        
        {/* Screenshot 1: Top-left position */}
        <div 
          className="absolute top-0 left-0 w-[60%] z-10 rounded-lg overflow-hidden shadow-xl border border-border/40"
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

        {/* Screenshot 2: Center-right position (overlaps top-left corner) */}
        <div 
          className="absolute top-[12%] right-0 w-[65%] z-20 rounded-lg overflow-hidden shadow-2xl border border-border/50"
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

        {/* Screenshot 3: Bottom-left position (overlaps center screenshot corner) */}
        <div 
          className="absolute top-[38%] left-[8%] w-[55%] z-30 rounded-lg overflow-hidden shadow-2xl border border-border/50"
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

        {/* Bottom fade overlay - starts below screenshots */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[35%] z-40 pointer-events-none"
          style={{
            background: "linear-gradient(to top, hsl(var(--card)) 0%, hsl(var(--card)) 30%, transparent 100%)"
          }}
        />
      </div>

      {/* Placeholder text below screenshots */}
      <div className="relative z-50 text-center mt-auto pb-4">
        <p className="text-lg font-medium text-foreground">
          Placeholder headline text
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Supporting description goes here
        </p>
      </div>
    </div>
  );
};
