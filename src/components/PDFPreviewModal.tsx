// ==========================================
// PDFPreviewModal — แสดงตัวอย่างเอกสาร A4 ก่อนบันทึก/พิมพ์
// ==========================================
import React, { useEffect, useState } from 'react';
import type { VisitReport } from '../types/report';
import { generatePDFCanvas } from '../lib/pdf';

interface PDFPreviewModalProps {
  report: VisitReport | null;
  onClose: () => void;
}

export default function PDFPreviewModal({ report, onClose }: PDFPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!report) return;

    setLoading(true);
    setImgDataUrl(null);

    generatePDFCanvas(report)
      .then((canvas) => {
        if (mounted) {
          setImgDataUrl(canvas.toDataURL('image/png'));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate PDF canvas preview', err);
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [report]);

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-between p-2 sm:p-4 backdrop-blur-sm">
      {/* Top Header */}
      <div className="w-full max-w-4xl bg-gray-900 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-xl mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">📄</span>
          <div>
            <h3 className="font-bold text-sm sm:text-base">ตัวอย่างเอกสาร A4 (PDF Preview)</h3>
            <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-md">
              {report.companyName || 'รายงานการเข้าเยี่ยม'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="min-h-touch min-w-touch p-2 text-gray-400 hover:text-white rounded-lg font-bold text-base flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 w-full max-w-4xl overflow-y-auto flex items-start justify-center p-2 sm:p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-medium text-sm">กำลังสร้างตัวอย่างเอกสาร A4...</p>
          </div>
        ) : imgDataUrl ? (
          <div className="relative shadow-2xl rounded overflow-hidden bg-white max-w-full my-auto">
            <img
              src={imgDataUrl}
              alt="A4 PDF Preview"
              className="max-w-full h-auto block"
              style={{ maxHeight: 'calc(100vh - 160px)' }}
            />
          </div>
        ) : (
          <div className="text-red-400 py-20 text-center">
            ⚠️ ไม่สามารถสร้างตัวอย่างเอกสารได้
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full max-w-4xl text-center text-xs text-gray-400 pt-2">
        เอกสารสัดส่วน A4 1 หน้ามาตรฐาน • ตรวจสอบข้อความและความถูกต้องก่อนบันทึก
      </div>
    </div>
  );
}
