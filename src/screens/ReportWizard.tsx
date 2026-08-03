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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
        <button
          onClick={() => { saveCurrentReport(); setScreen('home'); }}
          className="min-w-touch min-h-touch flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>
        <div className="text-center flex-1 min-w-0">
          <p className="text-sm font-bold truncate">
            {currentReport.companyName || 'รายงานใหม่'}
          </p>
          {lastSaved && (
            <p className="text-[10px] opacity-75">
              บันทึกอัตโนมัติแล้ว {formatTime(lastSaved)}
            </p>
          )}
        </div>
        <div className="min-w-touch">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold
            ${currentReport.status === 'completed' ? 'bg-green-500' : 'bg-amber-400 text-gray-800'}`}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {renderStep()}
        </div>
      </div>

      {/* Bottom Nav — fixed at bottom with safe area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
          <button
            onClick={goBack}
            className="flex-1 min-h-[52px] px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-base
              flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {currentStep === 1 ? 'กลับหน้าหลัก' : 'ย้อนกลับ'}
          </button>
          {currentStep < 6 && (
            <button
              onClick={goNext}
              className="flex-1 min-h-[52px] px-6 py-3 bg-primary text-white rounded-xl font-bold text-base
                flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20"
            >
              ถัดไป
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
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
