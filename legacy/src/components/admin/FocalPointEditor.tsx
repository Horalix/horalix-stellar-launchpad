import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Move } from "lucide-react";

/**
 * FocalPointEditor - Modal for adjusting image focal point with visual crop preview
 * Shows enlarged image with draggable crop frame to set focus point
 */

interface FocalPointEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  focus: { x: number; y: number };
  onFocusChange: (focus: { x: number; y: number }) => void;
  aspectRatio?: number; // width / height of crop area
}

export const FocalPointEditor = ({
  isOpen,
  onClose,
  imageUrl,
  focus,
  onFocusChange,
  aspectRatio = 16 / 9,
}: FocalPointEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localFocus, setLocalFocus] = useState(focus);
  const [isDragging, setIsDragging] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Step 1: Reset focus when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalFocus(focus);
    }
  }, [isOpen, focus]);

  // Step 2: Calculate container and image sizes on load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  };

  // Step 3: Calculate crop box dimensions based on aspect ratio
  const getCropBoxDimensions = () => {
    const containerAspect = containerSize.width / containerSize.height;
    let cropWidth: number, cropHeight: number;

    if (aspectRatio > containerAspect) {
      // Crop box is wider than container
      cropWidth = containerSize.width * 0.6;
      cropHeight = cropWidth / aspectRatio;
    } else {
      // Crop box is taller than container
      cropHeight = containerSize.height * 0.6;
      cropWidth = cropHeight * aspectRatio;
    }

    return { cropWidth, cropHeight };
  };

  // Step 4: Handle drag to move focal point
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateFocusFromEvent(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updateFocusFromEvent(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateFocusFromTouch(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updateFocusFromTouch(e);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Step 5: Update focus from mouse/touch events
  const updateFocusFromEvent = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLocalFocus({ x: Math.round(x), y: Math.round(y) });
  };

  const updateFocusFromTouch = (e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setLocalFocus({ x: Math.round(x), y: Math.round(y) });
  };

  // Step 6: Apply and close
  const handleApply = () => {
    onFocusChange(localFocus);
    onClose();
  };

  const { cropWidth, cropHeight } = getCropBoxDimensions();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[90vw]" aria-describedby="focal-point-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="w-5 h-5" />
            Adjust Crop Focus Point
          </DialogTitle>
          <DialogDescription id="focal-point-description">
            Drag on the image to position the focal point for cropping.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <p className="text-sm text-muted-foreground">
            Drag on the image to position the focal point. The highlighted area shows what will be visible when cropped to 16:9.
          </p>

          {/* Image container with overlay */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Full image preview */}
            <img
              src={imageUrl}
              alt="Focus point editor"
              className="absolute inset-0 w-full h-full object-contain"
              onLoad={handleImageLoad}
              draggable={false}
            />

            {/* Darkened overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Visible crop area (highlight) */}
            <div
              className="absolute border-2 border-accent bg-transparent pointer-events-none"
              style={{
                width: `${cropWidth}px`,
                height: `${cropHeight}px`,
                left: `calc(${localFocus.x}% - ${cropWidth / 2}px)`,
                top: `calc(${localFocus.y}% - ${cropHeight / 2}px)`,
                boxShadow: `0 0 0 9999px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Clear area showing original image */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${containerSize.width}px ${containerSize.height}px`,
                  backgroundPosition: `${-1 * (localFocus.x * containerSize.width / 100 - cropWidth / 2)}px ${-1 * (localFocus.y * containerSize.height / 100 - cropHeight / 2)}px`,
                }}
              />
            </div>

            {/* Center crosshair */}
            <div
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${localFocus.x}%`, top: `${localFocus.y}%` }}
            >
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-accent -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-accent -translate-y-1/2" />
              <div className="absolute left-1/2 top-1/2 w-3 h-3 border-2 border-accent rounded-full -translate-x-1/2 -translate-y-1/2 bg-accent/30" />
            </div>

            {/* Focus coordinates display */}
            <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs font-mono">
              Focus: {localFocus.x}%, {localFocus.y}%
            </div>
          </div>

          {/* Preview of final crop */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Preview (as it will appear):</p>
            <div className="relative w-full max-w-md aspect-video bg-secondary rounded-lg overflow-hidden mx-auto border border-border">
              <img
                src={imageUrl}
                alt="Crop preview"
                className="w-full h-full object-cover"
                style={{ objectPosition: `${localFocus.x}% ${localFocus.y}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              <Check className="w-4 h-4 mr-2" />
              Apply Focus Point
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
