// ==========================================
// PhotoCapture — ถ่ายรูป/เลือกรูป จัดเป็น grid
// ==========================================
import React, { useRef, useState } from 'react';
import type { Photo } from '../types/report';
import { processImage, calculateTotalSize, createThumbnailURL, createPhotoURL } from '../lib/image';

interface PhotoCaptureProps {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  label?: string;
  category?: string;
}

export default function PhotoCapture({ photos, onChange, label = 'รูปภาพ', category }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsProcessing(true);
    try {
      const newPhotos: Photo[] = [];
      for (let i = 0; i < files.length; i++) {
        const photo = await processImage(files[i]);
        if (category) {
          photo.category = category;
          if (!photo.caption) {
            photo.caption = category;
          }
        }
        newPhotos.push(photo);
      }
      onChange([...photos, ...newPhotos]);
    } catch (err) {
      console.error('Error processing image:', err);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter(p => p.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(photos.map(p => p.id === id ? { ...p, caption } : p));
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length) return;
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, moved);
    onChange(newPhotos);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-bold text-slate-300">{label}</label>
        <span className="text-xs text-slate-500">
          {photos.length} รูป • {calculateTotalSize(photos)}
        </span>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative group">
              <div
                className="aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer border-2 border-slate-200 hover:border-blue-500 transition-colors"
                onClick={() => setViewingPhoto(photo)}
              >
                <img
                  src={createThumbnailURL(photo) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/></svg>'}
                  alt={photo.caption || `รูปที่ ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Controls overlay */}
              <div className="absolute top-1 right-1 flex gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); movePhoto(index, index - 1); }}
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow text-xs text-slate-700"
                  >←</button>
                )}
                {index < photos.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); movePhoto(index, index + 1); }}
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow text-xs text-slate-700"
                  >→</button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                  className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow text-xs font-bold"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Capture Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.setAttribute('capture', 'environment');
              inputRef.current.click();
            }
          }}
          disabled={isProcessing}
          className="flex-1 min-h-touch px-4 py-3 bg-blue-600 text-white rounded-xl font-medium text-base
            flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 hover:bg-blue-700 shadow-xs"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isProcessing ? 'กำลังประมวลผล...' : 'ถ่ายรูป'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.removeAttribute('capture');
              inputRef.current.click();
            }
          }}
          disabled={isProcessing}
          className="flex-1 min-h-touch px-4 py-3 bg-white text-blue-600 rounded-xl font-semibold text-base border border-slate-200
            flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 hover:bg-slate-50 shadow-xs"
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          เลือกจากอัลบั้ม
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleCapture}
        className="hidden"
      />

      {/* Fullscreen Viewer */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setViewingPhoto(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center text-2xl z-10"
            onClick={() => setViewingPhoto(null)}
          >✕</button>
          <img
            src={createPhotoURL(viewingPhoto)}
            alt={viewingPhoto.caption || 'รูปภาพ'}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {viewingPhoto.caption && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-xl text-base">
              {viewingPhoto.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
