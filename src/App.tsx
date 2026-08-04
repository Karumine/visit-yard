import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EngineerGlobalHeader from './components/EngineerGlobalHeader';
import EngineerHubScreen from './screens/EngineerHubScreen';
import VisitYardAppWrapper from './screens/VisitYardAppWrapper';
import ChecklistAppWrapper from './checklist/ChecklistAppWrapper';
import EngineerManualScreen from './screens/EngineerManualScreen';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        {/* Global Navigation Header across all apps */}
        <EngineerGlobalHeader />
        
        {/* Main Application Routes */}
        <main className="flex-1">
          <Routes>
            {/* Engineer Hub Landing Page */}
            <Route path="/" element={<EngineerHubScreen />} />
            
            {/* Visit Yard Sub-Application */}
            <Route path="/visit-yard/*" element={<VisitYardAppWrapper />} />
            
            {/* Checklist Sub-Application */}
            <Route path="/checklist/*" element={<ChecklistAppWrapper />} />
            
            {/* Engineer Manual & Safety Guidelines */}
            <Route path="/manual" element={<EngineerManualScreen />} />

            {/* Fallback to Hub */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
