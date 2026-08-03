// ==========================================
// SignaturePad — วาดลายเซ็นด้วยนิ้ว/Apple Pencil
// ==========================================
import React, { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';

interface SignaturePadProps {
  value?: string; // base64 PNG data URL
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
}

export default function SignaturePad({ value, onChange, label = 'ลงลายเซ็น' }: SignaturePadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement!;
      canvas.width = container.clientWidth;
      canvas.height = Math.max(200, container.clientHeight);

      padRef.current = new SignaturePadLib(canvas, {
        backgroundColor: 'rgba(0,0,0,0)',
        penColor: '#1B3A5F',
      });

      // Load existing signature
      if (value) {
        padRef.current.fromDataURL(value);
      }
    }

    return () => {
      padRef.current?.off();
    };
  }, [isOpen]);

  const handleClear = () => {
    padRef.current?.clear();
  };

  const handleSave = () => {
    if (padRef.current?.isEmpty()) {
      onChange(undefined);
    } else {
      const dataUrl = padRef.current?.toDataURL('image/png');
      onChange(dataUrl);
    }
    setIsOpen(false);
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>

      {value ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white">
          <img src={value} alt="ลายเซ็น" className="h-20 mx-auto" />
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 min-h-touch bg-primary text-white rounded-lg text-sm font-medium"
            >
              เซ็นใหม่
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="px-4 py-2 min-h-touch bg-red-100 text-red-600 rounded-lg text-sm font-medium"
            >
              ลบ
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full min-h-[80px] border-2 border-dashed border-gray-300 rounded-xl bg-white
            flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary
            transition-colors active:bg-gray-50"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="text-sm font-medium">แตะเพื่อเซ็นชื่อ</span>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-primary text-white">
              <h3 className="font-bold text-lg">{label}</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-w-touch min-h-touch flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="border-2 border-gray-300 rounded-xl bg-white" style={{ minHeight: 200 }}>
                <canvas ref={canvasRef} className="w-full touch-none" style={{ minHeight: 200 }} />
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 min-h-touch px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-base"
              >
                ล้าง
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 min-h-touch px-4 py-3 bg-primary text-white rounded-xl font-bold text-base"
              >
                บันทึกลายเซ็น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
