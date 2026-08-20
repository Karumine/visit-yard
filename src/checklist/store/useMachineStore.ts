// ==============================
// Machine Store — LocalStorage-based
// ==============================

import { useState, useCallback, useEffect } from 'react';
import type { Machine } from '../types/machine';

const STORAGE_KEY = 'checklist_machines';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const SEED_MACHINES: Machine[] = [];

function loadMachines(): Machine[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
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
