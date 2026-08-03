// ==========================================
// Zustand Store — App State Management
// ==========================================
import { create } from 'zustand';
import type { VisitReport } from '../types/report';
import { createEmptyReport } from '../types/report';
import { storageService } from './storage';

type Screen = 'home' | 'wizard';

interface AppState {
  // Navigation
  screen: Screen;
  setScreen: (screen: Screen) => void;

  // Current report being edited
  currentReport: VisitReport | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Report list
  reports: VisitReport[];
  loadReports: () => Promise<void>;

  // Report operations
  createNewReport: () => void;
  openReport: (id: string) => Promise<void>;
  updateCurrentReport: (partial: Partial<VisitReport>) => void;
  saveCurrentReport: () => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  duplicateReport: (id: string) => Promise<void>;

  // Autosave
  lastSaved: Date | null;
  setLastSaved: (date: Date) => void;

  // Online status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'home',
  setScreen: (screen) => set({ screen }),

  currentReport: null,
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),

  reports: [],
  loadReports: async () => {
    const reports = await storageService.getAllReports();
    set({ reports });
  },

  createNewReport: () => {
    const report = createEmptyReport();
    set({ currentReport: report, currentStep: 1, screen: 'wizard' });
  },

  openReport: async (id) => {
    const report = await storageService.getReport(id);
    if (report) {
      set({ currentReport: report, currentStep: 1, screen: 'wizard' });
    }
  },

  updateCurrentReport: (partial) => {
    const current = get().currentReport;
    if (!current) return;
    set({
      currentReport: { ...current, ...partial, updatedAt: new Date().toISOString() },
    });
  },

  saveCurrentReport: async () => {
    const report = get().currentReport;
    if (!report) return;
    await storageService.saveReport(report);
    set({ lastSaved: new Date() });
    // Refresh list
    const reports = await storageService.getAllReports();
    set({ reports });
  },

  deleteReport: async (id) => {
    await storageService.deleteReport(id);
    const reports = await storageService.getAllReports();
    set({ reports });
  },

  duplicateReport: async (id) => {
    await storageService.duplicateReport(id);
    const reports = await storageService.getAllReports();
    set({ reports });
  },

  lastSaved: null,
  setLastSaved: (date) => set({ lastSaved: date }),

  isOnline: navigator.onLine,
  setIsOnline: (online) => set({ isOnline: online }),
}));
