// ==========================================
// ReportWizard — 6-step wizard form
// ==========================================
import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { useAutosave } from '../lib/autosave';
import { formatTime } from '../lib/thaidate';
import Stepper from '../components/Stepper';
import Step1General from '../components/wizard/Step1General';
import Step2Contacts from '../components/wizard/Step2Contacts';
import Step3Details from '../components/wizard/Step3Details';
import Step4Observations from '../components/wizard/Step4Observations';
import Step5Scores from '../components/wizard/Step5Scores';
import Step6Summary from '../components/wizard/Step6Summary';
import PDFPreviewModal from '../components/PDFPreviewModal';

export default function ReportWizard() {
  const {
    currentReport, currentStep, setCurrentStep,
    updateCurrentReport, saveCurrentReport, setScreen, lastSaved
  } = useAppStore();

  const [showPreview, setShowPreview] = useState(false);

  useAutosave();

  if (!currentReport) return null;

  const goBack = () => {
    saveCurrentReport();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setScreen('home');
    }
  };

  const goNext = () => {
    saveCurrentReport();
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToStep = (step: number) => {
    saveCurrentReport();
    setCurrentStep(step);
  };

  const handleComplete = async () => {
    updateCurrentReport({ status: 'completed' });
    await saveCurrentReport();
    alert('✅ บันทึกรายงานเรียบร้อยแล้ว!');
    setScreen('home');
  };

  const handlePreviewPDF = () => {
    setShowPreview(true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1General report={currentReport} onChange={updateCurrentReport} />;
      case 2: return <Step2Contacts report={currentReport} onChange={updateCurrentReport} />;
      case 3: return <Step3Details report={currentReport} onChange={updateCurrentReport} />;
      case 4: return <Step4Observations report={currentReport} onChange={updateCurrentReport} />;
      case 5: return <Step5Scores report={currentReport} onChange={updateCurrentReport} />;
      case 6: return (
        <Step6Summary
          report={currentReport}
          onChange={updateCurrentReport}
          onComplete={handleComplete}
          onPreviewPDF={handlePreviewPDF}
          onGoToStep={goToStep}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 text-slate-900 px-4 py-3 flex items-center justify-between shadow-xs z-10">
        <button
          onClick={() => { saveCurrentReport(); setScreen('home'); }}
          className="min-w-touch min-h-touch flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>
        <div className="text-center flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">
            {currentReport.companyName || 'รายงานใหม่'}
          </p>
          {lastSaved && (
            <p className="text-[10px] text-slate-500">
              บันทึกอัตโนมัติแล้ว {formatTime(lastSaved)}
            </p>
          )}
        </div>
        <div className="min-w-touch">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            currentReport.status === 'completed' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'}`}
          >
            {currentReport.status === 'completed' ? 'เสร็จ' : 'ร่าง'}
          </span>
        </div>
      </header>

      {/* Stepper */}
      <Stepper
        currentStep={currentStep}
        onStepClick={goToStep}
        report={currentReport}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 text-slate-800">
          {renderStep()}

          {/* Navigation Buttons (Inline at bottom of form) */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex gap-4">
            <button
              type="button"
              onClick={goBack}
              className="flex-1 min-h-[52px] px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-base
                flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-200 border border-slate-200 shadow-2xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {currentStep === 1 ? 'กลับหน้าหลัก' : 'ย้อนกลับ'}
            </button>
            {currentStep < 6 && (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 min-h-[52px] px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-base
                  flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md hover:bg-blue-700"
              >
                ถัดไป
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && currentReport && (
        <PDFPreviewModal
          report={currentReport}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
