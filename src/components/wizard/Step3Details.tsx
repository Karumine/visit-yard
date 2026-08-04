// ==========================================
// Step 3 — รายละเอียด + รูปภาพ
// ==========================================
import React from 'react';
import type { VisitReport } from '../../types/report';
import PhotoCapture from '../PhotoCapture';

interface Props {
  report: VisitReport;
  onChange: (partial: Partial<VisitReport>) => void;
}

export default function Step3Details({ report, onChange }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
        📝 รายละเอียดการเข้าเยี่ยม
      </h2>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียดการเข้าเยี่ยม</label>
        <textarea
          value={report.visitDetail}
          onChange={(e) => onChange({ visitDetail: e.target.value })}
          placeholder="บรรยายรายละเอียดการเข้าเยี่ยม"
          rows={6}
          className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 resize-y
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">ข้อมูลเครื่องจักรที่จะขอสินเชื่อ</label>
        <textarea
          value={report.financedMachineInfo}
          onChange={(e) => onChange({ financedMachineInfo: e.target.value })}
          placeholder="รายละเอียดเครื่องจักรที่จะขอสินเชื่อ"
          rows={4}
          className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 resize-y
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
        />
      </div>

      <PhotoCapture
        label="📷 รูปภาพ"
        photos={report.machinePhotos}
        onChange={(photos) => onChange({ machinePhotos: photos })}
      />

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">ข้อมูลลูกค้าเบื้องต้น</label>
        <textarea
          value={report.customerBackground}
          onChange={(e) => onChange({ customerBackground: e.target.value })}
          placeholder="ข้อมูลลูกค้าเบื้องต้น ประวัติ ผลงาน ฯลฯ"
          rows={6}
          className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 resize-y
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
        />
      </div>
    </div>
  );
}
