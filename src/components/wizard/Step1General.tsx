// ==========================================
// Step 1 — ข้อมูลทั่วไป
// ==========================================
import React from 'react';
import type { VisitReport, EntityType } from '../../types/report';
import ThaiDatePicker from '../ThaiDatePicker';

interface Props {
  report: VisitReport;
  onChange: (partial: Partial<VisitReport>) => void;
}

function RadioGroup({ label, value, onChange, options }: {
  label: string;
  value: EntityType;
  onChange: (v: EntityType) => void;
  options: { value: EntityType; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="flex gap-3">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 min-h-touch px-4 py-3 rounded-xl text-base font-medium transition-all
              ${value === opt.value
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Step1General({ report, onChange }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2">
        📋 ข้อมูลทั่วไป
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ThaiDatePicker
          label="วันที่เข้าเยี่ยม"
          value={report.visitDate}
          onChange={(v) => onChange({ visitDate: v })}
          required
        />
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            ครั้งที่เข้าเยี่ยม
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={report.visitNo}
            onChange={(e) => onChange({ visitNo: parseInt(e.target.value) || 1 })}
            className="w-full min-h-touch px-4 py-3 text-base border border-gray-300 rounded-xl bg-white
              focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RadioGroup
          label="ลูกค้า"
          value={report.customerType}
          onChange={(v) => onChange({ customerType: v })}
          options={[
            { value: 'existing', label: 'ลูกค้าเดิม' },
            { value: 'new', label: 'ลูกค้าใหม่' },
          ]}
        />
        <RadioGroup
          label="Yard"
          value={report.yardType}
          onChange={(v) => onChange({ yardType: v })}
          options={[
            { value: 'existing', label: 'Yard เดิม' },
            { value: 'new', label: 'Yard ใหม่' },
          ]}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          ชื่อบริษัทที่เข้าเยี่ยม <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={report.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          placeholder="ชื่อบริษัท (รองรับหลายชื่อคั่น /)"
          className="w-full min-h-touch px-4 py-3 text-base border border-gray-300 rounded-xl bg-white
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">ที่อยู่</label>
        <textarea
          value={report.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="ที่อยู่บริษัท"
          rows={3}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <RadioGroup
        label="เครื่องจักร"
        value={report.assetGroupType}
        onChange={(v) => onChange({ assetGroupType: v })}
        options={[
          { value: 'existing', label: 'กลุ่มเดิม' },
          { value: 'new', label: 'กลุ่มใหม่' },
        ]}
      />

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">ประเภทเครื่องจักร</label>
        <textarea
          value={report.machineType}
          onChange={(e) => onChange({ machineType: e.target.value })}
          placeholder="ระบุประเภทเครื่องจักร"
          rows={2}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">ลักษณะธุรกิจผู้เข้าเยี่ยม</label>
        <textarea
          value={report.visitorBusinessNature}
          onChange={(e) => onChange({ visitorBusinessNature: e.target.value })}
          placeholder="ระบุลักษณะธุรกิจ"
          rows={2}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>
    </div>
  );
}
