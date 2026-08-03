import React from 'react';
import { useAppStore } from './lib/store';
import HomeScreen from './screens/HomeScreen';
import ReportWizard from './screens/ReportWizard';
import ReportDetailScreen from './screens/ReportDetailScreen';
import OfflineIndicator from './components/OfflineIndicator';

export default function App() {
  const { screen } = useAppStore();

  return (
    <>
      <OfflineIndicator />
      {screen === 'home' && <HomeScreen />}
      {screen === 'wizard' && <ReportWizard />}
      {screen === 'detail' && <ReportDetailScreen />}
    </>
  );
}
