// ==============================
// Template Editor Page — Dynamic Form Builder
// ==============================

import { useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  CheckSquare,
  CircleDot,
  Hash,
  Type,
  AlignLeft,
  Camera,
  PenTool,
  ChevronDown,
  X,
  Settings,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  useDraggable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useTemplateStore, FIELD_TYPE_CONFIG } from '../store/useTemplateStore';
import type { FormField, FieldType, FormSection } from '../types/template';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  CheckSquare, CircleDot, Hash, Type, AlignLeft, Camera, PenTool, ChevronDown,
};

// ---- Sortable Field Component ----
function SortableField({
  field,
  isSelected,
  onSelect,
  onRemove,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
  };

  const config = FIELD_TYPE_CONFIG.find(c => c.type === field.type);
  const Icon = ICON_MAP[config?.icon || 'Hash'] || Hash;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ 
          opacity: isDragging ? 0.8 : 1, 
          scale: isDragging ? 1.02 : 1, 
          y: 0 
        }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          opacity: { duration: 0.1 }
        }}
        className={`canvas-field ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: isDragging ? 'var(--shadow-glow-blue)' : 'none',
          borderColor: isDragging ? 'var(--accent-blue)' : undefined,
          pointerEvents: isDragging ? 'none' : 'auto' // Prevent click events while dragging
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <div className="canvas-field-handle">
          <GripVertical size={16} />
        </div>
        <div style={{ color: config?.color, width: '24px', display: 'flex', justifyContent: 'center' }}>
          <Icon size={18} />
        </div>
        <div className="canvas-field-info">
          <div className="canvas-field-label">{field.label}</div>
          <div className="canvas-field-type">
            {config?.label}
            {field.unit && ` · ${field.unit}`}
            {field.required && <span style={{ color: 'var(--accent-red)', marginLeft: '4px' }}>*</span>}
            {field.conditionalRules && <span className="badge badge-amber" style={{ marginLeft: '6px', fontSize: '10px' }}>เงื่อนไข</span>}
          </div>
        </div>
        <button
          className="btn btn-icon btn-sm"
          style={{ color: 'var(--accent-red)' }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={14} />
        </button>
      </motion.div>
    </div>
  );
}



// ---- Palette Item Component (Clickable) ----
function PaletteItem({ config, onClick }: { config: typeof FIELD_TYPE_CONFIG[0], onClick: (e: React.MouseEvent) => void }) {
  const Icon = ICON_MAP[config.icon] || Hash;

  return (
    <div
      className="palette-item"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="palette-item-icon" style={{ background: `${config.color}20`, color: config.color }}>
        <Icon size={18} />
      </div>
      <div>
        <div className="palette-item-label">{config.label}</div>
        <div className="text-xs text-tertiary">{config.description}</div>
      </div>
    </div>
  );
}


export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getTemplate, updateTemplate,
    addFieldToTemplate, removeFieldFromTemplate, updateFieldInTemplate,
    addSectionToTemplate, removeSectionFromTemplate, reorderField
  } = useTemplateStore();

  const template = getTemplate(id || '');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [flyingItems, setFlyingItems] = useState<{ 
    id: string; 
    startX: number; 
    startY: number; 
    targetX: number; 
    targetY: number; 
    icon: string; 
    color: string;
    label: string;
    description: string;
    width: number;
    height: number;
  }[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);


  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedSections = useMemo(() => {
    if (!template) return [];
    return [...template.sections].sort((a, b) => a.order - b.order);
  }, [template]);

  // Initial active section setup
  useState(() => {
    if (sortedSections.length > 0 && !activeSectionId) {
      setActiveSectionId(sortedSections[0].id);
    }
  });

  const getFieldsForSection = useCallback((sectionId: string) => {

    if (!template) return [];
    return template.fields
      .filter(f => f.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  }, [template]);

  const selectedField = useMemo(() => {
    if (!template || !selectedFieldId) return null;
    return template.fields.find(f => f.id === selectedFieldId) || null;
  }, [template, selectedFieldId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !template) return;

    // Handle Reordering (Only within the same section)
    if (active.id !== over.id) {
      const activeField = template.fields.find(f => f.id === active.id);
      const overField = template.fields.find(f => f.id === over.id);

      if (activeField && overField && activeField.sectionId === overField.sectionId) {
        const sectionFields = getFieldsForSection(activeField.sectionId);
        const newIndex = sectionFields.findIndex(f => f.id === over.id);
        reorderField(template.id, active.id as string, newIndex);
      }
    }
  };

  const handlePaletteClick = (e: React.MouseEvent, type: FieldType, targetSectionId?: string) => {
    // Determine which section to add to: active section or provided target
    const sectionId = targetSectionId || activeSectionId || sortedSections[0]?.id;
    if (!sectionId) return;

    // Auto-select the section if not already active
    if (sectionId !== activeSectionId) setActiveSectionId(sectionId);

    const config = FIELD_TYPE_CONFIG.find(c => c.type === type);
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Get the target section's DOM element for precise flying
    const targetElement = document.getElementById(`section-${sectionId}`);
    const targetRect = targetElement?.getBoundingClientRect();

    const targetX = targetRect ? targetRect.left + (targetRect.width * 0.4) : window.innerWidth * 0.6;
    const targetY = targetRect ? targetRect.top + 30 : window.innerHeight * 0.3;

    
    // Create flying effect
    const flyId = Math.random().toString(36).substr(2, 9);
    setFlyingItems(prev => [...prev, {
      id: flyId,
      startX: rect.left,
      startY: rect.top,
      targetX,
      targetY,
      icon: config?.icon || 'Hash',
      color: config?.color || 'var(--accent-blue)',
      label: config?.label || 'รายการใหม่',
      description: config?.description || '',
      width: rect.width,
      height: rect.height,
    }]);

    const flyingDuration = 0.5;

    // Add field immediately but it will have its own entry animation
    setTimeout(() => {
      handleAddField(type, sectionId);
    }, 100);

    // Cleanup flyer
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== flyId));
    }, flyingDuration * 1000);
  };





  if (!template) {
    return (
      <div className="empty-state">
        <h3>ไม่พบแม่แบบ</h3>
        <button className="btn btn-primary mt-lg" onClick={() => navigate('/checklist/templates')}>
          กลับไปหน้าแม่แบบ
        </button>
      </div>
    );
  }

  const handleAddField = (type: FieldType, sectionId: string) => {
    const config = FIELD_TYPE_CONFIG.find(c => c.type === type);
    addFieldToTemplate(template.id, {
      type,
      label: config?.label || 'รายการใหม่',
      required: false,
      sectionId,
      placeholder: '',
    });
  };

  const handleAddSection = () => {
    addSectionToTemplate(template.id, {
      title: '',
      description: '',
    });
  };

  const handleSaveAndExit = () => {
    navigate('/checklist/templates');
  };

  const startEditName = () => {
    setTempName(template.name);
    setEditingName(true);
  };

  const saveName = () => {
    updateTemplate(template.id, { name: tempName });
    setEditingName(false);
  };

  return (
    <div className="animate-slide-up" style={{ height: 'calc(100vh - var(--header-height) - var(--space-xl) * 2)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="flex items-center gap-md">
          <button className="btn btn-icon" onClick={() => navigate('/checklist/templates')}>
            <ArrowLeft size={20} />
          </button>
          {editingName ? (
            <div className="flex items-center gap-sm">
              <input
                className="form-input"
                style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, width: '400px' }}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                autoFocus
              />
            </div>
          ) : (
            <h1
              className="page-title"
              style={{ cursor: 'pointer' }}
              onClick={startEditName}
              title="คลิกเพื่อแก้ไขชื่อ"
            >
              {template.name}
            </h1>
          )}
          <span className="badge badge-default">v{template.version}</span>
        </div>
        <div className="flex items-center gap-sm">
          <button className="btn btn-ghost" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={18} />
            {showPreview ? 'ตัวแก้ไข' : 'ดูตัวอย่าง'}
          </button>
          <button className="btn btn-primary" onClick={handleSaveAndExit}>
            <Save size={18} />
            บันทึกและออก
          </button>
        </div>
      </div>

      {/* Template metadata */}
      <div className="flex items-center gap-lg" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">คำอธิบาย</label>
          <input
            className="form-input"
            value={template.description}
            onChange={(e) => updateTemplate(template.id, { description: e.target.value })}
            placeholder="เพิ่มคำอธิบาย..."
          />
        </div>
        <div className="form-group" style={{ width: '240px' }}>
          <label className="form-label">ประเภทเครื่องจักร</label>
          <input
            className="form-input"
            value={template.machineType}
            onChange={(e) => updateTemplate(template.id, { machineType: e.target.value })}
            placeholder="e.g. เครื่องเป่าขวด"
          />
        </div>
      </div>

      {showPreview ? (
        /* ---- PREVIEW MODE ---- */
        <PreviewMode template={template} sortedSections={sortedSections} getFieldsForSection={getFieldsForSection} />
      ) : (
        /* ---- EDITOR MODE ---- */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="builder-layout">
            {/* Left: Field Palette */}
            <div className="builder-panel">
              <div className="builder-panel-header">
                <Layers size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                ประเภทรายการ
              </div>
              <div className="builder-panel-body">
                {FIELD_TYPE_CONFIG.map((config) => (
                  <PaletteItem 
                    key={config.type} 
                    config={config} 
                    onClick={(e) => handlePaletteClick(e, config.type)} 
                  />
                ))}
              </div>
            </div>


            {/* Center: Form Canvas */}
            <div className="builder-panel" style={{ overflow: 'auto' }} ref={canvasRef}>

              <div className="builder-panel-header flex items-center justify-between">
                <span>
                  <Settings size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  โครงสร้างฟอร์ม
                </span>
                <button className="btn btn-ghost btn-sm" onClick={handleAddSection}>
                  <Plus size={14} /> หมวดหมู่
                </button>
              </div>
              <div className="builder-panel-body">
                {sortedSections.map((section) => {
                  const fields = getFieldsForSection(section.id);
                  return (
                    <div 
                      key={section.id} 
                      className={`canvas-section-wrapper ${activeSectionId === section.id ? 'active' : ''}`}
                      onClick={() => setActiveSectionId(section.id)}
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xs)', padding: '0 var(--space-xs)' }}>
                        <input
                          className="form-input"
                          placeholder="ระบุชื่อหมวดหมู่..."
                          style={{
                            background: 'transparent',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: 'var(--font-size-base)',
                            padding: '4px 0',
                            color: activeSectionId === section.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                          }}
                          value={section.title}
                          onClick={(e) => e.stopPropagation()} // Allow editing title without just selecting section
                          onChange={(e) => {
                            updateTemplate(template.id, {
                              sections: template.sections.map(s =>
                                s.id === section.id ? { ...s, title: e.target.value } : s
                              ),
                            });
                          }}
                        />
                        {sortedSections.length > 1 && (
                          <button
                            className="btn btn-icon btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSectionFromTemplate(template.id, section.id);
                            }}
                            style={{ color: 'var(--accent-red)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div
                        id={`section-${section.id}`}
                        className="canvas-dropzone"
                      >
                        {fields.length === 0 ? (
                          <div className="canvas-empty-state">
                            <Plus size={32} />
                            <p className="text-sm">คลิกเพื่อเลือกหมวดหมู่นี้</p>
                          </div>
                        ) : (
                            <SortableContext
                                items={fields.map(f => f.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <AnimatePresence mode="popLayout">
                                  {fields.map((field) => (
                                    <SortableField
                                      key={field.id}
                                      field={field}
                                      isSelected={selectedFieldId === field.id}
                                      onSelect={() => setSelectedFieldId(field.id)}
                                      onRemove={() => {
                                        removeFieldFromTemplate(template.id, field.id);
                                        if (selectedFieldId === field.id) setSelectedFieldId(null);
                                      }}
                                    />
                                  ))}
                                </AnimatePresence>
                              </SortableContext>

                        )}
                      </div>

                      {/* Quick Add Buttons */}
                      <div className="flex flex-wrap gap-xs" style={{ marginTop: 'var(--space-md)' }}>
                        {['checkbox', 'radio', 'number', 'text', 'textarea', 'media'].map((type) => {
                          const config = FIELD_TYPE_CONFIG.find(c => c.type === type);
                          return (
                            <button
                              key={type}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '11px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePaletteClick(e, type as FieldType, section.id);
                              }}
                            >
                              <Plus size={12} /> {config?.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Right: Field Properties */}
            <div className="builder-panel">
              <div className="builder-panel-header">
                <Settings size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                คุณสมบัติ
              </div>
              <div className="builder-panel-body">
                {selectedField ? (
                  <FieldPropertyEditor
                    field={selectedField}
                    templateId={template.id}
                    sections={sortedSections}
                    allFields={template.fields}
                    onUpdate={(updates) => updateFieldInTemplate(template.id, selectedField.id, updates)}
                  />
                ) : (
                  <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                    <Settings size={32} />
                    <p className="text-sm text-tertiary">เลือกรายการเพื่อแก้ไขคุณสมบัติ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DndContext>
      )}

      {/* Flying Ghost Elements - Full Card Morph */}
      <AnimatePresence>
        {flyingItems.map(item => {
          const Icon = ICON_MAP[item.icon] || Hash;
          return (
            <motion.div
              key={item.id}
              initial={{ 
                left: item.startX,
                top: item.startY,
                width: item.width,
                height: item.height,
                opacity: 0,
                scale: 0.8,
                borderRadius: 'var(--radius-lg)'
              }}
              animate={{ 
                left: item.targetX,
                top: item.targetY,
                width: 320, // Morph to a fixed size during flight
                height: 70,
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1.1, 1, 0.8],
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
              transition={{ 
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1] // Smooth cinematic ease
              }}
              style={{
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 9999, // Ensure it's on top of EVERYTHING
                background: 'var(--bg-elevated)',
                border: `2px solid ${item.color}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--space-md)',
                overflow: 'hidden',
              }}
            >
              <div 
                style={{ 
                  background: `${item.color}20`, 
                  color: item.color,
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  flexShrink: 0
                }}
              >
                <Icon size={18} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{item.description}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>



    </div>
  );
}

// ---- Field Property Editor ----
function FieldPropertyEditor({
  field,
  templateId: _templateId,
  sections,
  allFields,
  onUpdate,
}: {
  field: FormField;
  templateId: string;
  sections: FormSection[];
  allFields: FormField[];
  onUpdate: (updates: Partial<FormField>) => void;
}) {
  return (
    <div className="flex flex-col gap-md">
      {/* Label */}
      <div className="form-group">
        <label className="form-label">ชื่อรายการ</label>
        <input
          className="form-input"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      {/* Type badge */}
      <div className="form-group">
        <label className="form-label">ประเภท</label>
        <span className="badge badge-blue">{field.type}</span>
      </div>

      {/* Section */}
      <div className="form-group">
        <label className="form-label">หมวดหมู่</label>
        <select
          className="form-input form-select"
          value={field.sectionId}
          onChange={(e) => onUpdate({ sectionId: e.target.value })}
        >
          {sections.map(s => (
            <option key={s.id} value={s.id}>{s.title || '(ไม่มีชื่อหมวดหมู่)'}</option>
          ))}
        </select>
      </div>

      {/* Required */}
      <label className="form-check">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
        />
        <span className="form-check-label">จำเป็นต้องกรอก</span>
      </label>

      {/* Placeholder */}
      {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
        <div className="form-group">
          <label className="form-label">ข้อความแนะนำ (Placeholder)</label>
          <input
            className="form-input"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </div>
      )}

      {/* Unit */}
      {field.type === 'number' && (
        <div className="form-group">
          <label className="form-label">หน่วย</label>
          <input
            className="form-input"
            value={field.unit || ''}
            onChange={(e) => onUpdate({ unit: e.target.value })}
            placeholder="e.g. °C, kPa, Amp"
          />
        </div>
      )}

      {/* Numeric Validation */}
      {field.type === 'number' && (
        <>
          <div className="form-group">
            <label className="form-label">ค่าต่ำสุด</label>
            <input
              className="form-input"
              type="number"
              value={field.validation?.min ?? ''}
              onChange={(e) => onUpdate({ validation: { ...field.validation, min: e.target.value ? Number(e.target.value) : undefined } })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">ค่าสูงสุด</label>
            <input
              className="form-input"
              type="number"
              value={field.validation?.max ?? ''}
              onChange={(e) => onUpdate({ validation: { ...field.validation, max: e.target.value ? Number(e.target.value) : undefined } })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">เกณฑ์การเตือน (%)</label>
            <input
              className="form-input"
              type="number"
              value={field.validation?.warningThreshold ?? ''}
              onChange={(e) => onUpdate({ validation: { ...field.validation, warningThreshold: e.target.value ? Number(e.target.value) : undefined } })}
              placeholder="% ความแตกต่างจากครั้งก่อน"
            />
            <span className="form-hint">แจ้งเตือนเมื่อค่าแตกต่างจากการตรวจสอบครั้งก่อนเป็น %</span>
          </div>
        </>
      )}

      {/* Options for radio/checkbox/select */}
      {(field.type === 'radio' || field.type === 'select' || field.type === 'checkbox') && (
        <div className="form-group">
          <label className="form-label">ตัวเลือก</label>
          {(field.options || []).map((opt, idx) => (
            <div key={idx} className="flex items-center gap-sm" style={{ marginBottom: '4px' }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                value={opt.label}
                onChange={(e) => {
                  const newOptions = [...(field.options || [])];
                  newOptions[idx] = { label: e.target.value, value: e.target.value };
                  onUpdate({ options: newOptions });
                }}
              />
              <button
                className="btn btn-icon btn-sm"
                style={{ color: 'var(--accent-red)' }}
                onClick={() => {
                  const newOptions = (field.options || []).filter((_, i) => i !== idx);
                  onUpdate({ options: newOptions });
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              const newOptions = [...(field.options || []), { label: 'ตัวเลือกใหม่', value: 'ตัวเลือกใหม่' }];
              onUpdate({ options: newOptions });
            }}
          >
            <Plus size={14} /> เพิ่มตัวเลือก
          </button>
        </div>
      )}

      {/* Conditional Logic */}
      <div className="form-group">
        <label className="form-label">ตรรกะแบบมีเงื่อนไข</label>
        <label className="form-check">
          <input
            type="checkbox"
            checked={!!field.conditionalRules}
            onChange={(e) => {
              if (e.target.checked) {
                const otherFields = allFields.filter(f => f.id !== field.id && (f.type === 'radio' || f.type === 'checkbox' || f.type === 'select'));
                if (otherFields.length > 0) {
                  onUpdate({
                    conditionalRules: {
                      dependsOn: otherFields[0].id,
                      showWhen: otherFields[0].options?.[0]?.value || '',
                    },
                  });
                }
              } else {
                onUpdate({ conditionalRules: undefined });
              }
            }}
          />
          <span className="form-check-label">แสดงแบบมีเงื่อนไข</span>
        </label>

        {field.conditionalRules && (
          <div className="flex flex-col gap-sm" style={{ marginTop: '8px', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-group">
              <label className="form-label text-xs">แสดงเมื่อรายการนี้:</label>
              <select
                className="form-input form-select"
                value={field.conditionalRules.dependsOn}
                onChange={(e) => onUpdate({ conditionalRules: { ...field.conditionalRules!, dependsOn: e.target.value } })}
              >
                {allFields
                  .filter(f => f.id !== field.id && (f.type === 'radio' || f.type === 'checkbox' || f.type === 'select'))
                  .map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))
                }
              </select>
            </div>
            <div className="form-group">
              <label className="form-label text-xs">มีค่าเท่ากับ:</label>
              <input
                className="form-input"
                value={field.conditionalRules.showWhen}
                onChange={(e) => onUpdate({ conditionalRules: { ...field.conditionalRules!, showWhen: e.target.value } })}
                placeholder="e.g. Fail, NG, Overload"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Preview Mode ----
function PreviewMode({
  template,
  sortedSections,
  getFieldsForSection,
}: {
  template: { name: string; description: string; fields: FormField[] };
  sortedSections: FormSection[];
  getFieldsForSection: (sectionId: string) => FormField[];
}) {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-body" style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>{template.name}</h2>
          {template.description && <p className="text-sm text-secondary mt-md">{template.description}</p>}
        </div>
      </div>

      {sortedSections.map((section) => {
        const fields = getFieldsForSection(section.id);
        return (
          <div key={section.id} style={{ marginBottom: 'var(--space-xl)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--accent-blue)' }}>{section.title}</h3>
            {fields.filter(f => !f.conditionalRules).map((field) => (
              <PreviewField key={field.id} field={field} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PreviewField({ field }: { field: FormField }) {
  return (
    <div className="exec-field-card">
      <div className="exec-field-header">
        <span className="exec-field-label">
          {field.label}
          {field.required && <span style={{ color: 'var(--accent-red)' }}> *</span>}
        </span>
        {field.unit && <span className="exec-field-unit">{field.unit}</span>}
      </div>

      {field.type === 'number' && (
        <input className="form-input" type="number" placeholder={field.placeholder || `Enter ${field.label}`} disabled />
      )}
      {field.type === 'text' && (
        <input className="form-input" type="text" placeholder={field.placeholder || `Enter ${field.label}`} disabled />
      )}
      {field.type === 'textarea' && (
        <textarea className="form-input form-textarea" placeholder={field.placeholder || 'Enter notes...'} disabled />
      )}
      {(field.type === 'radio' || field.type === 'checkbox') && (
        <div className="status-toggle-group">
          {(field.options || []).map((opt) => (
            <button key={opt.value} className="status-toggle">{opt.label}</button>
          ))}
        </div>
      )}
      {field.type === 'media' && (
        <div style={{ border: '2px dashed var(--border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <Camera size={24} style={{ margin: '0 auto 8px' }} />
          <p className="text-sm">แตะเพื่อถ่ายรูป</p>
        </div>
      )}
      {field.type === 'signature' && (
        <div className="signature-pad-wrapper" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
          <PenTool size={24} />
          <span className="text-sm" style={{ marginLeft: '8px' }}>แตะเพื่อเซ็นชื่อ</span>
        </div>
      )}
    </div>
  );
}
