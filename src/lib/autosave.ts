// ==========================================
// Autosave Hook — debounce 3 วินาที
// ==========================================
import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from './store';

export function useAutosave() {
  const { currentReport, saveCurrentReport, setLastSaved } = useAppStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevReportRef = useRef<string>('');

  const doSave = useCallback(async () => {
    if (!currentReport) return;
    await saveCurrentReport();
    setLastSaved(new Date());
  }, [currentReport, saveCurrentReport, setLastSaved]);

  useEffect(() => {
    if (!currentReport) return;

    const reportJson = JSON.stringify(currentReport);
    if (reportJson === prevReportRef.current) return;
    prevReportRef.current = reportJson;

    // Debounce 3 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentReport, doSave]);

  // Save on page visibility change (Safari kill tab prevention)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && currentReport) {
        doSave();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [currentReport, doSave]);

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentReport) doSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentReport, doSave]);

  return { doSave };
}
