// ==========================================
// Stepper — แถบ 6 ขั้นตอน
// ==========================================
import React from 'react';
import type { VisitReport } from '../types/report';
import { isStepComplete } from '../lib/validation';

interface StepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  report: VisitReport;
}

const STEPS = [
  { num: 1, label: 'ข้อมูลทั่วไป', icon: '📋' },
  { num: 2, label: 'ผู้เข้าพบ', icon: '👥' },
  { num: 3, label: 'รายละเอียด', icon: '📝' },
  { num: 4, label: 'ข้อสังเกต', icon: '🔍' },
  { num: 5, label: 'คะแนน', icon: '⭐' },
  { num: 6, label: 'สรุป', icon: '✅' },
];

export default function Stepper({ currentStep, onStepClick, report }: StepperProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[500px] max-w-3xl mx-auto">
        {STEPS.map((step, index) => {
          const complete = isStepComplete(report, step.num);
          const active = currentStep === step.num;

          return (
            <React.Fragment key={step.num}>
              {index > 0 && (
                <div className={`flex-1 h-0.5 mx-1 ${complete ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
              <button
                type="button"
                onClick={() => onStepClick(step.num)}
                className={`
                  flex flex-col items-center gap-1 min-w-[56px] transition-all
                  ${active ? 'scale-110' : 'scale-100'}
                `}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all
                    ${active
                      ? 'bg-primary text-white shadow-lg ring-4 ring-primary/20'
                      : complete
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {complete && !active ? '✓' : step.num}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-primary' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
