// ==========================================
// ThaiDatePicker — พ.ศ. date picker
// ==========================================
import React from 'react';
import { CustomDatePicker } from './CustomDatePicker';
import { gregorianToBuddhist } from '../lib/thaidate';

interface ThaiDatePickerProps {
  label: string;
  value: string; // ISO date
  onChange: (isoDate: string) => void;
  required?: boolean;
}

export default function ThaiDatePicker({ label, value, onChange, required }: ThaiDatePickerProps) {
  const displayLabel = required ? `${label} *` : label;

  return (
    <div>
      <CustomDatePicker
        label={displayLabel}
        value={value}
        onChange={onChange}
      />
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
