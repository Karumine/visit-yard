
import type { InspectionRecord, FieldValue } from '../types/inspection';
import type { FormTemplate as Template, FormSection as Section, FormField } from '../types/template';
import type { Machine } from '../types/machine';
import { useSettingsStore } from '../store/useSettingsStore';

interface InspectionReportViewProps {
  inspection: InspectionRecord;
  template: Template;
  machine: Machine;
}

export default function InspectionReportView({ inspection, template, machine }: InspectionReportViewProps) {
  const { settings } = useSettingsStore();

  // Calculate scores
  let actual = 0;
  let max = 0;
  template.fields.forEach(f => {
    if (f.maxScore) {
      max += f.maxScore;
      const val = inspection.values.find(v => v.fieldId === f.id);
      if (val && typeof val.value === 'number') {
        actual += val.value;
      }
    }
  });
  const scorePercent = max > 0 ? Math.round((actual / max) * 100) : null;
  const isCritical = scorePercent !== null && scorePercent < settings.scoreThresholds.critical;
  const isWarning = scorePercent !== null && scorePercent >= settings.scoreThresholds.critical && scorePercent < settings.scoreThresholds.warning;

  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);

  const getFieldValue = (fieldId: string) => inspection.values.find(v => v.fieldId === fieldId);

  const isFieldVisible = (field: FormField) => {
    if (!field.conditionalRules) return true;
    const dependValue = getFieldValue(field.conditionalRules.dependsOn);
    return dependValue?.value === field.conditionalRules.showWhen;
  };

  const fieldsWithPhotos: { field: FormField, section: Section, value: FieldValue, url: string, index: number }[] = [];
  sortedSections.forEach(section => {
    template.fields.filter(f => f.sectionId === section.id && isFieldVisible(f)).forEach(field => {
      const val = getFieldValue(field.id);
      if (val?.mediaUrls && val.mediaUrls.length > 0) {
        val.mediaUrls.forEach((url, i) => {
          fieldsWithPhotos.push({ field, section, value: val, url, index: i + 1 });
        });
      }
    });
  });

  return (
    <div className="a4-report-container animate-fade-in flex-col gap-xl">
      <div className="a4-page">
        {/* Header */}
        <div className="a4-header">
          <div className="a4-brand">
            <h1 className="a4-company-name">{settings.systemTitle}</h1>
            <p className="a4-report-title">รายงานการตรวจสอบเครื่องจักร</p>
          </div>
          {scorePercent !== null && (
            <div className={`a4-score-badge ${isCritical ? 'critical' : isWarning ? 'warning' : 'good'}`}>
              <div className="score-value">{scorePercent}%</div>
              <div className="score-label">คะแนนรวม</div>
            </div>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="a4-metadata">
          <div className="a4-meta-group">
            <span className="meta-label">รายละเอียดอุปกรณ์</span>
            <div className="meta-grid">
              <div className="meta-item">
                <span className="lbl">ชื่อเครื่องจักร:</span>
                <span className="val font-bold">{machine.name}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">หมายเลขเครื่อง:</span>
                <span className="val">{machine.machineNo}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">ประเภทและรุ่น:</span>
                <span className="val">{machine.type}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">สถานที่:</span>
                <span className="val">{machine.location || '-'}</span>
              </div>
            </div>
          </div>
          <div className="a4-meta-group">
            <span className="meta-label">รายละเอียดการตรวจสอบ</span>
            <div className="meta-grid">
              <div className="meta-item">
                <span className="lbl">แม่แบบ:</span>
                <span className="val">{template.name} (v{inspection.templateVersion})</span>
              </div>
              <div className="meta-item">
                <span className="lbl">ผู้ตรวจสอบ:</span>
                <span className="val">{inspection.inspectorName}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">เวลาเริ่ม:</span>
                <span className="val">{new Date(inspection.startedAt).toLocaleString('th-TH')}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">เวลาเสร็จสิ้น:</span>
                <span className="val">{inspection.completedAt ? new Date(inspection.completedAt).toLocaleString('th-TH') : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flat Sections */}
        <div className="a4-content">
          {sortedSections.map(section => {
            const sectionFields = template.fields
              .filter(f => f.sectionId === section.id)
              .sort((a, b) => a.order - b.order)
              .filter(isFieldVisible)
              .filter(f => f.type !== 'signature'); // Exclude signatures from regular tables

            if (sectionFields.length === 0) return null;

            return (
              <div key={section.id} className="a4-section">
                <h2 className="a4-section-title">{section.title}</h2>
                {section.description && <p className="a4-section-desc">{section.description}</p>}
                
                <table className="a4-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>รายการตรวจสอบ</th>
                      <th style={{ width: '35%' }}>ผลการตรวจสอบ</th>
                      <th style={{ width: '25%' }}>หลักฐาน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionFields.map(field => {
                      const val = getFieldValue(field.id);
                      const displayVal = val?.value !== undefined && val?.value !== null ? val.value : "—";
                      
                      // Status logic for color coding
                      const isFail = displayVal === 'NG' || displayVal === 'fail' || displayVal === 'Fail' || displayVal === 'Overload';
                      const isPass = displayVal === 'OK' || displayVal === 'pass' || displayVal === 'Pass';
                      
                      return (
                        <tr key={field.id} className={isFail ? 'row-fail' : ''}>
                          <td>
                            <div className="field-label">{field.label}</div>
                            {field.maxScore && <div className="field-hint">คะแนนเต็ม: {field.maxScore}</div>}
                          </td>
                          <td>
                            {field.type === 'signature' ? (
                              <div className="val-signature">
                                {displayVal !== '—' && typeof displayVal === 'string' ? <img src={displayVal} alt="Signature" /> : 'ไม่มีลายเซ็น'}
                              </div>
                            ) : (
                              <div className={`val-chip ${isFail ? 'chip-fail' : isPass ? 'chip-pass' : ''}`}>
                                {String(displayVal)} {field.unit && displayVal !== '—' ? field.unit : ''}
                              </div>
                            )}
                          </td>
                          <td>
                            {val?.mediaUrls && val.mediaUrls.length > 0 ? (
                              <div className="a4-evidence-indicator">
                                📸 แนบรูปภาพ {val.mediaUrls.length} รูป
                              </div>
                            ) : (
                              <span className="lbl-empty">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Footer Signatures */}
        {(() => {
          const sigFields = template.fields.filter(f => f.type === 'signature' && isFieldVisible(f));
          
          return (
            <div className="a4-footer-signatures">
              {sigFields.length > 0 ? (
                // Render dynamic signature fields from the template
                sigFields.map(field => {
                  const val = getFieldValue(field.id);
                  const hasSig = val?.value && typeof val.value === 'string' && val.value !== '—';
                  return (
                    <div key={field.id} className="sig-block">
                      <div className="sig-line">
                        {hasSig ? (
                          <img src={val.value as string} alt={field.label} style={{ maxHeight: '60px' }} className="print-sig-img" />
                        ) : null}
                      </div>
                      <div className="sig-title">{field.label}</div>
                      <div className="sig-date">
                        วันที่: {inspection.completedAt ? new Date(inspection.completedAt).toLocaleDateString('th-TH') : '-'}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback to text if no signature field exists
                <div className="sig-block">
                  <div className="sig-line">
                    <span className="sig-name">{inspection.inspectorName}</span>
                  </div>
                  <div className="sig-title">ผู้ตรวจสอบ / ช่างเทคนิค</div>
                  <div className="sig-date">
                    วันที่: {inspection.completedAt ? new Date(inspection.completedAt).toLocaleDateString('th-TH') : '-'}
                  </div>
                </div>
              )}

              {/* Static Supervisor Block */}
              <div className="sig-block">
                <div className="sig-line"></div>
                <div className="sig-title">ผู้ตรวจทาน / หัวหน้างาน</div>
                <div className="sig-date">วันที่: ______/______/______</div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Appendix Photo Pages */}
      {fieldsWithPhotos.map((photo, index) => (
        <div key={`${photo.field.id}-${index}`} className="a4-page a4-appendix-page">
          <div className="a4-appendix-header border-b-2 border-black pb-md mb-lg">
            <div className="flex justify-between items-start mb-md">
              <h2 className="text-xl font-bold font-inter text-slate-800 tracking-tight">ภาคผนวก {index + 1}: หลักฐานรูปภาพ</h2>
              <div className="text-right">
                <div className="font-bold text-slate-800">{machine.name}</div>
                <div className="text-xs text-slate-500">หมายเลขเครื่อง: {machine.machineNo}</div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-md rounded border border-slate-200 grid grid-cols-2 gap-md">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-xs">หมวดหมู่</div>
                <div className="text-sm font-semibold text-slate-800">{photo.section.title}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-xs">รายการตรวจสอบ</div>
                <div className="text-sm font-semibold text-slate-800">{photo.field.label}</div>
              </div>
              <div className="col-span-2 border-t border-slate-200 pt-sm mt-sm">
                <span className="text-xs font-bold text-slate-500 uppercase mr-md">ผลที่บันทึก:</span>
                <span className={`inline-block px-sm py-xs rounded font-bold text-sm ${
                  String(photo.value.value).match(/NG|fail|Fail/i) ? 'bg-red-100 text-red-700' : 
                  String(photo.value.value).match(/OK|pass|Pass/i) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-800'
                }`}>
                  {String(photo.value.value)} {photo.field.unit || ''}
                </span>
              </div>
            </div>
          </div>
          
          <div className="a4-appendix-body flex items-center justify-center" style={{ height: 'calc(100% - 150px)', overflow: 'hidden' }}>
            <img 
              src={photo.url} 
              alt={`Evidence for ${photo.field.label}`} 
              className="appendix-photo-lg w-full h-full object-contain rounded border border-slate-200" 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
