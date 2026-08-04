import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ClipboardCheck,
  Wrench,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BookOpen,
  Cpu,
  Layers,
  Database,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Search
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { useTemplateStore } from '../checklist/store/useTemplateStore';
import { useMachineStore } from '../checklist/store/useMachineStore';
import { toThaiDateFull } from '../lib/thaidate';
import type { VisitReport } from '../types/report';

export default function EngineerHubScreen() {
  const navigate = useNavigate();
  const { reports, loadReports, createNewReport, viewReport, isOnline } = useAppStore();
  const { templates } = useTemplateStore();
  const { machines } = useMachineStore();
  
  const [checklistRecordsCount, setChecklistRecordsCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadReports();
    try {
      const stored = localStorage.getItem('checklist_inspections');
      if (stored) {
        const parsed = JSON.parse(stored);
        setChecklistRecordsCount(Array.isArray(parsed) ? parsed.length : 1);
      } else {
        setChecklistRecordsCount(1); // seed item
      }
    } catch {
      setChecklistRecordsCount(1);
    }
  }, [loadReports]);

  // Statistics calculation
  const totalYardReports = reports.length;
  const draftYardReports = reports.filter((r) => r.status === 'draft').length;
  const completedYardReports = reports.filter((r) => r.status === 'completed').length;
  const totalTemplates = templates.length;
  const totalMachines = machines.length;

  const handleStartVisitYard = () => {
    createNewReport();
    navigate('/visit-yard');
  };

  const handleStartChecklist = () => {
    navigate('/checklist/inspect');
  };

  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.companyName?.toLowerCase().includes(query) ||
      r.address?.toLowerCase().includes(query) ||
      r.inspectorName?.toLowerCase().includes(query) ||
      r.machineType?.toLowerCase().includes(query)
    );
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      
      {/* Hero / Header Banner */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200 pt-8 pb-12 px-4 sm:px-6 lg:px-8 shadow-xs">
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Centralized Engineer Hub Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                ระบบรวมศูนย์งานวิศวกรภาคสนาม
              </h1>
              <p className="mt-2 text-slate-600 text-base max-w-2xl">
                เลือกปฏิบัติงานเข้าตรวจแปลงหน้างาน (Visit Yard) หรือตรวจเช็กเครื่องจักรตามรายการ (Checklist System) พร้อมออกรายงาน PDF และซิงค์ข้อมูล Offline ในที่เดียว
              </p>
            </div>

            {/* Quick Actions Header Cluster */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartVisitYard}
                className="flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Building2 className="w-5 h-5" />
                <span>เข้าตรวจแปลงใหม่</span>
              </button>
              <button
                onClick={handleStartChecklist}
                className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span>ทำ Checklist ใหม่</span>
              </button>
            </div>

          </div>

          {/* Quick Stats Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Stat 1: Yard Visits */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">รายงาน Visit Yard</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">{totalYardReports}</span>
                  <span className="text-xs text-slate-500">({completedYardReports} เสร็จสิ้น)</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Checklists */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">รายการ Checklist</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">{checklistRecordsCount}</span>
                  <span className="text-xs text-slate-500">บันทึกตรวจ</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Machines & Templates */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">เครื่องจักร / Templates</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">{totalMachines}</span>
                  <span className="text-xs text-slate-500">เครื่อง ({totalTemplates} แม่แบบ)</span>
                </div>
              </div>
            </div>

            {/* Stat 4: System Status */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">สถานะฐานข้อมูล</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-emerald-700">Dexie PWA Ready</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">

        {/* Section 1: Main Web Applications Selector */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>ระบบงานหลักสำหรับวิศวกร (Engineer Core Applications)</span>
              </h2>
              <p className="text-sm text-slate-500">
                คลิกเลือกเข้าสู่ระบบที่ต้องการปฏิบัติงาน
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Main Application Card 1: VISIT YARD */}
            <div className="group relative bg-white border border-slate-200 hover:border-blue-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                  ระบบบันทึกเข้าตรวจแปลง
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Visit Yard Inspection System
              </h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                ระบบสำหรับวิศวกรเข้าตรวจไซต์งาน บันทึกคะแนนประเมิน 7 หมวดหมู่ ถ่ายภาพสภาพแปลงหน้างาน เซ็นชื่อดิจิทัล และออกรายงาน PDF / Excel ทันที
              </p>

              {/* Key Features Checklist */}
              <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>บันทึกคะแนน 7 หมวดหมู่</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>สร้างรายงาน PDF / Excel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>รองรับการเซ็นชื่อดิจิทัล</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>บันทึกแบบ Offline ชั่วคราว</span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-4 flex items-center justify-between">
                <button
                  onClick={() => navigate('/visit-yard')}
                  className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-colors"
                >
                  <span>เข้าสู่ระบบ Visit Yard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Application Card 2: CHECKLIST SYSTEM */}
            <div className="group relative bg-white border border-slate-200 hover:border-emerald-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
                  ระบบ Checklist เครื่องจักร
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Checklist Inspection System
              </h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                ระบบจัดการ Checklist และตรวจเช็กเครื่องจักรตามรายการ (Preventive Maintenance) ปรับแต่ง Template อิสระ พร้อมระบบ Drag & Drop และสรุปผล
              </p>

              {/* Key Features Checklist */}
              <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>จัดการ แม่แบบ Template</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ทะเบียนเครื่องจักร (Machine)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Drag & Drop Form Builder</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>สรุปผลคะแนนผ่าน/ไม่ผ่าน</span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-4 flex items-center justify-between">
                <button
                  onClick={() => navigate('/checklist')}
                  className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition-colors"
                >
                  <span>เข้าสู่ระบบ Checklist</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Recent Reports & Search */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Visit Yard Reports Feed */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>รายการเข้าตรวจแปลงล่าสุด (Recent Visit Yard Reports)</span>
                </h3>
                <p className="text-xs text-slate-500">ประวัติการบันทึกรายงานเข้าตรวจหน้างานในเครื่องนี้</p>
              </div>

              {/* Quick Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อลูกค้า / เลขงาน / แปลง..."
                  className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl">
                <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-500 text-sm">ยังไม่มีรายงานเข้าตรวจแปลงที่ค้นหา</p>
                <button
                  onClick={handleStartVisitYard}
                  className="mt-3 inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างรายงาน Visit Yard รายการแรก</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => viewReport(report.id).then(() => navigate('/visit-yard'))}
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        report.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {report.status === 'completed' ? '✓' : 'D'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                            {report.companyName || 'ไม่ระบุชื่อบริษัท/ลูกค้า'}
                          </h4>
                          <span className="text-xs text-slate-500">• ครั้งที่: {report.visitNo || 1}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          สถานที่: {report.address || '-'} | โดย {report.inspectorName || 'วิศวกร'} | {toThaiDateFull(report.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                        report.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {report.status === 'completed' ? 'สมบูรณ์' : 'ร่าง'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={() => navigate('/visit-yard')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center space-x-1"
              >
                <span>ดูรายงาน Visit Yard ทั้งหมด ({reports.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Engineer Toolbox & Resources Sidebar */}
          <div className="space-y-6">
            
            {/* Resource Card: Manuals */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2 mb-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>คลังคู่มือ & ข้อปฏิบัติ</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                เอกสารคำแนะนำขั้นตอนการทำงานและการเข้าตรวจภาคสนาม
              </p>

              <div className="space-y-2">
                <Link
                  to="/manual"
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                      คู่มือการเข้าตรวจแปลง Visit Yard
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                </Link>

                <Link
                  to="/manual"
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <ClipboardCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                      คู่มือระบบ Checklist เครื่องจักร
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                </Link>
              </div>
            </div>

            {/* Quick Engineer Tools */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2 mb-3">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>เครื่องมือวิศวกรภาคสนาม</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => navigate('/checklist/templates')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-colors"
                >
                  <Layers className="w-4 h-4 text-purple-600 mb-1" />
                  <span className="font-semibold text-slate-800 block">จัดการ Template</span>
                  <span className="text-[10px] text-slate-500">Checklist แม่แบบ</span>
                </button>

                <button
                  onClick={() => navigate('/checklist/machines')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-colors"
                >
                  <Cpu className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="font-semibold text-slate-800 block">ทะเบียนเครื่องจักร</span>
                  <span className="text-[10px] text-slate-500">{machines.length} รายการ</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
