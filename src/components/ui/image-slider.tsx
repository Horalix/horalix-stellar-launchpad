import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageLightbox } from "./image-lightbox";

/**
 * ImageSlider - Hero-style image slider component
 * Supports swipe gestures, auto-play, lightbox, and custom focus points
 */

interface ImageFocus {
  x: number;
  y: number;
}

interface ImageSliderProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "wide";
  autoPlay?: boolean;
  autoPlayInterval?: number;
  imageFocus?: ImageFocus[];
}

export const ImageSlider = ({
  images,
  alt = "Image",
  className,
  aspectRatio = "video",
  autoPlay = true,
  autoPlayInterval = 5000,
  imageFocus = [],
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Touch gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDiff, setTouchDiff] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Step 1: No images
  if (!images || images.length === 0) {
    return null;
  }

  // Step 2: Get focus point for current image
  const getFocusStyle = (index: number) => {
    const focus = imageFocus[index];
    if (!focus) return { objectPosition: "center center" };
    return { objectPosition: `${focus.x}% ${focus.y}%` };
  };

  // Step 3: Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  // Step 4: Auto-play logic
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || isPaused || isHovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, isPaused, isHovered, goToNext, images.length]);

  // Step 5: Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.touches[0].clientX;
    setTouchDiff(touchStart - currentTouch);
  };

  const handleTouchEnd = () => {
    if (touchStart === null) return;

    // Threshold for swipe detection
    if (Math.abs(touchDiff) > 50) {
      if (touchDiff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStart(null);
    setTouchDiff(0);
    setIsSwiping(false);
  };

  // Step 6: Open lightbox
  const handleImageClick = () => {
    setLightboxOpen(true);
  };

  // Single image - no slider needed
  if (images.length === 1) {
    return (
      <>
        <figure className={cn("relative overflow-hidden", className)}>
          <img
            src={images[0]}
            alt={alt}
            onClick={handleImageClick}
            className={cn(
              "w-full object-cover border border-border cursor-pointer hover:opacity-90 transition-opacity",
              aspectRatio === "video" && "aspect-video",
              aspectRatio === "square" && "aspect-square",
              aspectRatio === "wide" && "aspect-[21/9]"
            )}
            style={getFocusStyle(0)}
          />
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground bg-background/60 px-2 py-0.5 rounded">
            Click to enlarge
          </div>
        </figure>
        <ImageLightbox
          images={images}
          initialIndex={0}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={alt}
        />
      </>
    );
  }

  // Step 7: Calculate slider offset for horizontal slide
  const sliderRef = useRef<HTMLDivElement>(null);
  const getSliderOffset = () => {
    const baseOffset = currentIndex * 100;
    if (isSwiping && sliderRef.current) {
      const containerWidth = sliderRef.current.offsetWidth;
      const swipePercent = (touchDiff / containerWidth) * 100;
      return baseOffset + swipePercent;
    }
    return baseOffset;
  };

  return (
    <>
      <figure
        className={cn("relative overflow-hidden group", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slider container with touch support */}
        <div
          ref={sliderRef}
          className={cn(
            "relative overflow-hidden border border-border",
            aspectRatio === "video" && "aspect-video",
            aspectRatio === "square" && "aspect-square",
            aspectRatio === "wide" && "aspect-[21/9]"
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Horizontal image strip */}
          <div
            className={cn(
              "flex h-full",
              isSwiping ? "transition-none" : "transition-transform duration-500 ease-out"
            )}
            style={{ transform: `translateX(-${getSliderOffset()}%)` }}
          >
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${alt} ${index + 1}`}
                onClick={handleImageClick}
                className="w-full h-full flex-shrink-0 object-cover cursor-pointer"
                style={getFocusStyle(index)}
              />
            ))}
          </div>

          {/* Previous button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background border border-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background border border-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Top controls: counter and pause */}
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            {autoPlay && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                className="bg-background/80 hover:bg-background border border-border p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
            )}
            <div className="bg-background/80 text-xs font-medium px-2 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Click to enlarge hint */}
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground bg-background/60 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
            Click to enlarge
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToIndex(index);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-accent w-4"
                    : "bg-background/60 hover:bg-background/80"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </figure>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={alt}
      />
    </>
  );
};
