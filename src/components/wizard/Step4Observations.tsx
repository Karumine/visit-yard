// ==========================================
// Step 4 — ข้อสังเกต 8 ข้อ (accordion)
// ==========================================
import React, { useState } from 'react';
import type { VisitReport, Observations } from '../../types/report';
import CurrencyInput from '../CurrencyInput';

interface Props {
  report: VisitReport;
  onChange: (partial: Partial<VisitReport>) => void;
}

function Accordion({ title, isOpen, onToggle, children, index }: {
  title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; index: number;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full min-h-touch px-5 py-4 flex items-center justify-between text-left
          hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <span className="font-bold text-base text-primary">
          <span className="inline-flex items-center justify-center w-7 h-7 bg-primary text-white rounded-full text-sm mr-2">
            {index}
          </span>
          {title}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Step4Observations({ report, onChange }: Props) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));
  const obs = report.observations;

  const toggleSection = (n: number) => {
    const next = new Set(openSections);
    if (next.has(n)) next.delete(n); else next.add(n);
    setOpenSections(next);
  };

  const updateObs = (partial: Partial<Observations>) => {
    onChange({ observations: { ...obs, ...partial } });
  };

  // Auto-calculate average machine value
  const handleMachineValueChange = (field: string, value: number | null) => {
    const mv = { ...obs.machineValue, [field]: value };
    // Auto-calc average if highest and lowest are set and average hasn't been manually edited
    if (field === 'highest' || field === 'lowest') {
      if (mv.highest !== null && mv.lowest !== null) {
        mv.average = Math.round(((mv.highest + mv.lowest) / 2) * 100) / 100;
      }
    }
    updateObs({ machineValue: mv });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2">
        🔍 ข้อสังเกต
      </h2>

      {/* 1. ประสบการณ์ */}
      <Accordion title="ประสบการณ์" isOpen={openSections.has(1)} onToggle={() => toggleSection(1)} index={1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'isOperator', label: 'เป็นผู้ปฏิบัติ' },
            { key: 'isExecutive', label: 'เป็นผู้บริหาร' },
            { key: 'isCorporate', label: 'ธุรกิจองค์กร' },
            { key: 'isFamily', label: 'ธุรกิจครอบครัว' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
              <input
                type="text"
                value={(obs.experience as any)[f.key] || ''}
                onChange={(e) => updateObs({
                  experience: { ...obs.experience, [f.key]: e.target.value }
                })}
                placeholder={f.label}
                className="w-full min-h-touch px-3 py-2 text-base border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          ))}
        </div>
      </Accordion>

      {/* 2. ทีมงาน Service/Operation */}
      <Accordion title="ทีมงาน Service/Operation" isOpen={openSections.has(2)} onToggle={() => toggleSection(2)} index={2}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">รายละเอียดทีมงาน</label>
            <textarea
              value={obs.team.main}
              onChange={(e) => updateObs({ team: { ...obs.team, main: e.target.value } })}
              rows={3}
              placeholder="รายละเอียดทีมงาน"
              className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg resize-y
                focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Srv. Team</label>
              <input
                type="text"
                value={obs.team.srvTeam}
                onChange={(e) => updateObs({ team: { ...obs.team, srvTeam: e.target.value } })}
                placeholder="จำนวน/รายละเอียด Srv. Team"
                className="w-full min-h-touch px-3 py-2 text-base border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Op. Team</label>
              <input
                type="text"
                value={obs.team.opTeam}
                onChange={(e) => updateObs({ team: { ...obs.team, opTeam: e.target.value } })}
                placeholder="จำนวน/รายละเอียด Op. Team"
                className="w-full min-h-touch px-3 py-2 text-base border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </Accordion>

      {/* 3. การจัดการอะไหล่ */}
      <Accordion title="การจัดการอะไหล่" isOpen={openSections.has(3)} onToggle={() => toggleSection(3)} index={3}>
        <textarea
          value={obs.spareParts}
          onChange={(e) => updateObs({ spareParts: e.target.value })}
          rows={3}
          placeholder="รายละเอียดการจัดการอะไหล่"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </Accordion>

      {/* 4. ระบบการป้องกันการสูญหาย */}
      <Accordion title="ระบบการป้องกันการสูญหายของเครื่องจักร" isOpen={openSections.has(4)} onToggle={() => toggleSection(4)} index={4}>
        <textarea
          value={obs.theftPrevention}
          onChange={(e) => updateObs({ theftPrevention: e.target.value })}
          rows={3}
          placeholder="รายละเอียดระบบป้องกันการสูญหาย"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </Accordion>

      {/* 5. ลักษณะลูกค้าที่มี */}
      <Accordion title="ลักษณะลูกค้าที่มี" isOpen={openSections.has(5)} onToggle={() => toggleSection(5)} index={5}>
        <textarea
          value={obs.customerCharacteristics}
          onChange={(e) => updateObs({ customerCharacteristics: e.target.value })}
          rows={3}
          placeholder="ลักษณะลูกค้าที่มี"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </Accordion>

      {/* 6. มูลค่าเครื่องจักร */}
      <Accordion title="มูลค่าของเครื่องจักร" isOpen={openSections.has(6)} onToggle={() => toggleSection(6)} index={6}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <CurrencyInput label="สูงสุด" value={obs.machineValue.highest} onChange={(v) => handleMachineValueChange('highest', v)} />
          <CurrencyInput label="ต่ำสุด" value={obs.machineValue.lowest} onChange={(v) => handleMachineValueChange('lowest', v)} />
          <CurrencyInput label="เฉลี่ย (คำนวณอัตโนมัติ)" value={obs.machineValue.average} onChange={(v) => handleMachineValueChange('average', v)} />
          <CurrencyInput label="ทั้งระบบ" value={obs.machineValue.total} onChange={(v) => handleMachineValueChange('total', v)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">หมายเหตุ</label>
          <input
            type="text"
            value={obs.machineValue.remark}
            onChange={(e) => updateObs({
              machineValue: { ...obs.machineValue, remark: e.target.value }
            })}
            className="w-full min-h-touch px-3 py-2 text-base border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </Accordion>

      {/* 7. คู่แข่ง */}
      <Accordion title="คู่แข่ง" isOpen={openSections.has(7)} onToggle={() => toggleSection(7)} index={7}>
        <textarea
          value={obs.competitors}
          onChange={(e) => updateObs({ competitors: e.target.value })}
          rows={3}
          placeholder="คู่แข่งในตลาด"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </Accordion>

      {/* 8. อื่นๆ */}
      <Accordion title="อื่นๆ (ถ้ามี)" isOpen={openSections.has(8)} onToggle={() => toggleSection(8)} index={8}>
        <textarea
          value={obs.others}
          onChange={(e) => updateObs({ others: e.target.value })}
          rows={3}
          placeholder="ข้อสังเกตอื่นๆ"
          className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </Accordion>
    </div>
  );
}
