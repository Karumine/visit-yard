import React from 'react';
import { useAppStore } from '../lib/store';
import HomeScreen from './HomeScreen';
import ReportWizard from './ReportWizard';
import ReportDetailScreen from './ReportDetailScreen';
import OfflineIndicator from '../components/OfflineIndicator';

export default function VisitYardAppWrapper() {
  const { screen } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <OfflineIndicator />
      {screen === 'home' && <HomeScreen />}
      {screen === 'wizard' && <ReportWizard />}
      {screen === 'detail' && <ReportDetailScreen />}
    </div>
  );
}
