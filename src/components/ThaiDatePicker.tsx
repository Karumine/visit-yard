// ==========================================
// ThaiDatePicker — พ.ศ. date picker
// ==========================================
import React from 'react';
import { toInputDate, fromInputDate, gregorianToBuddhist } from '../lib/thaidate';

interface ThaiDatePickerProps {
  label: string;
  value: string; // ISO date
  onChange: (isoDate: string) => void;
  required?: boolean;
}

export default function ThaiDatePicker({ label, value, onChange, required }: ThaiDatePickerProps) {
  const inputValue = toInputDate(value);
  const displayBE = value ? getBuddhistDisplay(value) : '';

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="date"
          value={inputValue}
          onChange={(e) => onChange(fromInputDate(e.target.value))}
          required={required}
          className="w-full min-h-touch px-4 py-3 text-base border border-gray-300 rounded-xl bg-white
            focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>
      {displayBE && (
        <p className="text-xs text-primary mt-1 font-medium">
          📅 {displayBE}
        </p>
      )}
    </div>
  );
}

function getBuddhistDisplay(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = gregorianToBuddhist(d.getFullYear());
  return `${day} ${month} ${year}`;
}
