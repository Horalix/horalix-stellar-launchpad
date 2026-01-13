import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ImageSlider - Hero-style image slider component
 * Displays multiple images with navigation controls
 */
interface ImageSliderProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "wide";
}

export const ImageSlider = ({
  images,
  alt = "Image",
  className,
  aspectRatio = "video",
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // No images
  if (!images || images.length === 0) {
    return null;
  }

  // Single image - no slider needed
  if (images.length === 1) {
    return (
      <figure className={cn("relative overflow-hidden", className)}>
        <img
          src={images[0]}
          alt={alt}
          className={cn(
            "w-full object-cover border border-border",
            aspectRatio === "video" && "aspect-video",
            aspectRatio === "square" && "aspect-square",
            aspectRatio === "wide" && "aspect-[21/9]"
          )}
        />
      </figure>
    );
  }

  // Step 1: Navigate to previous image
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Step 2: Navigate to next image
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Step 3: Navigate to specific image
  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <figure className={cn("relative overflow-hidden group", className)}>
      {/* Image container with transition */}
      <div className="relative">
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className={cn(
            "w-full object-cover border border-border transition-opacity duration-300",
            aspectRatio === "video" && "aspect-video",
            aspectRatio === "square" && "aspect-square",
            aspectRatio === "wide" && "aspect-[21/9]"
          )}
        />

        {/* Previous button */}
        <button
          type="button"
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background border border-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next button */}
        <button
          type="button"
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background border border-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Image counter */}
        <div className="absolute top-2 right-2 bg-background/80 text-xs font-medium px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToIndex(index)}
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
    </figure>
  );
};
