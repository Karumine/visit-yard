// ==========================================
// Step 6 — สรุป + ลายเซ็น
// ==========================================
import React, { useState } from 'react';
import type { VisitReport } from '../../types/report';
import ThaiDatePicker from '../ThaiDatePicker';
import SignaturePad from '../SignaturePad';
import PhotoCapture from '../PhotoCapture';
import { validateForCompletion, type ValidationError } from '../../lib/validation';

interface Props {
  report: VisitReport;
  onChange: (partial: Partial<VisitReport>) => void;
  onComplete: () => void;
  onPreviewPDF: () => void;
  onGoToStep: (step: number) => void;
}

export default function Step6Summary({ report, onChange, onComplete, onPreviewPDF, onGoToStep }: Props) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const handleComplete = () => {
    const validationErrors = validateForCompletion(report);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setShowErrors(true);
      return;
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2">
        ✅ สรุปและลงนาม
      </h2>

      {/* Validation Errors */}
      {showErrors && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-bold text-red-700 mb-2">⚠️ ยังขาดข้อมูลต่อไปนี้:</h3>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onGoToStep(err.step)}
                  className="text-red-600 underline text-sm hover:text-red-800"
                >
                  • {err.message} (ขั้นที่ {err.step})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* สรุปการดำเนินการต่อไป */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">สรุปการดำเนินการต่อไป</label>
        <textarea
          value={report.nextAction}
          onChange={(e) => onChange({ nextAction: e.target.value })}
          placeholder="สรุปการดำเนินการต่อไป"
          rows={4}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white resize-y
            focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* นัดครั้งถัดไป */}
      <ThaiDatePicker
        label="นัดครั้งถัดไป"
        value={report.nextAppointment}
        onChange={(v) => onChange({ nextAppointment: v })}
      />

      {/* เอกสารแนบ */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">เอกสารแนบ</label>
        <div className="flex gap-3 mb-3">
          <button
            type="button"
            onClick={() => onChange({ hasAttachment: false })}
            className={`flex-1 min-h-touch px-4 py-3 rounded-xl text-base font-medium transition-all
              ${!report.hasAttachment ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            ไม่มี
          </button>
          <button
            type="button"
            onClick={() => onChange({ hasAttachment: true })}
            className={`flex-1 min-h-touch px-4 py-3 rounded-xl text-base font-medium transition-all
              ${report.hasAttachment ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            มี
          </button>
        </div>
        {report.hasAttachment && (
          <PhotoCapture
            label="แนบเอกสาร/รูปภาพ"
            photos={[]}
            onChange={() => {}}
          />
        )}
      </div>

      {/* ลงชื่อผู้เข้าเยี่ยม */}
      <div className="bg-accent/50 rounded-2xl p-5 border border-primary/10">
        <h3 className="font-bold text-primary mb-4">ลงชื่อผู้เข้าเยี่ยม (AA)</h3>
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">ชื่อผู้เข้าเยี่ยม</label>
          <input
            type="text"
            value={report.inspectorName}
            onChange={(e) => onChange({ inspectorName: e.target.value })}
            placeholder="ชื่อ-สกุล"
            className="w-full min-h-touch px-4 py-3 text-base border border-gray-300 rounded-xl bg-white
              focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <SignaturePad
          label="ลายเซ็นผู้เข้าเยี่ยม"
          value={report.inspectorSignature}
          onChange={(sig) => onChange({ inspectorSignature: sig })}
        />
      </div>

      {/* ช่องเซ็นอนุมัติ (3 ช่อง) */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
        <h3 className="font-bold text-primary mb-4">ช่องเซ็นอนุมัติ (Inspected by)</h3>
        <p className="text-xs text-gray-400 mb-4">ปกติเซ็นในออฟฟิศ — สามารถเว้นว่างได้</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['engineering', 'credit', 'generalManager'] as const).map((key) => {
            const labels = {
              engineering: 'Engineering Department',
              credit: 'Credit Department',
              generalManager: 'General Manager',
            };
            const approval = report.approvals[key];
            return (
              <div key={key} className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-bold text-primary mb-3">{labels[key]}</p>
                <div className="mb-3">
                  <input
                    type="text"
                    value={approval.name || ''}
                    onChange={(e) => onChange({
                      approvals: {
                        ...report.approvals,
                        [key]: { ...approval, name: e.target.value }
                      }
                    })}
                    placeholder="ชื่อ"
                    className="w-full min-h-touch px-3 py-2 text-sm border border-gray-200 rounded-lg
                      focus:ring-1 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <SignaturePad
                  label="ลายเซ็น"
                  value={approval.signature}
                  onChange={(sig) => onChange({
                    approvals: {
                      ...report.approvals,
                      [key]: { ...approval, signature: sig }
                    }
                  })}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <button
          type="button"
          onClick={onPreviewPDF}
          className="min-h-[56px] px-6 py-4 bg-accent text-primary rounded-2xl font-bold text-lg
            flex items-center justify-center gap-2 active:scale-95 transition-transform border-2 border-primary/20"
        >
          📄 ดูตัวอย่าง PDF
        </button>
        <button
          type="button"
          onClick={handleComplete}
          className="min-h-[56px] px-6 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg
            flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-green-200"
        >
          ✅ บันทึกเป็นเสร็จสิ้น
        </button>
      </div>
    </div>
  );
}
