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
    <div className="bg-white border-b border-slate-200 px-4 py-3 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[500px] max-w-3xl mx-auto">
        {STEPS.map((step, index) => {
          const complete = isStepComplete(report, step.num);
          const active = currentStep === step.num;

          return (
            <React.Fragment key={step.num}>
              {index > 0 && (
                <div className={`flex-1 h-0.5 mx-1 ${complete ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
              <button
                type="button"
                onClick={() => onStepClick(step.num)}
                className={`
                  flex flex-col items-center gap-1 min-w-[56px] transition-all
                  ${active ? 'scale-110' : 'scale-100'}
                `}
              >
                <div className="relative flex items-center justify-center">
                  {active && (
                    <span className="absolute -inset-1 rounded-full bg-blue-400/40 animate-ping opacity-75" />
                  )}
                  <div
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all
                      ${active
                        ? 'bg-blue-600 text-white shadow-lg animate-step-active'
                        : complete
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }
                    `}
                  >
                    {complete && !active ? '✓' : step.num}
                  </div>
                </div>
                <span className={`text-[10px] font-bold whitespace-nowrap transition-colors ${active ? 'text-blue-600 font-extrabold' : 'text-slate-500'}`}>
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
