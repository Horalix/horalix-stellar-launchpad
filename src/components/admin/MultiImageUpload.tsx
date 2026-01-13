import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X, Plus, GripVertical, Crosshair } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { compressImage, formatFileSize } from "@/lib/imageCompression";
import { useToast } from "@/hooks/use-toast";

/**
 * MultiImageUpload - Component for uploading multiple images
 * Supports drag reordering, compression, and focus point selection
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
  const [focusEditIndex, setFocusEditIndex] = useState<number | null>(null);
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
      if (file.size > maxSize) {
        setIsCompressing(true);
        toast({ title: "Compressing image", description: `${file.name} is being compressed...` });
        try {
          processedFile = await compressImage(file, { maxSizeMB: 5 });
          toast({ title: "Compression complete", description: `Reduced to ${formatFileSize(processedFile.size)}` });
        } catch {
          toast({ variant: "destructive", title: "Compression failed" });
          continue;
        } finally {
          setIsCompressing(false);
        }
      }

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

  // Step 4: Focus point click handler
  const handleFocusClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    const newFocus = [...imageFocus];
    while (newFocus.length <= index) newFocus.push({ x: 50, y: 50 });
    newFocus[index] = { x, y };
    onFocusChange?.(newFocus);
    setFocusEditIndex(null);
  };

  const isBusy = isUploading || isCompressing;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{value.length}/{maxImages} images</span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, index) => {
            const focus = imageFocus[index] || { x: 50, y: 50 };
            const isEditingFocus = focusEditIndex === index;

            return (
              <div
                key={url}
                draggable={!isEditingFocus}
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
                  style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />

                {isEditingFocus ? (
                  <div
                    className="absolute inset-0 cursor-crosshair bg-black/30"
                    onClick={(e) => handleFocusClick(e, index)}
                  >
                    <div
                      className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
                    >
                      <Crosshair className="w-4 h-4 text-accent drop-shadow-lg" />
                    </div>
                    <p className="absolute bottom-1 left-1 right-1 text-[9px] text-white text-center bg-black/50 px-1 py-0.5 rounded">
                      Click to set focus point
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <GripVertical className="absolute top-1 left-1 w-4 h-4 text-foreground" />
                    <button type="button" onClick={() => setFocusEditIndex(index)} className="p-1.5 bg-accent text-accent-foreground rounded-full" title="Set focus point">
                      <Crosshair className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => handleRemove(index)} className="p-1.5 bg-destructive text-destructive-foreground rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-background/80 px-1.5 py-0.5 rounded">{index + 1}</span>
              </div>
            );
          })}
        </div>
      )}

      {value.length < maxImages && (
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isBusy} className="w-full">
          {isBusy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isCompressing ? "Compressing..." : "Uploading..."}</> : <><Plus className="w-4 h-4 mr-2" />Add Images</>}
        </Button>
      )}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} className="hidden" multiple />
      <p className="text-xs text-muted-foreground">Images over 5MB auto-compressed. Drag to reorder, click crosshair to set crop focus.</p>
    </div>
  );
};
