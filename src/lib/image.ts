// ==========================================
// Image Utilities — resize, compress
// ==========================================
import type { Photo } from '../types/report';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.75;
const THUMBNAIL_SIZE = 200;

/** ย่อรูปอัตโนมัติ: max 1600px ด้านยาวสุด, JPEG quality 0.75 */
export async function processImage(file: File): Promise<Photo> {
  const blob = await resizeImage(file, MAX_DIMENSION, JPEG_QUALITY);
  const thumbnailBlob = await resizeImage(file, THUMBNAIL_SIZE, 0.6);

  return {
    id: crypto.randomUUID(),
    blob,
    thumbnailBlob,
    caption: '',
    takenAt: new Date().toISOString(),
    gps: await getGPS(),
  };
}

async function resizeImage(file: File, maxDim: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

async function getGPS(): Promise<{ lat: number; lng: number } | undefined> {
  try {
    if (!navigator.geolocation) return undefined;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(undefined),
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  } catch {
    return undefined;
  }
}

/** คำนวณขนาดรวมของรูปภาพ */
export function calculateTotalSize(photos: Photo[]): string {
  const totalBytes = photos.reduce((sum, p) => sum + (p.blob?.size || 0), 0);
  if (totalBytes < 1024) return `${totalBytes} B`;
  if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
  return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** สร้าง Object URL จาก Blob */
export function createPhotoURL(photo: Photo): string {
  return URL.createObjectURL(photo.blob);
}

export function createThumbnailURL(photo: Photo): string {
  return URL.createObjectURL(photo.thumbnailBlob || photo.blob);
}
