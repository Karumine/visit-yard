// ==========================================
// Step 5 — ให้คะแนน 0–10
// ==========================================
import React from 'react';
import type { VisitReport, Scores } from '../../types/report';
import { calculateAverageScore } from '../../types/report';
import ScoreSlider from '../ScoreSlider';

interface Props {
  report: VisitReport;
  onChange: (partial: Partial<VisitReport>) => void;
}

export default function Step5Scores({ report, onChange }: Props) {
  const scores = report.scores;
  const avg = calculateAverageScore(scores);

  const updateScore = (key: keyof Scores, value: number) => {
    onChange({ scores: { ...scores, [key]: value } });
  };

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2">
        ⭐ ความเห็น/ความน่าสนใจ
      </h2>
      <p className="text-sm text-gray-500 mb-4">ให้คะแนน 0–10 ในแต่ละหัวข้อ</p>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-6">
        <ScoreSlider
          label="1. ลักษณะธุรกิจ"
          value={scores.businessNature}
          onChange={(v) => updateScore('businessNature', v)}
        />
        <ScoreSlider
          label="2. ลักษณะเจ้าของ"
          value={scores.ownerCharacter}
          onChange={(v) => updateScore('ownerCharacter', v)}
        />
        <ScoreSlider
          label="3. ฐานลูกค้า"
          value={scores.customerBase}
          onChange={(v) => updateScore('customerBase', v)}
        />
        <ScoreSlider
          label="4. ความเป็นพันธมิตร"
          value={scores.partnership}
          onChange={(v) => updateScore('partnership', v)}
        />
      </div>

      {/* Average Score Card */}
      <div className="mt-6 bg-gradient-to-r from-primary to-primary-400 rounded-2xl p-6 text-white text-center shadow-lg">
        <p className="text-sm font-medium opacity-90 mb-1">คะแนนเฉลี่ยรวม</p>
        <p className="text-5xl font-black">
          {avg !== null ? avg.toFixed(1) : '–'}
        </p>
        <p className="text-xs opacity-75 mt-1">จาก 10 คะแนน</p>
      </div>
    </div>
  );
}
