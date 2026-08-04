// ==============================
// Machine Store — LocalStorage-based
// ==============================

import { useState, useCallback, useEffect } from 'react';
import type { Machine } from '../types/machine';

const STORAGE_KEY = 'checklist_machines';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const SEED_MACHINES: Machine[] = [
  {
    id: 'mach_001',
    name: 'เครื่องเป่าขวด A',
    type: 'เครื่องเป่าขวด',
    machineNo: 'A',
    location: 'ยางขาม, หนองเรือ',
    projectName: 'น้ำดื่มขอนแก่น Line 3',
    brand: 'PET Blow',
    serialNumber: 'PB-2024-001',
    installDate: '2024-08-29',
    lastInspectionDate: '2026-03-15',
    status: 'active',
    assignedTemplateId: 'tmpl_001',
  },
  {
    id: 'mach_002',
    name: 'เครื่องเป่าขวด B',
    type: 'เครื่องเป่าขวด',
    machineNo: 'B',
    location: 'ขอนแก่น',
    projectName: 'น้ำดื่ม Line 2',
    brand: 'PET Blow',
    serialNumber: 'PB-2024-002',
    installDate: '2024-08-25',
    status: 'active',
    assignedTemplateId: 'tmpl_001',
  },
  {
    id: 'mach_003',
    name: 'Solar Inverter #1',
    type: 'Solar Inverter',
    machineNo: 'INV-01',
    location: 'หลังคาอาคาร A',
    projectName: 'Solar Rooftop Phase 1',
    brand: 'Huawei',
    serialNumber: 'SUN2000-50KTL',
    installDate: '2025-06-01',
    status: 'active',
    assignedTemplateId: 'tmpl_002',
  },
  {
    id: 'mach_004',
    name: 'Solar Inverter #2',
    type: 'Solar Inverter',
    machineNo: 'INV-02',
    location: 'หลังคาอาคาร B',
    projectName: 'Solar Rooftop Phase 1',
    brand: 'Huawei',
    serialNumber: 'SUN2000-50KTL-02',
    installDate: '2025-06-01',
    status: 'maintenance',
    assignedTemplateId: 'tmpl_002',
    notes: 'รอเปลี่ยน DC breaker',
  },
];

function loadMachines(): Machine[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return SEED_MACHINES;
}

function saveMachines(machines: Machine[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(machines));
}

export function useMachineStore() {
  const [machines, setMachines] = useState<Machine[]>(loadMachines);

  useEffect(() => {
    saveMachines(machines);
  }, [machines]);

  const addMachine = useCallback((machine: Omit<Machine, 'id'>) => {
    const newMachine: Machine = {
      ...machine,
      id: `mach_${generateId()}`,
    };
    setMachines(prev => [...prev, newMachine]);
    return newMachine;
  }, []);

  const updateMachine = useCallback((id: string, updates: Partial<Machine>) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteMachine = useCallback((id: string) => {
    setMachines(prev => prev.filter(m => m.id !== id));
  }, []);

  const getMachine = useCallback((id: string) => {
    return machines.find(m => m.id === id);
  }, [machines]);

  const getMachinesByType = useCallback((type: string) => {
    return machines.filter(m => m.type === type);
  }, [machines]);

  const getActiveMachines = useCallback(() => {
    return machines.filter(m => m.status === 'active');
  }, [machines]);

  return {
    machines,
    addMachine,
    updateMachine,
    deleteMachine,
    getMachine,
    getMachinesByType,
    getActiveMachines,
  };
}
