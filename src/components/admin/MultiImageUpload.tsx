import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X, Plus, GripVertical } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { compressImage, formatFileSize } from "@/lib/imageCompression";
import { useToast } from "@/hooks/use-toast";

/**
 * MultiImageUpload - Component for uploading multiple images
 * Supports drag reordering and compression
 */
interface MultiImageUploadProps {
  bucket: "team-photos" | "news-images";
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
}

export const MultiImageUpload = ({
  bucket,
  value,
  onChange,
  label = "Images",
  maxImages = 10,
}: MultiImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading } = useImageUpload(bucket);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Step 1: Handle file selection with compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max images limit
    if (value.length + files.length > maxImages) {
      toast({
        variant: "destructive",
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed.`,
      });
      return;
    }

    const newUrls: string[] = [];

    for (const file of files) {
      let processedFile = file;
      
      // Compress if over 5MB
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setIsCompressing(true);
        toast({
          title: "Compressing image",
          description: `${file.name} (${formatFileSize(file.size)}) is being compressed...`,
        });
        
        try {
          processedFile = await compressImage(file, { maxSizeMB: 5 });
          toast({
            title: "Compression complete",
            description: `Reduced from ${formatFileSize(file.size)} to ${formatFileSize(processedFile.size)}`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Compression failed",
            description: "Could not compress the image. Please try a smaller file.",
          });
          continue;
        } finally {
          setIsCompressing(false);
        }
      }

      const url = await uploadImage(processedFile);
      if (url) {
        newUrls.push(url);
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Step 2: Remove an image
  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  // Step 3: Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newUrls = [...value];
    const [removed] = newUrls.splice(dragIndex, 1);
    newUrls.splice(index, 0, removed);
    onChange(newUrls);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const isBusy = isUploading || isCompressing;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value.length}/{maxImages} images
        </span>
      </div>

      {/* Image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-video bg-secondary rounded-md overflow-hidden group cursor-move border-2 transition-colors ${
                dragIndex === index ? "border-accent" : "border-transparent"
              }`}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="absolute top-1 left-1">
                  <GripVertical className="w-4 h-4 text-foreground" />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Position badge */}
              <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-background/80 px-1.5 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
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

      <p className="text-xs text-muted-foreground">
        Images over 5MB will be automatically compressed. Drag to reorder.
      </p>
    </div>
  );
};
