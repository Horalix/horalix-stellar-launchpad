import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X, Plus, GripVertical, Crop, Trash2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { compressImage, formatFileSize } from "@/lib/imageCompression";
import { useToast } from "@/hooks/use-toast";
import { FocalPointEditor } from "./FocalPointEditor";

/**
 * MultiImageUpload - Component for uploading multiple images
 * Supports drag reordering, compression, and visual focus point editor
 */

interface ImageFocus {
  x: number;
  y: number;
}

interface MultiImageUploadProps {
  bucket: "team-photos" | "news-images";
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
  imageFocus?: ImageFocus[];
  onFocusChange?: (focus: ImageFocus[]) => void;
}

export const MultiImageUpload = ({
  bucket,
  value,
  onChange,
  label = "Images",
  maxImages = 10,
  imageFocus = [],
  onFocusChange,
}: MultiImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading } = useImageUpload(bucket);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [focusEditorIndex, setFocusEditorIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Step 1: Handle file selection with compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (value.length + files.length > maxImages) {
      toast({ variant: "destructive", title: "Too many images", description: `Maximum ${maxImages} images allowed.` });
      return;
    }

    const newUrls: string[] = [];
    const newFocus: ImageFocus[] = [];

    for (const file of files) {
      let processedFile = file;
      const maxSize = 5 * 1024 * 1024;
      
      // Compress large files
      if (file.size > maxSize) {
        setIsCompressing(true);
        toast({ title: "Compressing image", description: `${file.name} is being compressed...` });
        try {
          processedFile = await compressImage(file, { maxSizeMB: 5 });
          toast({ title: "Compression complete", description: `Reduced to ${formatFileSize(processedFile.size)}` });
        } catch (err) {
          console.error("Compression error:", err);
          toast({ variant: "destructive", title: "Compression failed", description: "Could not compress image." });
          continue;
        } finally {
          setIsCompressing(false);
        }
      }

      // Upload image
      const url = await uploadImage(processedFile);
      if (url) {
        newUrls.push(url);
        newFocus.push({ x: 50, y: 50 }); // Default center focus
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
      onFocusChange?.([...imageFocus, ...newFocus]);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Step 2: Remove an image
  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    onFocusChange?.(imageFocus.filter((_, i) => i !== index));
  };

  // Step 3: Drag and drop reordering
  const handleDragStart = (index: number) => setDragIndex(index);
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    
    const newUrls = [...value];
    const [removed] = newUrls.splice(dragIndex, 1);
    newUrls.splice(index, 0, removed);
    onChange(newUrls);

    const newFocus = [...imageFocus];
    const [removedFocus] = newFocus.splice(dragIndex, 1);
    newFocus.splice(index, 0, removedFocus || { x: 50, y: 50 });
    onFocusChange?.(newFocus);
    setDragIndex(index);
  };

  const handleDragEnd = () => setDragIndex(null);

  // Step 4: Update focus for specific image
  const handleFocusUpdate = (index: number, newFocusPoint: ImageFocus) => {
    const newFocus = [...imageFocus];
    while (newFocus.length <= index) newFocus.push({ x: 50, y: 50 });
    newFocus[index] = newFocusPoint;
    onFocusChange?.(newFocus);
  };

  const isBusy = isUploading || isCompressing;
  const focusEditImage = focusEditorIndex !== null ? value[focusEditorIndex] : null;
  const focusEditValue = focusEditorIndex !== null ? imageFocus[focusEditorIndex] || { x: 50, y: 50 } : { x: 50, y: 50 };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{value.length}/{maxImages} images</span>
      </div>

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((url, index) => {
            const focus = imageFocus[index] || { x: 50, y: 50 };

            return (
              <div
                key={`${url}-${index}`}
                className={`relative aspect-video bg-secondary rounded-lg overflow-hidden group border-2 transition-all ${
                  dragIndex === index ? "border-accent scale-105" : "border-transparent hover:border-muted-foreground/30"
                }`}
              >
                {/* Draggable area - only the drag handle triggers drag */}
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="absolute top-1 left-1 p-1.5 bg-background/80 rounded cursor-grab z-10 hover:bg-background transition-colors"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4 text-foreground" />
                </div>

                {/* Image Preview */}
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />

                {/* Image number badge */}
                <span className="absolute bottom-1 right-1 text-xs font-bold bg-background/80 px-2 py-0.5 rounded">
                  {index + 1}
                </span>

                {/* Action buttons - always visible for easier access */}
                <div className="absolute top-1 right-1 flex gap-1 z-10">
                  {/* Adjust Crop button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => setFocusEditorIndex(index)}
                    className="h-7 w-7"
                    title="Adjust crop focus"
                  >
                    <Crop className="w-3.5 h-3.5" />
                  </Button>

                  {/* Delete button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => handleRemove(index)}
                    className="h-7 w-7"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Images Button */}
      {value.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="w-full"
        >
          {isBusy ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isCompressing ? "Compressing..." : "Uploading..."}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Images
            </>
          )}
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Images over 5MB auto-compressed. Drag the grip icon ☰ to reorder. Use the buttons to crop or delete.
      </p>

      {/* Focal Point Editor Modal */}
      {focusEditImage && focusEditorIndex !== null && (
        <FocalPointEditor
          isOpen={true}
          onClose={() => setFocusEditorIndex(null)}
          imageUrl={focusEditImage}
          focus={focusEditValue}
          onFocusChange={(newFocus) => handleFocusUpdate(focusEditorIndex, newFocus)}
        />
      )}
    </div>
  );
};
