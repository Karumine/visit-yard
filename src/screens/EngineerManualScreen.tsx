import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  Building2,
  ClipboardCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Search,
  Wrench,
  HelpCircle
} from 'lucide-react';

export default function EngineerManualScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'yard' | 'checklist' | 'safety'>('yard');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่ Engineer Hub</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                คู่มือการใช้งานและมาตรฐานการตรวจภาคสนาม
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                ข้อปฏิบัติ คู่มือการกรอกข้อมูล และแนวทางการตรวจเช็กสำหรับวิศวกร
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex items-center space-x-2 border-b border-slate-200 pb-px">
            <button
              onClick={() => setActiveTab('yard')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'yard'
                  ? 'border-blue-600 text-blue-700 bg-blue-50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>คู่มือการตรวจ Visit Yard</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'checklist'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>คู่มือระบบ Checklist</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'safety'
                  ? 'border-purple-600 text-purple-700 bg-purple-50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ความปลอดภัยภาคสนาม (Safety)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Tab 1: Visit Yard Manual */}
        {activeTab === 'yard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>ขั้นตอนการลงบันทึกการเข้าตรวจแปลง (Visit Yard Workflow)</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">1</span>
                  <h3 className="font-semibold text-slate-900 text-sm">กรอกข้อมูลทั่วไป</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    ระบุชื่อวิศวกรผู้ตรวจ ชื่อลูกค้า/แปลง เลขที่สัญญา/งาน วันที่เข้าตรวจ และเลือกสถานที่
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">2</span>
                  <h3 className="font-semibold text-slate-900 text-sm">ประเมินคะแนน 7 หมวด</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    ประเมินสภาพพื้นที่ โครงสร้าง ระบบไฟฟ้า ความปลอดภัย อุปกรณ์ และการจัดเก็บตามเกณฑ์
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">3</span>
                  <h3 className="font-semibold text-slate-900 text-sm">แนบรูปภาพ & ลายเซ็น</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    ถ่ายรูปภาพสภาพแปลง เซ็นชื่อดิจิทัลผู้ตรวจและผู้รับตรวจ แล้วออกรายงาน PDF/Excel
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3">เกณฑ์การให้คะแนน 7 หมวดหมู่</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>1. สภาพทั่วไปของแปลง:</strong> ความสะอาด ความเป็นระเบียบ และการจัดการพื้นที่</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>2. โครงสร้างและอาคาร:</strong> ความมั่นคงแข็งแรง หลังคา พื้น และการป้องกันสภาพอากาศ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>3. ระบบไฟฟ้าและสายส่ง:</strong> ความปลอดภัยตู้ควบคุม การสายดิน และการเดินสายไฟ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>4. อุปกรณ์และการจัดเก็บเครื่องจักร:</strong> สภาพเครื่องจักร การจัดวาง และการบำรุงรักษา</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Checklist Manual */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 mb-4">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                <span>คู่มือการใช้งานระบบ Checklist ตรวจเช็กเครื่องจักร</span>
              </h2>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="font-bold text-emerald-700 text-base mb-1">1. การเลือก Template และเครื่องจักร</h3>
                  <p className="text-xs text-slate-500">
                    เลือกประเภทแม่แบบรายการตรวจสอบ (Template) ที่ตรงกับรุ่นเครื่องจักร เช่น เครื่องอัดแท่ง, เครื่องสับไม้ หรือระบบสายพาน
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="font-bold text-emerald-700 text-base mb-1">2. การกรอกแบบประเมินและค่าพารามิเตอร์</h3>
                  <p className="text-xs text-slate-500">
                    วัดค่าแรงดันไฟฟ้า, กระแสไฟฟ้า, ชั่วโมงการทำงาน (Run hours), สภาพชิ้นส่วน และบันทึกผ่าน/ไม่ผ่าน
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="font-bold text-emerald-700 text-base mb-1">3. สรุปผลและการออกเอกสาร</h3>
                  <p className="text-xs text-slate-500">
                    ระบบจะคำนวณสัดส่วนข้อที่ผ่าน/ไม่ผ่านอัตโนมัติ พร้อมแสดงข้อเสนอแนะในการซ่อมบำรุง
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Safety Guidelines */}
        {activeTab === 'safety' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>ข้อปฏิบัติความปลอดภัยในการเข้าตรวจหน้างาน (Safety Protocols)</span>
              </h2>

              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-800 text-sm">การสวมใส่อุปกรณ์ PPE ครบถ้วน</h3>
                    <p className="text-xs text-amber-700 mt-1">
                      หมวกนิรภัย (Safety Helmet), รองเท้าเซฟตี้ (Safety Shoes), และเสื้อสะท้อนแสง เป็นสิ่งจำเป็นทุกครั้งที่ก้าวเข้าสู่พื้นที่แปลง
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-800 text-sm">Lockout / Tagout (LOTO) ก่อนตรวจเช็กเครื่องจักร</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      ตรวจสอบให้มั่นใจว่าเครื่องจักรตัดกระแสไฟฟ้าหลักแล้วก่อนเข้าสัมผัสชิ้นส่วนเคลื่อนที่ทุกครั้ง
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
