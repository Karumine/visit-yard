// ==========================================
// HomeScreen — รายการรายงาน
// ==========================================
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { calculateAverageScore, VisitReport } from '../types/report';
import { toThaiDateFull } from '../lib/thaidate';
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 text-slate-900 px-6 py-5 shadow-xs">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-slate-100 rounded-xl px-3.5 py-1.5 shadow-xs flex items-center justify-center border border-slate-200">
              <img
                src="/Logo_Agile Assets_CMYK.png"
                alt="Agile Assets Logo"
                className="h-9 w-auto object-contain min-w-[36px]"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">รายงานการเข้าเยี่ยม ลูกค้า/Yard</h1>
              <p className="text-sm text-slate-500">Agile Assets — Visit Report System</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อบริษัท..."
              className="w-full min-h-touch pl-12 pr-4 py-3 text-base border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400
                focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
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
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
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
            className="flex-1 min-h-[56px] px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white
              rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-md
              active:scale-[0.98] transition-transform"
          >
            <span className="text-2xl">+</span> สร้างรายงานใหม่
          </button>
          <button
            onClick={handleImportJSON}
            className="min-h-[56px] min-w-touch px-4 bg-white border border-slate-200 text-slate-700
              rounded-2xl font-medium text-sm flex flex-col items-center justify-center gap-0.5
              active:scale-95 transition-transform hover:bg-slate-50 shadow-xs"
          >
            <span className="text-lg">📥</span>
            <span className="text-xs">นำเข้า</span>
          </button>
          <button
            onClick={handleLoadSample}
            className="min-h-[56px] min-w-touch px-4 bg-white border border-slate-200 text-slate-700
              rounded-2xl font-medium text-sm flex flex-col items-center justify-center gap-0.5
              active:scale-95 transition-transform hover:bg-slate-50 shadow-xs"
          >
            <span className="text-lg">📋</span>
            <span className="text-xs">ตัวอย่าง</span>
          </button>
        </div>

        {/* Report Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium text-slate-700">ยังไม่มีรายงาน</p>
            <p className="text-sm mt-1">กดปุ่ม "สร้างรายงานใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((report) => {
              const avg = calculateAverageScore(report.scores);
              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all ${menuOpen === report.id ? 'relative z-30' : 'relative z-0'
                    }`}
                >
                  <div className="flex items-stretch">
                    {/* Status bar */}
                    <div className={`w-1.5 rounded-l-2xl ${report.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'}`} />

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
                          <h3 className="font-bold text-base text-slate-900 truncate">
                            {report.companyName || '(ไม่ระบุชื่อบริษัท)'}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            📅 {toThaiDateFull(report.visitDate)} • ครั้งที่ {report.visitNo}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          {avg !== null && (
                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-200">
                              ⭐ {avg.toFixed(1)}
                            </div>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            report.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
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
                        className="min-w-touch min-h-touch flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-95 transition-all"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>

                      {menuOpen === report.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 min-w-[160px] py-1 overflow-hidden">
                          <button onClick={() => { openReport(report.id); setMenuOpen(null); }}
                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                            📂 เปิด
                          </button>
                          <button onClick={() => { duplicateReport(report.id); setMenuOpen(null); }}
                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                            📋 ทำสำเนา
                          </button>
                          <button onClick={() => { setPreviewReport(report); setMenuOpen(null); }}
                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                            👁️ ดูตัวอย่าง (Preview)
                          </button>
                          <button onClick={() => handleExportJSON(report.id)}
                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                            💾 Export JSON
                          </button>
                          <hr className="my-1 border-slate-200" />
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
        <div className="text-center text-xs text-slate-500 mt-12 pb-8">
          Visit Yard Report v1.0 • เชื่อมต่อฐานข้อมูล Firebase Cloud Sync ☁️
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">⚠️ ยืนยันการลบ</h3>
            <p className="text-sm text-slate-600 mb-6">คุณแน่ใจหรือไม่ที่จะลบรายงานนี้? การลบจะไม่สามารถกู้คืนได้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 min-h-touch px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 border border-slate-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 min-h-touch px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-sm"
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

