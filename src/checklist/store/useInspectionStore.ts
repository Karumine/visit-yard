// ==============================
// Inspection Store — LocalStorage-based
// ==============================

import { useState, useCallback, useEffect } from 'react';
import type { InspectionRecord, FieldValue, InspectionStatus, InspectionSummary } from '../types/inspection';

const STORAGE_KEY = 'checklist_inspections';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Seed some demo inspections
const SEED_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'insp_001',
    templateId: 'tmpl_001',
    templateVersion: 1,
    machineId: 'mach_001',
    status: 'completed',
    values: [
      { fieldId: 'f_capacity', value: 14000, timestamp: '2026-03-15T10:00:00Z' },
      { fieldId: 'f_size', value: 600, timestamp: '2026-03-15T10:01:00Z' },
      { fieldId: 'f_chiller', value: 15, timestamp: '2026-03-15T10:02:00Z' },
      { fieldId: 'f_air_pressure', value: 30, timestamp: '2026-03-15T10:03:00Z' },
      { fieldId: 'f_coolant_temp', value: 30, timestamp: '2026-03-15T10:04:00Z' },
      { fieldId: 'f_machine_curr', value: 100, timestamp: '2026-03-15T10:05:00Z' },
      { fieldId: 'f_total_curr', value: 263, timestamp: '2026-03-15T10:06:00Z' },
      { fieldId: 'f_power_status', value: 'OK', timestamp: '2026-03-15T10:07:00Z' },
      { fieldId: 'f_plant_housing', value: 4, timestamp: '2026-03-15T10:08:00Z' },
      { fieldId: 'f_chassis', value: 'pass', timestamp: '2026-03-15T10:09:00Z' },
      { fieldId: 'f_ventilation', value: 5, timestamp: '2026-03-15T10:10:00Z' },
      { fieldId: 'f_safety', value: 4, timestamp: '2026-03-15T10:11:00Z' },
      { fieldId: 'f_body_paint', value: 3, timestamp: '2026-03-15T10:12:00Z' },
      { fieldId: 'f_run_hours', value: 9000, timestamp: '2026-03-15T10:13:00Z' },
      { fieldId: 'f_grounding', value: 'OK', timestamp: '2026-03-15T10:14:00Z' },
      { fieldId: 'f_power_conn', value: 'OK', timestamp: '2026-03-15T10:15:00Z' },
      { fieldId: 'f_lightning', value: 'OK', timestamp: '2026-03-15T10:16:00Z' },
      { fieldId: 'f_location_check', value: 'OK', timestamp: '2026-03-15T10:17:00Z' },
      { fieldId: 'f_utility', value: 'OK', timestamp: '2026-03-15T10:18:00Z' },
      { fieldId: 'f_operation', value: 'OK', timestamp: '2026-03-15T10:19:00Z' },
      { fieldId: 'f_sparepart', value: 'OK', timestamp: '2026-03-15T10:20:00Z' },
      { fieldId: 'f_remote', value: 'OK', timestamp: '2026-03-15T10:21:00Z' },
      { fieldId: 'f_control_panel', value: 'OK', timestamp: '2026-03-15T10:22:00Z' },
    ],
    startedAt: '2026-03-15T10:00:00Z',
    completedAt: '2026-03-15T11:30:00Z',
    inspectorId: 'user_001',
    inspectorName: 'วิศวกร สมชาย',
  },
];

function loadInspections(): InspectionRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return SEED_INSPECTIONS;
}

function saveInspections(inspections: InspectionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inspections));
}

export function useInspectionStore() {
  const [inspections, setInspections] = useState<InspectionRecord[]>(loadInspections);

  useEffect(() => {
    saveInspections(inspections);
  }, [inspections]);

  const createInspection = useCallback((templateId: string, templateVersion: number, machineId: string, inspectorName: string, templateSnapshot?: any): InspectionRecord => {
    // Find previous inspection for historical comparison
    const previousInspections = inspections
      .filter(i => i.machineId === machineId && i.templateId === templateId && i.status === 'completed')
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const newInspection: InspectionRecord = {
      id: `insp_${generateId()}`,
      templateId,
      templateVersion,
      templateSnapshot,
      machineId,
      status: 'in_progress',
      values: [],
      startedAt: new Date().toISOString(),
      inspectorId: `user_${generateId()}`,
      inspectorName,
      previousInspectionId: previousInspections[0]?.id,
    };
    setInspections(prev => [...prev, newInspection]);
    return newInspection;
  }, [inspections]);

  const updateFieldValue = useCallback((inspectionId: string, fieldValue: Partial<FieldValue> & { fieldId: string }) => {
    setInspections(prev => prev.map(insp => {
      if (insp.id !== inspectionId) return insp;
      const existingIndex = insp.values.findIndex(v => v.fieldId === fieldValue.fieldId);
      const newValues = [...insp.values];
      if (existingIndex >= 0) {
        newValues[existingIndex] = { 
          ...newValues[existingIndex], 
          ...fieldValue,
          timestamp: new Date().toISOString()
        };
      } else {
        newValues.push({
          ...fieldValue,
          value: fieldValue.value ?? null,
          timestamp: new Date().toISOString()
        } as FieldValue);
      }
      return { ...insp, values: newValues };
    }));
  }, []);

  const completeInspection = useCallback((inspectionId: string) => {
    setInspections(prev => prev.map(insp =>
      insp.id === inspectionId
        ? { ...insp, status: 'completed' as InspectionStatus, completedAt: new Date().toISOString() }
        : insp
    ));
  }, []);

  const getInspection = useCallback((id: string) => {
    return inspections.find(i => i.id === id);
  }, [inspections]);

  const getInspectionsForMachine = useCallback((machineId: string) => {
    return inspections
      .filter(i => i.machineId === machineId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [inspections]);

  const getPreviousValues = useCallback((inspectionId: string): FieldValue[] => {
    const inspection = inspections.find(i => i.id === inspectionId);
    if (!inspection?.previousInspectionId) return [];
    const prevInspection = inspections.find(i => i.id === inspection.previousInspectionId);
    return prevInspection?.values || [];
  }, [inspections]);

  const deleteInspection = useCallback((id: string) => {
    setInspections(prev => prev.filter(i => i.id !== id));
  }, []);

  // Dashboard summaries
  const getSummaries = useCallback((templates: any[]): InspectionSummary[] => {
    return inspections.map(insp => {
      const template = insp.templateSnapshot || templates.find(t => t.id === insp.templateId);
      let totalScore = 0;
      let maxPossibleScore = 0;

      if (template) {
        template.fields.forEach((field: any) => {
          if (field.maxScore) {
            maxPossibleScore += field.maxScore;
            const recorded = insp.values.find((v: any) => v.fieldId === field.id);
            if (recorded && typeof recorded.value === 'number') {
              totalScore += recorded.value;
            }
          }
        });
      }

      return {
        id: insp.id,
        machineName: insp.machineId,
        machineId: insp.machineId,
        templateName: template?.name || insp.templateId,
        inspectorName: insp.inspectorName,
        status: insp.status,
        startedAt: insp.startedAt,
        completedAt: insp.completedAt,
        passCount: insp.values.filter(v => v.value === 'OK' || v.value === 'pass').length,
        failCount: insp.values.filter(v => v.value === 'NG' || v.value === 'fail' || v.value === 'Overload').length,
        totalFields: insp.values.length,
        totalScore,
        maxPossibleScore,
      };
    });
  }, [inspections]);

  return {
    inspections,
    createInspection,
    updateFieldValue,
    completeInspection,
    getInspection,
    getInspectionsForMachine,
    getPreviousValues,
    deleteInspection,
    getSummaries,
  };
}
