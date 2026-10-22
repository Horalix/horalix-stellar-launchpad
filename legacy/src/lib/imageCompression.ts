/**
 * Image compression utility
 * Compresses images that exceed size limits before upload
 */

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

/**
 * Compress an image file to reduce its size
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns A compressed file
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = { maxSizeMB: 5, maxWidthOrHeight: 1920, quality: 0.8 }
): Promise<File> => {
  const { maxSizeMB, maxWidthOrHeight = 1920, quality = 0.8 } = options;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Step 1: If already small enough, return original
  if (file.size <= maxSizeBytes) {
    return file;
  }

  // Step 2: Create image element
  const img = await createImageFromFile(file);
  
  // Step 3: Calculate new dimensions
  let { width, height } = img;
  if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
    if (width > height) {
      height = Math.round((height * maxWidthOrHeight) / width);
      width = maxWidthOrHeight;
    } else {
      width = Math.round((width * maxWidthOrHeight) / height);
      height = maxWidthOrHeight;
    }
  }

  // Step 4: Draw to canvas and compress
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }
  
  ctx.drawImage(img, 0, 0, width, height);

  // Step 5: Convert to blob with reduced quality
  const blob = await canvasToBlob(canvas, file.type, quality);
  
  // Step 6: If still too large, try again with lower quality
  if (blob.size > maxSizeBytes && quality > 0.3) {
    const newFile = new File([blob], file.name, { type: file.type });
    return compressImage(newFile, { 
      maxSizeMB, 
      maxWidthOrHeight, 
      quality: quality - 0.1 
    });
  }

  return new File([blob], file.name, { type: file.type });
};

/**
 * Create an HTMLImageElement from a file
 */
const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert canvas to blob
 */
const canvasToBlob = (
  canvas: HTMLCanvasElement, 
  type: string, 
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      type,
      quality
    );
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
