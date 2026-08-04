// ==========================================
// Step 2 — ผู้ที่ได้เข้าพบ + วัตถุประสงค์
// ==========================================
import React from 'react';
import type { VisitReport } from '../../types/report';
import ContactList from '../ContactList';

interface Props {
  report: VisitReport;
  onChange: (partial: Partial<VisitReport>) => void;
}

export default function Step2Contacts({ report, onChange }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
        👥 ผู้ที่ได้เข้าพบ
      </h2>

      <ContactList
        contacts={report.contacts}
        onChange={(contacts) => onChange({ contacts })}
      />

      <div className="mt-6">
        <label className="block text-sm font-bold text-slate-700 mb-1">
          วัตถุประสงค์ในการเยี่ยม <span className="text-red-500">*</span>
        </label>
        <textarea
          value={report.visitPurpose}
          onChange={(e) => onChange({ visitPurpose: e.target.value })}
          placeholder="ระบุวัตถุประสงค์ในการเข้าเยี่ยม"
          rows={4}
          className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 resize-y
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
        />
      </div>
    </div>
  );
}
