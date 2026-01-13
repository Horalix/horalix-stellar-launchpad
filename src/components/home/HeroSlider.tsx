import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Monitor, Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import slidePlaceholder from "@/assets/hero/slide-placeholder.png";

/**
 * HeroSlider - Enterprise-style hero carousel for the right side of the hero section
 * Features auto-rotation, manual navigation, reduced motion support, and hover pause
 */

// Step 1: Configuration
const CONFIG = {
  autoRotateInterval: 7000, // 7 seconds
  transitionDuration: 600,
};

// Step 2: Slide content definitions
const SLIDES = [
  {
    id: 1,
    icon: Monitor,
    title: "Clinical Interface",
    description: "Intuitive dashboard designed for rapid clinical decision-making",
    image: slidePlaceholder,
  },
  {
    id: 2,
    icon: Clock,
    title: "Streamlined Workflow",
    description: "Reduce documentation time while maintaining clinical accuracy",
    image: slidePlaceholder,
  },
  {
    id: 3,
    icon: Layers,
    title: "What the System Delivers",
    bullets: [
      "Structured reporting",
      "Real-time analysis",
      "Seamless integration",
      "Clinical decision support",
    ],
    image: slidePlaceholder,
  },
];

export const HeroSlider = () => {
  // Step 3: State management
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Step 4: Check for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Step 5: Navigation functions
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), CONFIG.transitionDuration);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goToSlide((currentSlide + 1) % SLIDES.length);
  }, [currentSlide, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((currentSlide - 1 + SLIDES.length) % SLIDES.length);
  }, [currentSlide, goToSlide]);

  // Step 6: Auto-rotation logic
  useEffect(() => {
    if (prefersReducedMotion || isHovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(goNext, CONFIG.autoRotateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [goNext, isHovered, prefersReducedMotion]);

  // Step 7: Render slide content
  const renderSlideContent = (slide: typeof SLIDES[0]) => {
    const Icon = slide.icon;

    return (
      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        {/* Icon badge */}
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-sm">
          <Icon className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-medium">
            {slide.title}
          </span>
        </div>

        {/* Description or bullets */}
        {"description" in slide && slide.description && (
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            {slide.description}
          </p>
        )}

        {"bullets" in slide && slide.bullets && (
          <ul className="space-y-1.5 mt-2">
            {slide.bullets.map((bullet, idx) => (
              <li 
                key={idx} 
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="w-1 h-1 bg-accent rounded-full flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative w-full h-full min-h-[400px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Step 8: Slides container */}
      <div className="relative w-full h-full">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity",
              prefersReducedMotion ? "duration-0" : "duration-500 ease-out",
              index === currentSlide ? "opacity-100 z-[1]" : "opacity-0 z-0"
            )}
          >
            {/* Angled screenshot mockup */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                {/* Main screenshot - slightly rotated */}
                <div 
                  className="relative z-10 rounded-lg overflow-hidden shadow-2xl border border-border/50"
                  style={{ transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)" }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-auto"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>

                {/* Secondary screenshot - behind and offset */}
                <div 
                  className="absolute top-4 -left-6 w-[85%] opacity-40 z-0 rounded-lg overflow-hidden shadow-lg border border-border/30"
                  style={{ transform: "perspective(1000px) rotateY(-8deg) rotateX(3deg)" }}
                >
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>

                {/* Tertiary screenshot - further back */}
                <div 
                  className="absolute top-8 -left-10 w-[70%] opacity-20 -z-10 rounded-lg overflow-hidden shadow-md border border-border/20"
                  style={{ transform: "perspective(1000px) rotateY(-10deg) rotateX(4deg)" }}
                >
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card via-card/80 to-transparent z-[2]" />

            {/* Slide content */}
            {renderSlideContent(slide)}
          </div>
        ))}
      </div>

      {/* Step 9: Navigation arrows */}
      <button
        onClick={goPrev}
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 z-20",
          "w-10 h-10 rounded-sm border border-border bg-card/80 backdrop-blur-sm",
          "flex items-center justify-center",
          "text-muted-foreground hover:text-primary hover:border-primary/50",
          "transition-all duration-200",
          "opacity-0 group-hover:opacity-100",
          isHovered && "opacity-100"
        )}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={goNext}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 z-20",
          "w-10 h-10 rounded-sm border border-border bg-card/80 backdrop-blur-sm",
          "flex items-center justify-center",
          "text-muted-foreground hover:text-primary hover:border-primary/50",
          "transition-all duration-200",
          "opacity-0 group-hover:opacity-100",
          isHovered && "opacity-100"
        )}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Step 10: Slide indicators */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentSlide
                ? "bg-accent w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? "true" : "false"}
          />
        ))}
      </div>

      {/* Step 11: Progress bar */}
      {!prefersReducedMotion && !isHovered && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-border z-20">
          <div
            className="h-full bg-accent transition-none"
            style={{
              animation: `progress ${CONFIG.autoRotateInterval}ms linear infinite`,
              animationPlayState: isHovered ? "paused" : "running",
            }}
          />
        </div>
      )}

      {/* Inline keyframes for progress bar */}
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};
