// ==========================================
// OfflineIndicator — แถบสถานะออฟไลน์
// ==========================================
import React, { useEffect } from 'react';
import { useAppStore } from '../lib/store';

export default function OfflineIndicator() {
  const { isOnline, setIsOnline } = useAppStore();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium animate-pulse">
      📡 ทำงานแบบออฟไลน์ — ข้อมูลถูกบันทึกในเครื่อง
    </div>
  );
}
