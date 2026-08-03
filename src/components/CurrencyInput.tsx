// ==========================================
// CurrencyInput — ตัวเลข + comma + ล้านบาท
// ==========================================
import React from 'react';

interface CurrencyInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

export default function CurrencyInput({ label, value, onChange, placeholder = '0' }: CurrencyInputProps) {
  const formatNumber = (num: number | null): string => {
    if (num === null) return '';
    return num.toLocaleString('th-TH');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    if (raw === '') {
      onChange(null);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(num);
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={formatNumber(value)}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full min-h-touch px-4 py-3 pr-20 text-base border border-gray-300 rounded-xl bg-white
            focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
          ล้านบาท
        </span>
      </div>
    </div>
  );
}
