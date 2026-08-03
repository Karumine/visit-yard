// ==========================================
// ReportDetailScreen — แสดงรายงานรูปแบบเดียวกับ PDF Preview (Full width, Compact print)
// ==========================================
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { toThaiDateFull } from '../lib/thaidate';
import { calculateAverageScore } from '../types/report';
import { generatePDF } from '../lib/pdf';

/** Convert Blob to Data URL */
function photoToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    if (!blob) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(blob);
  });
}

interface PhotoItem {
  url: string;
  label: string;
  caption?: string;
}

export default function ReportDetailScreen() {
  const { currentReport: report, setScreen, openReport } = useAppStore();
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Convert photo blobs to data URLs on mount
  useEffect(() => {
    if (!report) return;
    let mounted = true;

    (async () => {
      const machinePhotoUrls = await Promise.all(
        (report.machinePhotos || []).map(async (p) => ({
          url: await photoToDataUrl(p.blob),
          label: 'เครื่องจักร',
          caption: p.caption,
        }))
      );
      const sitePhotoUrls = await Promise.all(
        (report.sitePhotos || []).map(async (p) => ({
          url: await photoToDataUrl(p.blob),
          label: 'สถานที่/Yard',
          caption: p.caption,
        }))
      );
      if (mounted) {
        setPhotoItems([...machinePhotoUrls, ...sitePhotoUrls].filter((p) => p.url));
      }
    })();

    return () => { mounted = false; };
  }, [report]);

  if (!report) return null;

  const validContacts = (report.contacts || []).filter((c) => c.name && c.name.trim());
  const obs = report.observations;
  const scores = report.scores;
  const avg = calculateAverageScore(scores);
  const approvals = report.approvals || {} as typeof report.approvals;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generatePDF(report);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = async () => {
    await openReport(report.id);
  };

  /* ----- Style helpers (Full width, compact vertical padding for 1-page A4 print) ----- */
  const sectionHeader = "bg-[#1B3A5F] text-white px-3 py-1.5 font-bold text-sm mb-1 rounded-sm print:hidden";
  const labelCell = "bg-slate-50 px-3 py-1.5 font-bold text-slate-800 border-r border-slate-300 flex items-start text-xs print:bg-slate-50 print:py-0.5 print:px-2 print:text-[11px]";
  const valueCell = "px-3 py-1.5 text-xs break-words print:py-0.5 print:px-2 print:text-[11px]";
  const rowBorder = "flex border-b border-slate-300 items-stretch";
  const rowNoBorder = "flex items-stretch";

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white print:min-h-0">
      {/* Embedded style for exact 100% full-width A4 print rendering */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 6mm;
          }
          html, body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#1B3A5F] text-white px-4 py-3 shadow-lg print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen('home')}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-base truncate">{report.companyName || 'รายงาน'}</h1>
              <p className="text-xs opacity-80">📅 {toThaiDateFull(report.visitDate)} • ครั้งที่ {report.visitNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="min-h-[44px] px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 transition-colors"
            >
              ✏️ <span className="hidden sm:inline">แก้ไข</span>
            </button>
            <button
              onClick={handlePrint}
              className="min-h-[44px] px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 transition-colors shadow"
              title="พิมพ์เอกสาร หรือเลือก Save as PDF ได้ตัวหนังสือตรงคมชัด 100%"
            >
              🖨️ <span>พิมพ์ / เซฟ PDF</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="min-h-[44px] px-3 py-2 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1 transition-colors"
              title="ดาวน์โหลดไฟล์ PDF โดยตรง"
            >
              📥 <span>{downloading ? 'กำลังสร้าง...' : 'PDF รูปภาพ'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* A4-like Document */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 print:p-0 print:m-0 print:max-w-none print-full-width">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none print:w-full">
          <div className="p-4 sm:p-6 md:p-8 print:p-0" style={{ fontFamily: "'Sarabun', 'Prompt', 'Noto Sans Thai', sans-serif", lineHeight: 1.35 }}>

            {/* HEADER */}
            <div className="flex justify-between items-center border-b-[3px] border-[#1B3A5F] pb-3 mb-4 print:pb-1.5 print:mb-2">
              <div className="flex items-center gap-3">
                <img src="/Logo_Agile Assets_CMYK.png" className="h-10 print:h-8 object-contain" alt="Logo" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} />
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[#1B3A5F] leading-tight print:text-base">รายงานการเข้าเยี่ยม ลูกค้า/Yard</div>
                  <div className="text-xs text-slate-400 print:text-[10px]">Agile Assets — Customer/Yard Visit Report</div>
                </div>
              </div>
              <div className="text-right text-xs sm:text-sm text-slate-600 leading-snug print:text-xs">
                <div><strong className="text-[#1B3A5F]">วันที่เข้าเยี่ยม:</strong> {toThaiDateFull(report.visitDate)}</div>
                <div><strong className="text-[#1B3A5F]">ครั้งที่:</strong> {report.visitNo}</div>
              </div>
            </div>

            {/* SECTION 1: ข้อมูลทั่วไป */}
            <div className={sectionHeader}>1. ข้อมูลทั่วไป (General Information)</div>
            <div className="border border-slate-300 rounded-sm mb-3 print:mb-1.5 text-xs print:text-[11px]">
              <div className={rowBorder}>
                <div className={`w-[18%] ${labelCell}`}>ชื่อบริษัท:</div>
                <div className={`w-[32%] ${valueCell} font-bold text-slate-900 border-r border-slate-300`}>{report.companyName || '-'}</div>
                <div className={`w-[20%] ${labelCell}`}>ประเภทลูกค้า/Yard:</div>
                <div className={`w-[30%] ${valueCell}`}>{report.customerType === 'existing' ? 'ลูกค้าเดิม' : 'ลูกค้าใหม่'} / {report.yardType === 'existing' ? 'Yard เดิม' : 'Yard ใหม่'}</div>
              </div>
              <div className={rowBorder}>
                <div className={`w-[18%] ${labelCell}`}>ที่อยู่:</div>
                <div className={`w-[82%] ${valueCell}`}>{report.address || '-'}</div>
              </div>
              <div className={rowBorder}>
                <div className={`w-[18%] ${labelCell}`}>กลุ่มเครื่องจักร:</div>
                <div className={`w-[32%] ${valueCell} border-r border-slate-300`}>{report.assetGroupType === 'existing' ? 'เครื่องจักรกลุ่มเดิม' : 'เครื่องจักรกลุ่มใหม่'}</div>
                <div className={`w-[20%] ${labelCell}`}>ประเภทเครื่องจักร:</div>
                <div className={`w-[30%] ${valueCell}`}>{report.machineType || '-'}</div>
              </div>
              <div className={rowNoBorder}>
                <div className={`w-[18%] ${labelCell}`}>ลักษณะธุรกิจ:</div>
                <div className={`w-[82%] ${valueCell}`}>{report.visitorBusinessNature || '-'}</div>
              </div>
            </div>

            {/* SECTION 2: ผู้ติดต่อ & วัตถุประสงค์ */}
            <div className={sectionHeader}>2. ผู้ที่ได้เข้าพบ &amp; วัตถุประสงค์ (Contacts &amp; Visit Purpose)</div>
            <div className="flex gap-3 mb-3 print:mb-1.5 print:gap-1.5">
              <div className="flex-[1.2] border border-slate-300 rounded-sm overflow-hidden">
                <div className="flex bg-[#DCE9F5] text-[#1B3A5F] font-bold text-[11px] border-b border-slate-300 print:text-[10px]">
                  <div className="w-[40%] px-3 py-1.5 print:py-0.5 print:px-2 border-r border-slate-300">ชื่อผู้ติดต่อ</div>
                  <div className="w-[30%] px-3 py-1.5 print:py-0.5 print:px-2 border-r border-slate-300">ตำแหน่ง</div>
                  <div className="w-[30%] px-3 py-1.5 print:py-0.5 print:px-2">เบอร์โทร</div>
                </div>
                {validContacts.length > 0 ? validContacts.map((c, idx) => (
                  <div key={idx} className={`flex text-xs print:text-[11px] ${idx < validContacts.length - 1 ? 'border-b border-slate-300' : ''}`}>
                    <div className="w-[40%] px-3 py-1.5 print:py-0.5 print:px-2 border-r border-slate-300 break-words">{c.name}</div>
                    <div className="w-[30%] px-3 py-1.5 print:py-0.5 print:px-2 border-r border-slate-300 break-words">{c.position || '-'}</div>
                    <div className="w-[30%] px-3 py-1.5 print:py-0.5 print:px-2 break-words">{c.phone || '-'}</div>
                  </div>
                )) : (
                  <div className="px-3 py-2 print:py-1 text-center text-slate-400 text-xs print:text-[10px]">- ไม่ระบุ -</div>
                )}
              </div>
              <div className="flex-1 border border-slate-300 px-3 py-2 print:py-1 print:px-2 rounded-sm text-xs print:text-[11px] bg-slate-50 break-words">
                <div className="font-bold text-[#1B3A5F] mb-1 print:mb-0.5">วัตถุประสงค์ในการเยี่ยม:</div>
                <div className="text-slate-600">{report.visitPurpose || '-'}</div>
              </div>
            </div>

            {/* SECTION 3: รายละเอียดการเข้าเยี่ยม */}
            <div className={sectionHeader}>3. รายละเอียดการเข้าเยี่ยม (Visit Details &amp; Photos)</div>
            <div className="border border-slate-300 rounded-sm mb-3 print:mb-1.5 text-xs print:text-[11px]">
              <div className={rowBorder}>
                <div className={`w-[24%] ${labelCell}`}>รายละเอียดการเยี่ยม:</div>
                <div className={`w-[76%] ${valueCell}`}>{report.visitDetail || '-'}</div>
              </div>
              <div className={rowBorder}>
                <div className={`w-[24%] ${labelCell}`}>ข้อมูลเครื่องจักรขอสินเชื่อ:</div>
                <div className={`w-[76%] ${valueCell}`}>{report.financedMachineInfo || '-'}</div>
              </div>
              <div className={rowNoBorder}>
                <div className={`w-[24%] ${labelCell}`}>ข้อมูลลูกค้าเบื้องต้น:</div>
                <div className={`w-[76%] ${valueCell}`}>{report.customerBackground || '-'}</div>
              </div>
            </div>

            {/* Photos */}
            {photoItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 print:mb-1.5 print:gap-1.5">
                {photoItems.slice(0, 6).map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhoto({ url: p.url, title: `${p.label} ${idx + 1}`, caption: p.caption })}
                    className="border border-slate-200 rounded-md p-1 text-center bg-white w-[130px] print:w-[110px] print:p-0.5 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group relative"
                  >
                    <div className="relative overflow-hidden rounded">
                      <img src={p.url} className="w-full h-16 print:h-11 object-cover rounded group-hover:scale-105 transition-transform duration-200" alt={p.label} />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-bold print:hidden">
                        🔍 ขยาย
                      </div>
                    </div>
                    <div className="text-[10px] print:text-[9px] text-slate-500 mt-0.5 truncate">{p.label}{p.caption ? ': ' + p.caption : ''}</div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 4: ข้อสังเกต */}
            <div className={sectionHeader}>4. ข้อสังเกต (Observations)</div>
            <div className="border border-slate-300 rounded-sm mb-3 print:mb-1.5 text-xs print:text-[11px]">
              <div className={rowBorder}>
                <div className={`w-[20%] ${labelCell}`}>1. ประสบการณ์:</div>
                <div className={`w-[30%] ${valueCell} border-r border-slate-300`}>
                  ปฏิบัติ: {obs.experience.isOperator || '-'} | บริหาร: {obs.experience.isExecutive || '-'}<br />
                  องค์กร: {obs.experience.isCorporate || '-'} | ครอบครัว: {obs.experience.isFamily || '-'}
                </div>
                <div className={`w-[20%] ${labelCell}`}>2. ทีมงาน Srv/Op:</div>
                <div className={`w-[30%] ${valueCell}`}>
                  {obs.team.main || '-'}<br />
                  Srv: {obs.team.srvTeam || '-'} | Op: {obs.team.opTeam || '-'}
                </div>
              </div>
              <div className={rowBorder}>
                <div className={`w-[20%] ${labelCell}`}>3. การจัดการอะไหล่:</div>
                <div className={`w-[30%] ${valueCell} border-r border-slate-300`}>{obs.spareParts || '-'}</div>
                <div className={`w-[20%] ${labelCell}`}>4. ระบบป้องกันสูญหาย:</div>
                <div className={`w-[30%] ${valueCell}`}>{obs.theftPrevention || '-'}</div>
              </div>
              <div className={rowBorder}>
                <div className={`w-[20%] ${labelCell}`}>5. ลักษณะลูกค้าที่มี:</div>
                <div className={`w-[30%] ${valueCell} border-r border-slate-300`}>{obs.customerCharacteristics || '-'}</div>
                <div className={`w-[20%] ${labelCell}`}>6. คู่แข่ง:</div>
                <div className={`w-[30%] ${valueCell}`}>{obs.competitors || '-'}</div>
              </div>
              <div className={rowBorder}>
                <div className={`w-[20%] ${labelCell}`}>7. มูลค่าเครื่องจักร (ลบ.):</div>
                <div className={`w-[80%] ${valueCell}`}>
                  สูงสุด: {obs.machineValue.highest ?? '-'} | ต่ำสุด: {obs.machineValue.lowest ?? '-'} | เฉลี่ย: {obs.machineValue.average ?? '-'} | รวม: {obs.machineValue.total ?? '-'} ({obs.machineValue.remark || 'ยอดขาย/ปี'})
                </div>
              </div>
              <div className={rowNoBorder}>
                <div className={`w-[20%] ${labelCell}`}>8. อื่นๆ:</div>
                <div className={`w-[80%] ${valueCell}`}>{obs.others || '-'}</div>
              </div>
            </div>

            {/* SECTION 5: คะแนนความน่าสนใจ */}
            <div className={sectionHeader}>5. คะแนนความน่าสนใจ (Interest Scores 0–10)</div>
            <div className="flex gap-3 items-center mb-3 print:mb-1.5 print:gap-1.5">
              <div className="flex-1 grid grid-cols-4 gap-2 print:gap-1">
                {[
                  { label: 'ลักษณะธุรกิจ', value: scores.businessNature },
                  { label: 'ลักษณะเจ้าของ', value: scores.ownerCharacter },
                  { label: 'ฐานลูกค้า', value: scores.customerBase },
                  { label: 'ความเป็นพันธมิตร', value: scores.partnership },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#DCE9F5] rounded-md px-2 py-2 print:py-1 text-center border border-[#bbe0f5] flex flex-col justify-center items-center">
                    <div className="text-[10px] print:text-[9px] font-bold text-[#1B3A5F] mb-0.5">{item.label}</div>
                    <div className="text-base print:text-sm font-bold text-slate-900 leading-none">{item.value !== null ? item.value : '-'}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#1B3A5F] text-white rounded-lg px-4 py-2.5 print:py-1.5 print:px-2.5 text-center min-w-[100px] print:min-w-[85px] flex flex-col justify-center items-center">
                <div className="text-[10px] print:text-[9px] opacity-90 mb-0.5">คะแนนเฉลี่ย</div>
                <div className="text-lg print:text-base font-bold leading-none">⭐ {avg !== null ? avg.toFixed(1) : '-'}/10</div>
              </div>
            </div>

            {/* SECTION 6: สรุป & ผู้ตรวจ */}
            <div className={sectionHeader}>6. สรุปการดำเนินการ &amp; ผู้รายงาน (Summary &amp; Inspector)</div>
            <div className="flex gap-3 mb-3 print:mb-1.5 print:gap-1.5">
              <div className="flex-[2] border border-slate-300 px-3 py-2 print:py-1 print:px-2 rounded-sm text-xs print:text-[11px] bg-slate-50 break-words">
                <div><strong>การดำเนินการถัดไป (Next Action):</strong> {report.nextAction || '-'}</div>
                {report.nextAppointment && (
                  <div className="mt-1 print:mt-0.5"><strong>วันนัดหมายครั้งถัดไป:</strong> {toThaiDateFull(report.nextAppointment)}</div>
                )}
              </div>
              <div className="flex-1 border border-slate-300 px-3 py-2 print:py-1 print:px-2 rounded-sm text-center bg-white flex flex-col justify-between">
                <div className="font-bold text-xs print:text-[10px] text-[#1B3A5F]">ผู้เข้าเยี่ยม/รายงาน (AA)</div>
                {report.inspectorSignature ? (
                  <img
                    src={report.inspectorSignature}
                    className="h-7 print:h-5 max-w-full object-contain mx-auto my-1 print:my-0.5 cursor-pointer hover:scale-110 transition-transform"
                    alt="Signature"
                    onClick={() => setSelectedPhoto({ url: report.inspectorSignature!, title: 'ลายเซ็นผู้เข้าเยี่ยม (Inspector Signature)' })}
                  />
                ) : (
                  <div className="h-7 print:h-5" />
                )}
                <div className="text-xs print:text-[10px] text-slate-600 border-t border-dashed border-slate-300 pt-1 print:pt-0.5">
                  {report.inspectorName || '(................................................)'}
                </div>
              </div>
            </div>

            {/* SECTION 7: ช่องเซ็นอนุมัติ */}
            <div className={sectionHeader}>7. ช่องเซ็นอนุมัติ (Inspected by)</div>
            <div className="grid grid-cols-3 gap-3 print:gap-1.5">
              {[
                { label: 'Engineering Department', data: approvals.engineering },
                { label: 'Credit Department', data: approvals.credit },
                { label: 'General Manager', data: approvals.generalManager },
              ].map((item, idx) => (
                <div key={idx} className="border border-slate-300 rounded-md px-3 py-2 print:py-1 print:px-2 text-center bg-white">
                  <div className="font-bold text-xs print:text-[10px] text-[#1B3A5F] mb-1 print:mb-0.5">{item.label}</div>
                  {item.data?.signature ? (
                    <img
                      src={item.data.signature}
                      className="h-6 print:h-5 max-w-full object-contain mx-auto cursor-pointer hover:scale-110 transition-transform"
                      alt="Signature"
                      onClick={() => setSelectedPhoto({ url: item.data!.signature!, title: `ลายเซ็นอนุมัติ (${item.label})` })}
                    />
                  ) : (
                    <div className="h-6 print:h-5" />
                  )}
                  <div className="text-[10px] print:text-[9px] text-slate-500 mt-1 print:mt-0.5 leading-snug">ชื่อ: {item.data?.name || '.....................................'}</div>
                  <div className="text-[10px] print:text-[9px] text-slate-500 mt-0.5 leading-snug">วันที่: ..... / ..... / ..........</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom info */}
        <div className="text-center text-xs text-gray-400 mt-4 pb-8 print:hidden">
          เอกสารสัดส่วน A4 1 หน้ามาตรฐาน • ตรวจสอบข้อความและความถูกต้องก่อนบันทึก
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 print:hidden animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-gray-800 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 text-white">
              <div>
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  <span>🖼️</span> {selectedPhoto.title}
                </h3>
                {selectedPhoto.caption && (
                  <p className="text-xs text-gray-400 mt-0.5">{selectedPhoto.caption}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center font-bold text-lg transition-colors"
                title="ปิด (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Image */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/70 min-h-[300px]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-900 text-center text-xs text-gray-400 border-t border-gray-800">
              กด ✕ หรือกดปุ่ม Esc เพื่อปิด
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
