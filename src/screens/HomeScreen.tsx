// ==========================================
// HomeScreen — รายการรายงาน
// ==========================================
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { calculateAverageScore, VisitReport } from '../types/report';
import { toThaiDateFull } from '../lib/thaidate';
import { generatePDF } from '../lib/pdf';
import { exportReportAsJSON, importReportFromJSON } from '../lib/storage';
import { loadSampleData } from '../data/sampleData';
import PDFPreviewModal from '../components/PDFPreviewModal';

type FilterStatus = 'all' | 'draft' | 'completed';

export default function HomeScreen() {
  const { reports, loadReports, createNewReport, openReport, viewReport, deleteReport, duplicateReport } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<VisitReport | null>(null);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filtered = reports.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search && !r.companyName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExportPDF = async (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      await generatePDF(report);
    }
    setMenuOpen(null);
  };

  const handleExportJSON = async (id: string) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;
    const json = await exportReportAsJSON(report);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `รายงานเข้าเยี่ยม_${report.companyName || 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(null);
  };

  const handleImportJSON = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      await importReportFromJSON(text);
      await loadReports();
    };
    input.click();
  };

  const handleLoadSample = async () => {
    await loadSampleData();
    await loadReports();
  };

  const handleDelete = async (id: string) => {
    await deleteReport(id);
    setConfirmDelete(null);
    setMenuOpen(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-400 text-white px-6 py-5 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white rounded-xl px-3.5 py-1.5 shadow-sm flex items-center justify-center">
              <img
                src="/Logo_Agile Assets_CMYK.png"
                alt="Agile Assets Logo"
                className="h-9 w-auto object-contain min-w-[36px]"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">รายงานการเข้าเยี่ยม ลูกค้า/Yard</h1>
              <p className="text-sm opacity-80">Agile Assets — Visit Report System</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อบริษัท..."
              className="w-full min-h-touch pl-12 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white
                focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {([
              { val: 'all', label: 'ทั้งหมด' },
              { val: 'draft', label: '📝 ร่าง' },
              { val: 'completed', label: '✅ เสร็จ' },
            ] as const).map(f => (
              <button
                key={f.val}
                onClick={() => setFilter(f.val)}
                className={`min-h-touch px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${filter === f.val
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create New + Tools */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={createNewReport}
            className="flex-1 min-h-[56px] px-6 py-4 bg-gradient-to-r from-primary to-primary-400 text-white
              rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20
              active:scale-[0.98] transition-transform"
          >
            <span className="text-2xl">+</span> สร้างรายงานใหม่
          </button>
          <button
            onClick={handleImportJSON}
            className="min-h-[56px] min-w-touch px-4 bg-white border-2 border-gray-200 text-gray-600
              rounded-2xl font-medium text-sm flex flex-col items-center justify-center gap-0.5
              active:scale-95 transition-transform"
          >
            <span className="text-lg">📥</span>
            <span className="text-xs">นำเข้า</span>
          </button>
          <button
            onClick={handleLoadSample}
            className="min-h-[56px] min-w-touch px-4 bg-white border-2 border-gray-200 text-gray-600
              rounded-2xl font-medium text-sm flex flex-col items-center justify-center gap-0.5
              active:scale-95 transition-transform"
          >
            <span className="text-lg">📋</span>
            <span className="text-xs">ตัวอย่าง</span>
          </button>
        </div>

        {/* Report Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium">ยังไม่มีรายงาน</p>
            <p className="text-sm mt-1">กดปุ่ม "สร้างรายงานใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((report) => {
              const avg = calculateAverageScore(report.scores);
              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                    menuOpen === report.id ? 'relative z-30' : 'relative z-0'
                  }`}
                >
                  <div className="flex items-stretch">
                    {/* Status bar */}
                    <div className={`w-1.5 rounded-l-2xl ${report.status === 'completed' ? 'bg-green-500' : 'bg-amber-400'}`} />

                    {/* Main content */}
                    <button
                      type="button"
                      onClick={async () => {
                        await viewReport(report.id);
                      }}
                      className="flex-1 px-5 py-4 text-left cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-gray-800 truncate">
                            {report.companyName || '(ไม่ระบุชื่อบริษัท)'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            📅 {toThaiDateFull(report.visitDate)} • ครั้งที่ {report.visitNo}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          {avg !== null && (
                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                              ⭐ {avg.toFixed(1)}
                            </div>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold
                            ${report.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {report.status === 'completed' ? 'เสร็จแล้ว' : 'ร่าง'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Menu button */}
                    <div className="relative flex items-center pr-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === report.id ? null : report.id);
                        }}
                        className="min-w-touch min-h-touch flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>

                      {menuOpen === report.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-40 min-w-[160px] py-1 overflow-hidden">
                          <button onClick={() => { openReport(report.id); setMenuOpen(null); }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            📂 เปิด
                          </button>
                          <button onClick={() => { duplicateReport(report.id); setMenuOpen(null); }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            📋 ทำสำเนา
                          </button>
                          <button onClick={() => { setPreviewReport(report); setMenuOpen(null); }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            👁️ ดูตัวอย่าง (Preview)
                          </button>
                          <button onClick={() => handleExportPDF(report.id)}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            📄 ออก PDF
                          </button>
                          <button onClick={() => handleExportJSON(report.id)}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            💾 Export JSON
                          </button>
                          <hr className="my-1" />
                          <button onClick={() => setConfirmDelete(report.id)}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            🗑️ ลบ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-300 mt-12 pb-8">
          Visit Yard Report v1.0 • ข้อมูลถูกเก็บในเครื่องนี้เท่านั้น
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">⚠️ ยืนยันการลบ</h3>
            <p className="text-sm text-gray-500 mb-6">คุณแน่ใจหรือไม่ที่จะลบรายงานนี้? การลบจะไม่สามารถกู้คืนได้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 min-h-touch px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 min-h-touch px-4 py-3 bg-red-500 text-white rounded-xl font-bold"
              >
                ลบรายงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewReport && (
        <PDFPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
        />
      )}

      {/* Close menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
