// ==============================
// Template Store — LocalStorage-based
// ==============================

import { useState, useCallback, useEffect } from 'react';
import type { FormTemplate, FormField, FormSection, FieldType } from '../types/template';

const STORAGE_KEY = 'checklist_templates';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Seed data: sample template based on existing checklist
const SEED_TEMPLATES: FormTemplate[] = [
  {
    id: 'tmpl_001',
    name: 'เครื่องเป่าขวด - Commissioning Checklist',
    description: 'แบบตรวจสอบรับมอบเครื่องเป่าขวด PET สำหรับสายการผลิตน้ำดื่ม',
    version: 1,
    machineType: 'เครื่องเป่าขวด',
    sections: [
      { id: 'sec_equip', title: 'Equipment Check', description: 'ตรวจสอบอุปกรณ์และค่าการทำงานเครื่อง', order: 0 },
      { id: 'sec_physical', title: 'Physical Inspection', description: 'ตรวจสอบสภาพทางกายภาพ', order: 1 },
      { id: 'sec_technical', title: 'Technical Check', description: 'ตรวจสอบทางเทคนิค', order: 2 },
    ],
    fields: [
      // Equipment section
      { id: 'f_capacity', type: 'number', label: 'Capacity', required: true, sectionId: 'sec_equip', order: 0, unit: 'Hours', validation: { min: 0, max: 100000 } },
      { id: 'f_size', type: 'number', label: 'Size', required: true, sectionId: 'sec_equip', order: 1, unit: 'cc', validation: { min: 0, max: 5000 } },
      { id: 'f_chiller', type: 'number', label: 'Chiller Temp', required: true, sectionId: 'sec_equip', order: 2, unit: '°C', validation: { min: 0, max: 50, warningThreshold: 15 } },
      { id: 'f_air_pressure', type: 'number', label: 'Air Pressure', required: true, sectionId: 'sec_equip', order: 3, unit: 'kPa', validation: { min: 0, max: 100, warningThreshold: 10 } },
      { id: 'f_coolant_temp', type: 'number', label: 'Coolant Temp', required: true, sectionId: 'sec_equip', order: 4, unit: '°C', validation: { min: 0, max: 100, warningThreshold: 15 } },
      { id: 'f_machine_curr', type: 'number', label: 'Machine Current', required: true, sectionId: 'sec_equip', order: 5, unit: 'Amp', validation: { min: 0, max: 500, warningThreshold: 10 } },
      { id: 'f_total_curr', type: 'number', label: 'Total Current', required: true, sectionId: 'sec_equip', order: 6, unit: 'Amp', validation: { min: 0, max: 1000, warningThreshold: 10 } },
      { id: 'f_power_status', type: 'radio', label: 'Power Status', required: true, sectionId: 'sec_equip', order: 7, options: [{ label: 'OK', value: 'OK' }, { label: 'Overload', value: 'Overload' }, { label: 'Under', value: 'Under' }] },
      { id: 'f_power_note', type: 'textarea', label: 'Power Status - หมายเหตุ', required: false, sectionId: 'sec_equip', order: 8, placeholder: 'รายละเอียดปัญหา...', conditionalRules: { dependsOn: 'f_power_status', showWhen: 'Overload' } },

      // Physical section
      { id: 'f_plant_housing', type: 'number', label: 'Plant Housing', required: true, sectionId: 'sec_physical', order: 0, unit: 'คะแนน (1-5)', validation: { min: 1, max: 5 }, maxScore: 5 },
      { id: 'f_chassis', type: 'radio', label: 'Chassis Base', required: true, sectionId: 'sec_physical', order: 1, options: [{ label: 'Pass', value: 'pass' }, { label: 'Fail', value: 'fail' }] },
      { id: 'f_chassis_note', type: 'textarea', label: 'Chassis Base - รายละเอียดปัญหา', required: false, sectionId: 'sec_physical', order: 2, conditionalRules: { dependsOn: 'f_chassis', showWhen: 'fail' } },
      { id: 'f_chassis_photo', type: 'media', label: 'Chassis Base - ภาพถ่าย', required: false, sectionId: 'sec_physical', order: 3, conditionalRules: { dependsOn: 'f_chassis', showWhen: 'fail' } },
      { id: 'f_ventilation', type: 'number', label: 'Ventilation', required: true, sectionId: 'sec_physical', order: 4, unit: 'คะแนน (1-5)', validation: { min: 1, max: 5 }, maxScore: 5 },
      { id: 'f_safety', type: 'number', label: 'Safety Device', required: true, sectionId: 'sec_physical', order: 5, unit: 'คะแนน (1-5)', validation: { min: 1, max: 5 }, maxScore: 5 },
      { id: 'f_body_paint', type: 'number', label: 'Body Paint', required: true, sectionId: 'sec_physical', order: 6, unit: 'คะแนน (1-5)', validation: { min: 1, max: 5 }, maxScore: 5 },
      { id: 'f_run_hours', type: 'number', label: 'Run Hours', required: true, sectionId: 'sec_physical', order: 7, unit: 'Hours', validation: { min: 0 } },

      // Technical section
      { id: 'f_grounding', type: 'radio', label: 'Electrical Grounding (ระบบสายดิน)', required: true, sectionId: 'sec_technical', order: 0, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_power_conn', type: 'radio', label: 'Power Connecting (การเชื่อมต่อสายไฟ)', required: true, sectionId: 'sec_technical', order: 1, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_lightning', type: 'radio', label: 'Lightning Protection (ระบบป้องกันฟ้าผ่า)', required: true, sectionId: 'sec_technical', order: 2, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_location_check', type: 'radio', label: 'Location (สถานที่ตั้งเครื่อง)', required: true, sectionId: 'sec_technical', order: 3, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_utility', type: 'radio', label: 'Utility Connecting (การเชื่อมต่อระบบ)', required: true, sectionId: 'sec_technical', order: 4, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_operation', type: 'radio', label: 'Operation (การปฏิบัติการ)', required: true, sectionId: 'sec_technical', order: 5, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_sparepart', type: 'radio', label: 'Sparepart (การเตรียมอะไหล่สำรอง)', required: true, sectionId: 'sec_technical', order: 6, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_remote', type: 'radio', label: 'Remote Online', required: true, sectionId: 'sec_technical', order: 7, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_control_panel', type: 'radio', label: 'Control Panel', required: true, sectionId: 'sec_technical', order: 8, options: [{ label: 'OK', value: 'OK' }, { label: 'NG', value: 'NG' }] },
      { id: 'f_signature', type: 'signature', label: 'ลายเซ็นวิศวกร', required: true, sectionId: 'sec_technical', order: 9 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true,
  },
  {
    id: 'tmpl_002',
    name: 'Solar Inverter - Maintenance Checklist',
    description: 'แบบตรวจสอบบำรุงรักษา Inverter ระบบโซล่าเซลล์',
    version: 1,
    machineType: 'Solar Inverter',
    sections: [
      { id: 'sec_visual', title: 'Visual Inspection', description: 'ตรวจสอบด้วยสายตา', order: 0 },
      { id: 'sec_electrical', title: 'Electrical Test', description: 'ทดสอบค่าทางไฟฟ้า', order: 1 },
    ],
    fields: [
      { id: 'f_enclosure', type: 'radio', label: 'Enclosure Condition', required: true, sectionId: 'sec_visual', order: 0, options: [{ label: 'Pass', value: 'pass' }, { label: 'Fail', value: 'fail' }] },
      { id: 'f_wiring', type: 'radio', label: 'Wiring Condition', required: true, sectionId: 'sec_visual', order: 1, options: [{ label: 'Pass', value: 'pass' }, { label: 'Fail', value: 'fail' }] },
      { id: 'f_dc_voltage', type: 'number', label: 'DC Input Voltage', required: true, sectionId: 'sec_electrical', order: 0, unit: 'V', validation: { min: 0, max: 1000, warningThreshold: 10 } },
      { id: 'f_ac_voltage', type: 'number', label: 'AC Output Voltage', required: true, sectionId: 'sec_electrical', order: 1, unit: 'V', validation: { min: 200, max: 250, warningThreshold: 5 } },
      { id: 'f_frequency', type: 'number', label: 'Grid Frequency', required: true, sectionId: 'sec_electrical', order: 2, unit: 'Hz', validation: { min: 49, max: 51, warningThreshold: 2 } },
      { id: 'f_power_output', type: 'number', label: 'Power Output', required: true, sectionId: 'sec_electrical', order: 3, unit: 'kW', validation: { min: 0, max: 100 } },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true,
  },
  {
    id: 'tmpl_demo_all',
    name: 'All Functions Demo Template',
    description: 'เทมเพลตที่รวมทุกฟังก์ชันและทุกประเภทฟิลด์ สำหรับการทดสอบ (Demo)',
    version: 1,
    machineType: 'Demo Machine',
    sections: [
      { id: 'sec_basic', title: '1. Basic Inputs', description: 'ฟิลด์ข้อมูลพื้นฐาน', order: 0 },
      { id: 'sec_advanced', title: '2. Advanced & Media', description: 'ฟิลด์ขั้นสูงและไฟล์แนบ', order: 1 },
      { id: 'sec_condition', title: '3. Conditional Logic', description: 'การแสดงผลแบบมีเงื่อนไข', order: 2 },
    ],
    fields: [
      // Basic
      { id: 'f_demo_text', type: 'text', label: '1. Short Text (ข้อความสั้น)', required: true, sectionId: 'sec_basic', order: 0, placeholder: 'พิมพ์ข้อความที่นี่...' },
      { id: 'f_demo_number', type: 'number', label: '2. Number (ตัวเลข)', required: true, sectionId: 'sec_basic', order: 1, unit: 'หน่วย', validation: { min: 0, max: 100, warningThreshold: 80 } },
      { id: 'f_demo_textarea', type: 'textarea', label: '3. Text Area (ข้อความยาว)', required: false, sectionId: 'sec_basic', order: 2, placeholder: 'พิมพ์รายละเอียดเพิ่มเติม...' },
      { id: 'f_demo_checkbox', type: 'checkbox', label: '4. Checkbox (ตัวเลือกแบบเช็คบ็อกซ์)', required: true, sectionId: 'sec_basic', order: 3, options: [{ label: 'Pass', value: 'pass' }, { label: 'Fail', value: 'fail' }] },
      
      // Advanced
      { id: 'f_demo_media', type: 'media', label: '5. Media (รูปภาพ/ไฟล์)', required: false, sectionId: 'sec_advanced', order: 0 },
      { id: 'f_demo_signature', type: 'signature', label: '6. Signature (ลายเซ็น)', required: true, sectionId: 'sec_advanced', order: 1 },

      // Conditional Logic
      { id: 'f_demo_radio', type: 'radio', label: '7. Radio (เลือก 1 ตัวเลือก)', required: true, sectionId: 'sec_condition', order: 0, options: [{ label: 'Option A', value: 'A' }, { label: 'Option B', value: 'B' }, { label: 'Show Hidden Field', value: 'show' }] },
      { id: 'f_demo_select', type: 'select', label: '8. Dropdown (เลือกจากรายการ)', required: true, sectionId: 'sec_condition', order: 1, options: [{ label: 'Normal', value: 'normal' }, { label: 'Warning', value: 'warning' }, { label: 'Critical', value: 'critical' }] },
      
      // Conditional fields
      { id: 'f_demo_cond_radio', type: 'text', label: '9. แสดงเมื่อเลือก Radio = "Show Hidden Field"', required: true, sectionId: 'sec_condition', order: 2, conditionalRules: { dependsOn: 'f_demo_radio', showWhen: 'show' } },
      { id: 'f_demo_cond_select', type: 'textarea', label: '10. แสดงเมื่อเลือก Dropdown = "Critical"', required: true, sectionId: 'sec_condition', order: 3, conditionalRules: { dependsOn: 'f_demo_select', showWhen: 'critical' } },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true,
  },
];

function loadTemplates(): FormTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore parse errors */ }
  return SEED_TEMPLATES;
}

function saveTemplates(templates: FormTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function useTemplateStore() {
  const [templates, setTemplates] = useState<FormTemplate[]>(loadTemplates);

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  const addTemplate = useCallback((template: Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    const newTemplate: FormTemplate = {
      ...template,
      id: `tmpl_${generateId()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<FormTemplate>) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString(), version: t.version + 1 } : t
    ));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTemplate = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  const addFieldToTemplate = useCallback((templateId: string, field: Omit<FormField, 'id' | 'order'>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const sectionFields = t.fields.filter(f => f.sectionId === field.sectionId);
      const newField: FormField = {
        ...field,
        id: `f_${generateId()}`,
        order: sectionFields.length,
      };
      return { ...t, fields: [...t.fields, newField], updatedAt: new Date().toISOString() };
    }));
  }, []);

  const removeFieldFromTemplate = useCallback((templateId: string, fieldId: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return { ...t, fields: t.fields.filter(f => f.id !== fieldId), updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateFieldInTemplate = useCallback((templateId: string, fieldId: string, updates: Partial<FormField>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        fields: t.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const reorderField = useCallback((templateId: string, fieldId: string, newOrder: number) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const field = t.fields.find(f => f.id === fieldId);
      if (!field) return t;
      const sectionFields = t.fields
        .filter(f => f.sectionId === field.sectionId && f.id !== fieldId)
        .sort((a, b) => a.order - b.order);
      sectionFields.splice(newOrder, 0, field);
      const updatedFields = t.fields.map(f => {
        if (f.sectionId !== field.sectionId) return f;
        const idx = sectionFields.findIndex(sf => sf.id === f.id);
        return { ...f, order: idx >= 0 ? idx : f.order };
      });
      return { ...t, fields: updatedFields, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const addSectionToTemplate = useCallback((templateId: string, section: Omit<FormSection, 'id' | 'order'>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const newSection: FormSection = {
        ...section,
        id: `sec_${generateId()}`,
        order: t.sections.length,
      };
      return { ...t, sections: [...t.sections, newSection], updatedAt: new Date().toISOString() };
    }));
  }, []);

  const removeSectionFromTemplate = useCallback((templateId: string, sectionId: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        sections: t.sections.filter(s => s.id !== sectionId),
        fields: t.fields.filter(f => f.sectionId !== sectionId),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const createBlankTemplate = useCallback(() => {
    const template: FormTemplate = {
      id: `tmpl_${generateId()}`,
      name: 'Untitled Template',
      description: '',
      version: 1,
      machineType: '',
      sections: [
        { id: `sec_${generateId()}`, title: 'Section 1', order: 0 },
      ],
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      isActive: true,
    };
    setTemplates(prev => [...prev, template]);
    return template;
  }, []);

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    addFieldToTemplate,
    removeFieldFromTemplate,
    updateFieldInTemplate,
    reorderField,
    addSectionToTemplate,
    removeSectionFromTemplate,
    createBlankTemplate,
  };
}

// Export field type configuration for the palette
export const FIELD_TYPE_CONFIG: { type: FieldType; label: string; icon: string; description: string; color: string }[] = [
  { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare', description: 'Pass/Fail, Yes/No', color: 'var(--accent-green)' },
  { type: 'radio', label: 'Radio', icon: 'CircleDot', description: 'Multiple Choice', color: 'var(--accent-blue)' },
  { type: 'number', label: 'Number', icon: 'Hash', description: 'ค่าตัวเลข + หน่วย', color: 'var(--accent-cyan)' },
  { type: 'text', label: 'Text', icon: 'Type', description: 'ข้อความสั้น', color: 'var(--accent-purple)' },
  { type: 'textarea', label: 'Text Area', icon: 'AlignLeft', description: 'ข้อความยาว / Note', color: 'var(--accent-purple)' },
  { type: 'media', label: 'Media', icon: 'Camera', description: 'ถ่ายรูป / แนบไฟล์', color: 'var(--accent-amber)' },
  { type: 'signature', label: 'Signature', icon: 'PenTool', description: 'ลายเซ็น', color: 'var(--accent-red)' },
  { type: 'select', label: 'Dropdown', icon: 'ChevronDown', description: 'เลือกจาก List', color: 'var(--text-tertiary)' },
];
