// ==========================================
// ScoreSlider — ปุ่มตัวเลข 0–10 แตะเลือก
// ==========================================
import React from 'react';

interface ScoreSliderProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}

const scoreColors = [
  'bg-red-500', 'bg-red-400', 'bg-orange-500', 'bg-orange-400',
  'bg-amber-500', 'bg-yellow-500', 'bg-yellow-400', 'bg-lime-500',
  'bg-green-400', 'bg-green-500', 'bg-emerald-500'
];

export default function ScoreSlider({ label, value, onChange }: ScoreSliderProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-slate-700 mb-3">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-wrap flex-1">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={`
                min-w-[44px] min-h-[48px] rounded-lg text-base font-bold transition-all duration-200
                ${value === i
                  ? `${scoreColors[i]} text-white shadow-md scale-110 ring-2 ring-offset-2 ring-offset-white ring-blue-500`
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 active:scale-95'
                }
              `}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="ml-3 min-w-[60px] text-center">
          <span className={`text-4xl font-bold ${value !== null ? 'text-blue-600' : 'text-slate-300'}`}>
            {value !== null ? value : '–'}
          </span>
        </div>
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-500 px-1">
        <span>0 = น้อยที่สุด</span>
        <span>10 = มากที่สุด</span>
      </div>
    </div>
  );
}
