// ==========================================
// Zustand Store — App State Management
// ==========================================
import { create } from 'zustand';
import type { VisitReport } from '../types/report';
import { createEmptyReport } from '../types/report';
import { storageService } from './storage';

type Screen = 'home' | 'wizard' | 'detail';

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
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Report operations
  createNewReport: () => void;
  openReport: (id: string) => Promise<void>;
  viewReport: (id: string) => Promise<void>;
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
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  loadReports: async () => {
    set({ isLoading: true });
    try {
      const reports = await storageService.getAllReports();
      set({ reports });
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      set({ isLoading: false });
    }
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

  viewReport: async (id) => {
    const report = await storageService.getReport(id);
    if (report) {
      set({ currentReport: report, screen: 'detail' });
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
    set({ isLoading: true });
    try {
      await storageService.deleteReport(id);
      const reports = await storageService.getAllReports();
      set({ reports });
    } finally {
      set({ isLoading: false });
    }
  },

  duplicateReport: async (id) => {
    set({ isLoading: true });
    try {
      await storageService.duplicateReport(id);
      const reports = await storageService.getAllReports();
      set({ reports });
    } finally {
      set({ isLoading: false });
    }
  },

  lastSaved: null,
  setLastSaved: (date) => set({ lastSaved: date }),

  isOnline: navigator.onLine,
  setIsOnline: (online) => set({ isOnline: online }),
}));
