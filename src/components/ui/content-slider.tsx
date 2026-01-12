import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * ContentSlider - Reusable slider component for content grids
 * Shows navigation arrows when content overflows
 */

interface ContentSliderProps {
  children: React.ReactNode;
  className?: string;
  itemsPerView?: number;
}

export const ContentSlider = ({ 
  children, 
  className,
  itemsPerView = 3 
}: ContentSliderProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Step 1: Check scroll position and update button visibility
  const checkScrollability = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Step 2: Initialize scroll check on mount and content changes
  React.useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [checkScrollability, children]);

  // Step 3: Handle scroll events
  const handleScroll = () => {
    checkScrollability();
  };

  // Step 4: Scroll by one item width
  const scrollByAmount = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const itemWidth = container.scrollWidth / React.Children.count(children);
    const scrollAmount = direction === "left" ? -itemWidth : itemWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  const childCount = React.Children.count(children);
  const needsSlider = childCount > itemsPerView;

  return (
    <div className="relative group">
      {/* Step 5: Left navigation button */}
      {needsSlider && canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollByAmount("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-10 w-10 rounded-full bg-card border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
      )}

      {/* Step 6: Scrollable container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth",
          needsSlider && "pb-2",
          className
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {React.Children.map(children, (child) => (
          <div 
            className={cn(
              "flex-shrink-0",
              itemsPerView === 3 && "w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]",
              itemsPerView === 4 && "w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Step 7: Right navigation button */}
      {needsSlider && canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollByAmount("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-10 w-10 rounded-full bg-card border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
      )}
    </div>
  );
};
