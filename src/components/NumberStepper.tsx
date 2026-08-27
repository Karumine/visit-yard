import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export default function NumberStepper({
  label,
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  required = false,
  className = '',
  placeholder = '1',
}: NumberStepperProps) {
  const [displayValue, setDisplayValue] = useState<string>(String(value ?? min));
  const isFocusedRef = useRef(false);

  // Sync prop value to displayValue when not currently focused by user
  useEffect(() => {
    if (!isFocusedRef.current && value !== undefined && value !== null) {
      setDisplayValue(String(value));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawStr = e.target.value;
    
    // Allow complete clear / empty string so backspacing works on iPad & touch devices
    if (rawStr === '') {
      setDisplayValue('');
      return;
    }

    // Only allow numeric digits
    if (/^\d*$/.test(rawStr)) {
      setDisplayValue(rawStr);
      const parsed = parseInt(rawStr, 10);
      if (!isNaN(parsed) && parsed >= min && (max === undefined || parsed <= max)) {
        onChange(parsed);
      }
    }
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    let parsed = parseInt(displayValue, 10);
    if (isNaN(parsed) || parsed < min) {
      parsed = min;
    } else if (max !== undefined && parsed > max) {
      parsed = max;
    }
    setDisplayValue(String(parsed));
    onChange(parsed);
  };

  const handleDecrement = () => {
    const current = parseInt(displayValue, 10) || value || min;
    const nextVal = Math.max(min, current - step);
    setDisplayValue(String(nextVal));
    onChange(nextVal);
  };

  const handleIncrement = () => {
    const current = parseInt(displayValue, 10) || value || min;
    const nextVal = max !== undefined ? Math.min(max, current + step) : current + step;
    setDisplayValue(String(nextVal));
    onChange(nextVal);
  };

  const currentValue = parseInt(displayValue, 10) || value || min;
  const isMinDisabled = currentValue <= min;
  const isMaxDisabled = max !== undefined && currentValue >= max;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isMinDisabled}
          aria-label="ลดจำนวน"
          className="w-12 h-12 min-h-touch min-w-touch flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 active:bg-blue-50 active:border-blue-300 disabled:opacity-40 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all select-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <Minus className="w-5 h-5 text-slate-700 stroke-[2.5]" />
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full min-h-touch px-4 py-3 text-center text-lg font-bold border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={isMaxDisabled}
          aria-label="เพิ่มจำนวน"
          className="w-12 h-12 min-h-touch min-w-touch flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 active:bg-blue-50 active:border-blue-300 disabled:opacity-40 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all select-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <Plus className="w-5 h-5 text-slate-700 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
