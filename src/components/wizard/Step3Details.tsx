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
      <h2 className="text-xl font-bold text-primary flex items-center gap-2">
        📝 รายละเอียดการเข้าเยี่ยม
      </h2>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดการเข้าเยี่ยม</label>
        <textarea
          value={report.visitDetail}
          onChange={(e) => onChange({ visitDetail: e.target.value })}
          placeholder="บรรยายรายละเอียดการเข้าเยี่ยม"
          rows={6}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">ข้อมูลเครื่องจักรที่จะขอสินเชื่อ</label>
        <textarea
          value={report.financedMachineInfo}
          onChange={(e) => onChange({ financedMachineInfo: e.target.value })}
          placeholder="รายละเอียดเครื่องจักรที่จะขอสินเชื่อ"
          rows={4}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <PhotoCapture
        label="📷 รูปประกอบเครื่องจักร"
        photos={report.machinePhotos}
        onChange={(photos) => onChange({ machinePhotos: photos })}
      />

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">ข้อมูลลูกค้าเบื้องต้น</label>
        <textarea
          value={report.customerBackground}
          onChange={(e) => onChange({ customerBackground: e.target.value })}
          placeholder="ข้อมูลลูกค้าเบื้องต้น ประวัติ ผลงาน ฯลฯ"
          rows={6}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <PhotoCapture
        label="📷 รูปสถานประกอบการ/โกดัง/Workshop"
        photos={report.sitePhotos}
        onChange={(photos) => onChange({ sitePhotos: photos })}
      />
    </div>
  );
}
