// ==========================================
// CategorizedPhotoSection — จัดการรูปภาพ 8 หัวข้อหลัก
// ==========================================
import React, { useRef } from 'react';
import type { Photo } from '../types/report';
import { PHOTO_CATEGORIES } from '../types/report';
import PhotoCapture from './PhotoCapture';

interface CategorizedPhotoSectionProps {
  sitePhotos: Photo[];
  machinePhotos?: Photo[];
  onSitePhotosChange: (photos: Photo[]) => void;
  onMachinePhotosChange?: (photos: Photo[]) => void;
}

export default function CategorizedPhotoSection({
  sitePhotos = [],
  machinePhotos = [],
  onSitePhotosChange,
  onMachinePhotosChange,
}: CategorizedPhotoSectionProps) {
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Merge all photos for calculation
  const allSitePhotos = sitePhotos || [];
  const allMachinePhotos = machinePhotos || [];
  const allPhotos = [...allSitePhotos, ...allMachinePhotos];

  // Count how many categories have at least 1 photo
  const filledCategoriesCount = PHOTO_CATEGORIES.filter((cat) =>
    allSitePhotos.some(
      (p) => p.category === cat.name || p.category === cat.id || p.category === cat.description
    )
  ).length;

  const scrollToCategory = (catId: string) => {
    const el = categoryRefs.current[catId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Helper to handle category photo updates
  const handleCategoryPhotosChange = (catName: string, updatedCategoryPhotos: Photo[]) => {
    // Keep photos that do NOT belong to this category
    const otherSitePhotos = allSitePhotos.filter((p) => p.category !== catName);
    
    // Ensure all updated photos have category set
    const fixedCategoryPhotos = updatedCategoryPhotos.map((p) => ({
      ...p,
      category: catName,
      caption: p.caption || catName,
    }));

    onSitePhotosChange([...otherSitePhotos, ...fixedCategoryPhotos]);
  };

  // Find photos for category
  const getPhotosForCategory = (catName: string) => {
    return allSitePhotos.filter((p) => p.category === catName);
  };

  // Find uncategorized site photos
  const uncategorizedPhotos = allSitePhotos.filter(
    (p) => !p.category || !PHOTO_CATEGORIES.some((cat) => cat.name === p.category)
  );

  return (
    <div className="space-y-6">
      {/* Section Title & Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📸</span>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                รูปภาพประกอบ 8 หัวข้อหลัก
              </h3>
              <p className="text-xs text-blue-200">
                ถ่ายรูปหรือเลือกรูปภาพแยกตามหมวดหมู่ 8 หัวข้อ เพื่อแนบในรายงานการเข้าเยี่ยม
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-blue-100 flex items-center gap-2">
            <span>อัปโหลดแล้ว {filledCategoriesCount} / 8 หัวข้อ</span>
            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px]">
              รวม {allPhotos.length} รูป
            </span>
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-blue-700/50 pb-1 scrollbar-none">
          {PHOTO_CATEGORIES.map((cat) => {
            const count = getPhotosForCategory(cat.name).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToCategory(cat.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  count > 0
                    ? 'bg-emerald-500 text-white shadow-xs font-semibold'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className="bg-white text-emerald-800 px-1.5 py-0.2 text-[10px] font-bold rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8 Category Cards */}
      <div className="space-y-4">
        {PHOTO_CATEGORIES.map((cat) => {
          const categoryPhotos = getPhotosForCategory(cat.name);
          return (
            <div
              key={cat.id}
              ref={(el) => { categoryRefs.current[cat.id] = el; }}
              className={`rounded-2xl border transition-all overflow-hidden ${
                categoryPhotos.length > 0
                  ? 'bg-white border-blue-200 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Category Header */}
              <div className="px-4 py-3.5 bg-slate-100/80 border-b border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl bg-white p-1.5 rounded-xl shadow-xs border border-slate-200">
                    {cat.icon}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <span>{cat.name}</span>
                    </h4>
                    <p className="text-xs text-slate-500">{cat.description}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      categoryPhotos.length > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {categoryPhotos.length} รูป
                  </span>
                </div>
              </div>

              {/* Photo Capture Uploader & Grid */}
              <div className="p-4">
                <PhotoCapture
                  label=""
                  category={cat.name}
                  photos={categoryPhotos}
                  onChange={(photos) => handleCategoryPhotosChange(cat.name, photos)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Uncategorized / Machine Photos Card (If any exist) */}
      {(uncategorizedPhotos.length > 0 || allMachinePhotos.length > 0) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <span>📷</span>
            <span>รูปภาพอื่นๆ / เครื่องจักรที่เคยอัปโหลด ({uncategorizedPhotos.length + allMachinePhotos.length} รูป)</span>
          </div>

          {allMachinePhotos.length > 0 && onMachinePhotosChange && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">รูปภาพเครื่องจักรที่จะขอสินเชื่อ</p>
              <PhotoCapture
                label=""
                photos={allMachinePhotos}
                onChange={onMachinePhotosChange}
              />
            </div>
          )}

          {uncategorizedPhotos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">รูปภาพไม่ระบุหมวดหมู่</p>
              <PhotoCapture
                label=""
                photos={uncategorizedPhotos}
                onChange={(photos) => {
                  const categorizedOnly = allSitePhotos.filter(
                    (p) => p.category && PHOTO_CATEGORIES.some((c) => c.name === p.category)
                  );
                  onSitePhotosChange([...categorizedOnly, ...photos]);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
