import { useState, useEffect } from 'react';

export interface SystemSettings {
  systemTitle: string;
  systemSubtitle: string;
  inspectorName: string;
  inspectorId: string;
  signature: string | null;
  scoreThresholds: {
    critical: number;
    warning: number;
  };
  autoSave: boolean;
  theme: 'dark' | 'light';
}

const DEFAULT_SETTINGS: SystemSettings = {
  systemTitle: 'Eng Checklist',
  systemSubtitle: 'Industrial Intelligence',
  inspectorName: 'วิศวกร สมชาย',
  inspectorId: 'EMP-001',
  signature: null,
  scoreThresholds: {
    critical: 70,
    warning: 90,
  },
  autoSave: true,
  theme: 'dark',
};

const STORAGE_KEY = 'checklist_settings';

export function useSettingsStore() {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetAllData = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const exportAllData = () => {
    const data = {
      settings,
      templates: JSON.parse(localStorage.getItem('checklist_templates') || '[]'),
      inspections: JSON.parse(localStorage.getItem('checklist_inspections') || '[]'),
      machines: JSON.parse(localStorage.getItem('checklist_machines') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eng-checklist-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    settings,
    updateSettings,
    resetAllData,
    exportAllData,
  };
}
