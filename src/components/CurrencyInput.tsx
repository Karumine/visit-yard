import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

export default function CurrencyInput({ label, value, onChange, placeholder = '0' }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === null || value === undefined) {
      setDisplayValue('');
    } else {
      // Only sync if parsed value differs from current parsed displayValue
      const currentParsed = parseFloat(displayValue);
      if (isNaN(currentParsed) || currentParsed !== value) {
        setDisplayValue(String(value));
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits, single decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setDisplayValue(val);
      if (val === '' || val === '.') {
        onChange(null);
      } else {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          onChange(num);
        }
      }
    }
  };

  const handleBlur = () => {
    if (value !== null && !isNaN(value)) {
      setDisplayValue(String(value));
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full min-h-touch px-4 py-3 pr-20 text-base border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors shadow-xs"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
          ล้านบาท
        </span>
      </div>
    </div>
  );
}
