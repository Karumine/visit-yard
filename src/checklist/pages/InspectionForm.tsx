// ==============================
// Inspection Form Page — Tablet Execution Mode
// ==============================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  PenTool,
  Mic,
  MicOff,
  Save,
  Send,
  ChevronRight,
  History,
  X,
  Download,
  Printer
} from 'lucide-react';
import { useInspectionStore } from '../store/useInspectionStore';
import { useTemplateStore } from '../store/useTemplateStore';
import { useMachineStore } from '../store/useMachineStore';
import type { FormField } from '../types/template';
import type { FieldValue } from '../types/inspection';
import SignaturePad from '../components/common/SignaturePad';
import InspectionReportView from './InspectionReportView';

export default function InspectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspection, updateFieldValue, completeInspection, getPreviousValues } = useInspectionStore();
  const { getTemplate } = useTemplateStore();
  const { getMachine } = useMachineStore();

  const inspection = getInspection(id || '');
  const template = inspection ? (inspection.templateSnapshot || getTemplate(inspection.templateId)) : null;
  const machine = inspection ? getMachine(inspection.machineId) : null;
  const previousValues = inspection ? getPreviousValues(inspection.id) : [];

  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [historyModal, setHistoryModal] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);

  // Initialize active section
  useEffect(() => {
    if (template && !activeSectionId) {
      const sorted = [...template.sections].sort((a, b) => a.order - b.order);
      if (sorted.length > 0) setActiveSectionId(sorted[0].id);
    }
  }, [template, activeSectionId]);

  const sortedSections = useMemo(() => {
    if (!template) return [];
    return [...template.sections].sort((a: any, b: any) => a.order - b.order);
  }, [template]);

  const activeFields = useMemo(() => {
    if (!template) return [];
    return template.fields
      .filter((f: FormField) => f.sectionId === activeSectionId)
      .sort((a: FormField, b: FormField) => a.order - b.order);
  }, [template, activeSectionId]);

  const getFieldValue = useCallback((fieldId: string): FieldValue | undefined => {
    return inspection?.values.find(v => v.fieldId === fieldId);
  }, [inspection]);

  const getPreviousValue = useCallback((fieldId: string): FieldValue | undefined => {
    return previousValues.find(v => v.fieldId === fieldId);
  }, [previousValues]);

  const handleValueChange = useCallback((fieldId: string, updates: Partial<FieldValue>) => {
    if (!inspection) return;
    updateFieldValue(inspection.id, {
      fieldId,
      ...updates,
    });
    // Show auto-save indicator
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  }, [inspection, updateFieldValue]);

  const exportToCSV = useCallback(() => {
    if (!template || !inspection) return;
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Section,Field,Value,Unit,Time\n";

    template.sections.forEach((section: any) => {
      const sectionFields = template.fields.filter((f: FormField) => f.sectionId === section.id);
      sectionFields.forEach((field: FormField) => {
        const val = getFieldValue(field.id);
        const displayVal = val && val.value !== null ? val.value : "N/A";
        const unit = field.unit || "";
        const time = val?.timestamp ? new Date(val.timestamp).toLocaleString('th-TH') : "";
        
        let cleanedDisplayVal = String(displayVal).replace(/"/g, '""'); // Escape quotes
        csvContent += `"${section.title}","${field.label}","${cleanedDisplayVal}","${unit}","${time}"\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inspection_${machine?.machineNo || 'Report'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [template, inspection, machine, getFieldValue]);

  const handleComplete = () => {
    if (!inspection) return;
    if (confirm('ยืนยันการส่งการตรวจสอบ? ข้อมูลจะไม่สามารถแก้ไขได้')) {
      completeInspection(inspection.id);
      navigate('/checklist/inspect');
    }
  };

  // Check if field should be visible (conditional logic)
  const isFieldVisible = useCallback((field: FormField): boolean => {
    if (!field.conditionalRules) return true;
    const dependValue = getFieldValue(field.conditionalRules.dependsOn);
    return dependValue?.value === field.conditionalRules.showWhen;
  }, [getFieldValue]);

  // Section completion stats
  const getSectionStats = useCallback((sectionId: string) => {
    if (!template || !inspection) return { total: 0, completed: 0 };
    const sectionFields = template.fields.filter((f: FormField) => f.sectionId === sectionId && !f.conditionalRules);
    const completedFields = sectionFields.filter((f: FormField) => {
      const val = getFieldValue(f.id);
      return val && val.value !== null && val.value !== '';
    });
    return { total: sectionFields.length, completed: completedFields.length };
  }, [template, inspection, getFieldValue]);

  // Variance calculation
  const getVariance = useCallback((fieldId: string, currentValue: number): { percentage: number; direction: 'up' | 'down' } | null => {
    const prev = getPreviousValue(fieldId);
    if (!prev || typeof prev.value !== 'number' || prev.value === 0) return null;
    const diff = ((currentValue - prev.value) / prev.value) * 100;
    return { percentage: Math.abs(diff), direction: diff > 0 ? 'up' : 'down' };
  }, [getPreviousValue]);

  const scoreStats = useMemo(() => {
    if (!template || !inspection) return { actual: 0, max: 0 };
    let actual = 0;
    let max = 0;
    template.fields.forEach((f: FormField) => {
      if (f.maxScore) {
        max += f.maxScore;
        const val = getFieldValue(f.id);
        if (val && typeof val.value === 'number') {
          actual += val.value;
        }
      }
    });
    return { actual, max };
  }, [template, inspection, getFieldValue]);

  if (!inspection || !template || !machine) {
    return (
      <div className="empty-state">
        <h3>ไม่พบการตรวจสอบ</h3>
        <button className="btn btn-primary mt-lg" onClick={() => navigate('/checklist/inspect')}>
          <ArrowLeft size={18} /> กลับ
        </button>
      </div>
    );
  }

  const totalStats = sortedSections.reduce(
    (acc, s) => {
      const stats = getSectionStats(s.id);
      return { total: acc.total + stats.total, completed: acc.completed + stats.completed };
    },
    { total: 0, completed: 0 }
  );

  const scorePercent = scoreStats.max > 0 ? Math.round((scoreStats.actual / scoreStats.max) * 100) : null;

  return (
    <div className="animate-fade-in" style={{ margin: 'calc(-1 * var(--space-xl))', marginTop: 'calc(-1 * var(--space-xl))' }}>
      {/* Top Bar */}
      <div
        className="print-hidden"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-md) var(--space-lg)',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="flex items-center gap-md">
          <button className="btn btn-icon" onClick={() => navigate('/checklist/inspect')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{machine.name}</h2>
            <div className="text-xs text-tertiary">{template.name} · v{inspection.templateVersion}</div>
          </div>
        </div>
        <div className="flex items-center gap-md">
          {autoSaved && (
            <span className="flex items-center gap-xs text-xs animate-fade-in" style={{ color: 'var(--accent-green)' }}>
              <Save size={12} /> บันทึกอัตโนมัติ
            </span>
          )}
          {scorePercent !== null && (
            <span className="badge badge-purple" style={{ boxShadow: 'var(--shadow-glow-purple)' }}>
              คะแนน: {scorePercent}%
            </span>
          )}
          <span className="badge badge-blue">
            {totalStats.completed}/{totalStats.total} ฟิลด์
          </span>
          {inspection.status === 'completed' ? (
            <div className="flex items-center gap-sm">
              <button className="btn btn-ghost" onClick={() => window.print()} title="Print Report as PDF">
                <Printer size={18} />
                รายงาน PDF
              </button>
              <button className="btn btn-success" onClick={exportToCSV} title="Export Data to Excel">
                <Download size={18} />
                ข้อมูล CSV
              </button>
            </div>
          ) : (
            <button className="btn btn-success" onClick={handleComplete}>
              <Send size={18} />
              ส่งผล
            </button>
          )}
        </div>
      </div>

      {/* Conditional Layout: A4 Report or Form */}
      {inspection.status === 'completed' ? (
        <InspectionReportView inspection={inspection} template={template} machine={machine} />
      ) : (
        <>
          {/* Progress Bar */}
          <div style={{ height: '3px', background: 'var(--bg-elevated)' }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))',
                width: `${totalStats.total > 0 ? (totalStats.completed / totalStats.total) * 100 : 0}%`,
                transition: 'width 0.5s ease',
                borderRadius: '0 2px 2px 0',
              }}
            />
          </div>

          {/* Split Layout */}
          <div className="execution-layout">
            {/* Left: Section Navigation */}
            <div className="execution-sidebar">
              <div style={{ padding: 'var(--space-sm) 0', marginBottom: 'var(--space-md)' }}>
                <span className="text-xs font-bold text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  หมวดหมู่
                </span>
              </div>
              {sortedSections.map((section) => {
                const stats = getSectionStats(section.id);
                const isComplete = stats.completed === stats.total && stats.total > 0;
                return (
                  <button
                    key={section.id}
                    className={`section-nav-item ${activeSectionId === section.id ? 'active' : ''} ${isComplete ? 'completed' : ''}`}
                    onClick={() => setActiveSectionId(section.id)}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                    ) : (
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border-hover)', flexShrink: 0 }} />
                    )}
                    <span style={{ flex: 1, textAlign: 'left' }}>{section.title || '(ไม่มีชื่อหมวดหมู่)'}</span>
                    <span className="section-progress">{stats.completed}/{stats.total}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Form Fields */}
            <div className="execution-content">
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Section Title */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <h2 style={{ fontWeight: 800, fontSize: 'var(--font-size-2xl)', letterSpacing: '-0.5px' }}>
                    {sortedSections.find(s => s.id === activeSectionId)?.title || '(ไม่มีชื่อหมวดหมู่)'}
                  </h2>
                  {sortedSections.find(s => s.id === activeSectionId)?.description && (
                    <p className="text-sm text-secondary mt-md">
                      {sortedSections.find(s => s.id === activeSectionId)?.description}
                    </p>
                  )}
                </div>

                {/* Fields */}
                {activeFields.map((field: FormField) => {
                  if (!isFieldVisible(field)) return null;
                  return (
                    <ExecutionField
                      key={field.id}
                      field={field}
                      value={getFieldValue(field.id)}
                      previousValue={getPreviousValue(field.id)}
                      variance={field.type === 'number' ? getVariance(field.id, Number(getFieldValue(field.id)?.value || 0)) : null}
                      warningThreshold={field.validation?.warningThreshold}
                      onChange={(value) => handleValueChange(field.id, value)}
                      onHistoryClick={() => setHistoryModal(field.id)}
                      disabled={false}
                    />
                  );
                })}

                {/* Section Navigation */}
                <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-default)' }}>
                  {(() => {
                    const currentIdx = sortedSections.findIndex(s => s.id === activeSectionId);
                    return (
                      <>
                        {currentIdx > 0 ? (
                          <button className="btn btn-ghost" onClick={() => setActiveSectionId(sortedSections[currentIdx - 1].id)}>
                            <ArrowLeft size={18} /> ก่อนหน้า
                          </button>
                        ) : <div />}
                        {currentIdx < sortedSections.length - 1 ? (
                          <button className="btn btn-primary" onClick={() => setActiveSectionId(sortedSections[currentIdx + 1].id)}>
                            ถัดไป <ChevronRight size={18} />
                          </button>
                        ) : (
                          <button className="btn btn-success" onClick={handleComplete}>
                            <Send size={18} /> ส่งผลการตรวจสอบ
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}


      {/* History Modal */}
      {historyModal && (
        <div className="modal-overlay" onClick={() => setHistoryModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <History size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                ข้อมูลย้อนหลัง
              </span>
              <button className="btn btn-icon" onClick={() => setHistoryModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                const prev = getPreviousValue(historyModal);
                const field = template.fields.find((f: FormField) => f.id === historyModal);
                if (!prev || !field) return <p className="text-secondary">ไม่มีข้อมูลย้อนหลัง</p>;
                return (
                  <div className="flex flex-col gap-md">
                    <div className="exec-field-card">
                      <div className="text-xs text-tertiary" style={{ marginBottom: '4px' }}>การตรวจสอบครั้งก่อน</div>
                      <div className="font-bold" style={{ fontSize: 'var(--font-size-xl)' }}>
                        {String(prev.value)} {field.unit && <span className="text-sm text-tertiary">{field.unit}</span>}
                      </div>
                      <div className="text-xs text-tertiary" style={{ marginTop: '4px' }}>
                        {new Date(prev.timestamp).toLocaleString('th-TH')}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Single Execution Field ----
function ExecutionField({
  field,
  value,
  previousValue,
  variance,
  warningThreshold,
  onChange,
  onHistoryClick,
  disabled,
}: {
  field: FormField;
  value: FieldValue | undefined;
  previousValue: FieldValue | undefined;
  variance: { percentage: number; direction: 'up' | 'down' } | null;
  warningThreshold?: number;
  onChange: (updates: Partial<FieldValue>) => void;
  onHistoryClick: () => void;
  disabled: boolean;
}) {
  const hasWarning = variance && warningThreshold && variance.percentage > warningThreshold;
  const hasError = field.validation && typeof value?.value === 'number' && (
    (field.validation.min !== undefined && value.value < field.validation.min) ||
    (field.validation.max !== undefined && value.value > field.validation.max)
  );

  // Filter which fields get the attachment button
  const supportsPhotos = ['checkbox', 'radio', 'number', 'text', 'textarea'].includes(field.type);

  // Voice-to-text
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Browser does not support speech recognition');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentVal = value?.value ? String(value.value) + ' ' : '';
      onChange({ value: currentVal + transcript });
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  // Real Photo Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const dataUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const maxDim = 1200;
              let { width, height } = img;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => resolve(event.target?.result as string);
            img.src = event.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        dataUrls.push(dataUrl);
      }
      const existingMedia = value?.mediaUrls || [];
      onChange({ mediaUrls: [...existingMedia, ...dataUrls] });
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (idx: number) => {
    const existingMedia = value?.mediaUrls || [];
    onChange({ mediaUrls: existingMedia.filter((_, i) => i !== idx) });
  };

  return (
    <div className={`exec-field-card ${hasWarning ? 'has-warning' : ''} ${hasError ? 'has-error' : ''}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="exec-field-header">
        <span className="exec-field-label">
          {field.label}
          {field.required && <span style={{ color: 'var(--accent-red)' }}> *</span>}
        </span>
        <div className="flex items-center gap-sm">
          {field.unit && <span className="exec-field-unit">{field.unit}</span>}

          {supportsPhotos && !disabled && (
            <button
              className="btn-attach"
              onClick={handleAddPhoto}
              title="Add photo proof"
            >
              <Camera size={14} /> เพิ่มรูปภาพ
            </button>
          )}

          {previousValue && (
            <button
              className="btn btn-icon btn-sm"
              onClick={onHistoryClick}
              title="ดูประวัติ"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <History size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Field Input by Type */}
      {field.type === 'number' && (
        <input
          className={`form-input ${hasError ? 'error' : ''} ${hasWarning ? 'warning' : ''}`}
          type="number"
          value={value?.value !== undefined && value?.value !== null ? String(value.value) : ''}
          onChange={(e) => onChange({ value: e.target.value ? Number(e.target.value) : null })}
          placeholder={field.placeholder || `ระบุ ${field.label}`}
          min={field.validation?.min}
          max={field.validation?.max}
          disabled={disabled}
          style={{ fontSize: 'var(--font-size-lg)' }}
        />
      )}

      {field.type === 'text' && (
        <div style={{ position: 'relative' }}>
          <input
            className="form-input"
            type="text"
            value={value?.value !== undefined && value?.value !== null ? String(value.value) : ''}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder={field.placeholder || `ระบุ ${field.label}`}
            disabled={disabled}
          />
        </div>
      )}

      {field.type === 'textarea' && (
        <div style={{ position: 'relative' }}>
          <textarea
            className="form-input form-textarea"
            value={value?.value !== undefined && value?.value !== null ? String(value.value) : ''}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder={field.placeholder || 'ระบุหมายเหตุ...'}
            disabled={disabled}
          />
          <button
            className={`btn btn-icon ${isListening ? 'btn-danger' : ''}`}
            onClick={toggleVoice}
            style={{
              position: 'absolute',
              right: '8px',
              bottom: '8px',
              background: isListening ? 'var(--accent-red)' : 'var(--bg-hover)',
              color: isListening ? 'white' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              width: '36px',
              height: '36px',
              minHeight: '36px',
              minWidth: '36px',
            }}
            title="Voice-to-text"
            disabled={disabled}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>
      )}

      {(field.type === 'radio' || field.type === 'checkbox') && (
        <div className="status-toggle-group">
          {(field.options || []).map((opt) => {
            const isSelected = value?.value === opt.value;
            const isPass = opt.value === 'OK' || opt.value === 'pass' || opt.value === 'Pass';
            const isFail = opt.value === 'NG' || opt.value === 'fail' || opt.value === 'Fail' || opt.value === 'Overload';
            return (
              <button
                key={opt.value}
                className={`status-toggle ${isSelected ? (isPass ? 'pass' : isFail ? 'fail' : 'na') : ''}`}
                onClick={() => onChange({ value: isSelected ? null : opt.value })}
                disabled={disabled}
              >
                {isSelected && <CheckCircle2 size={18} />}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {field.type === 'select' && (
        <select
          className="form-input form-select"
          value={value?.value !== undefined && value?.value !== null ? String(value.value) : ''}
          onChange={(e) => onChange({ value: e.target.value || null })}
          disabled={disabled}
        >
          <option value="">-- เลือก --</option>
          {(field.options || []).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {field.type === 'media' && (
        <div
          style={{
            border: '2px dashed var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-lg)',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onClick={() => !disabled && handleAddPhoto()}
        >
          <Camera size={28} style={{ margin: '0 auto 8px', color: 'var(--text-tertiary)' }} />
          <p className="text-sm text-tertiary">แตะเพื่อถ่ายรูป</p>
        </div>
      )}

      {field.type === 'signature' && (
        <SignaturePad
          value={value?.value as string}
          onChange={(base64) => onChange({ value: base64 })}
          disabled={disabled}
        />
      )}

      {/* Attachment Gallery */}
      {value?.mediaUrls && value.mediaUrls.length > 0 && (
        <div className="attachment-gallery">
          {value.mediaUrls.map((url, idx) => (
            <div key={idx} className="attachment-item shadow-sm">
              <img src={url} alt={`attachment-${idx}`} />
              {!disabled && (
                <button
                  className="attachment-remove"
                  onClick={(e) => { e.stopPropagation(); handleRemovePhoto(idx); }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Historical Value Inline */}
      {previousValue && field.type === 'number' && (
        <div className="historical-value">
          <Clock size={12} />
          <span className="historical-value-label">ครั้งก่อน:</span>
          <span>{String(previousValue.value)} {field.unit}</span>
          <span className="text-tertiary">({new Date(previousValue.timestamp).toLocaleDateString('th-TH')})</span>
        </div>
      )}

      {/* Variance Alert */}
      {hasWarning && (
        <div className={`variance-alert ${variance!.percentage > (warningThreshold! * 2) ? 'danger' : 'warning'}`}>
          <AlertTriangle size={14} />
          <span>
            ค่าต่างจากรอบที่แล้ว {variance!.percentage.toFixed(1)}%
            ({variance!.direction === 'up' ? '▲ สูงขึ้น' : '▼ ลดลง'})
          </span>
        </div>
      )}

      {/* Validation Error */}
      {hasError && (
        <div className="form-error" style={{ marginTop: 'var(--space-sm)' }}>
          <AlertTriangle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          ค่าอยู่นอกช่วงที่กำหนด ({field.validation!.min} - {field.validation!.max} {field.unit})
        </div>
      )}
    </div>
  );
}

