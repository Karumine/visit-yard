import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import TemplateList from './pages/TemplateList';
import TemplateEditor from './pages/TemplateEditor';
import InspectionSelect from './pages/InspectionSelect';
import InspectionForm from './pages/InspectionForm';
import MachineList from './pages/MachineList';
import Settings from './pages/Settings';
import Help from './pages/Help';

export default function ChecklistAppWrapper() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="templates" element={<TemplateList />} />
        <Route path="templates/:id" element={<TemplateEditor />} />
        <Route path="inspect" element={<InspectionSelect />} />
        <Route path="inspect/:id" element={<InspectionForm />} />
        <Route path="machines" element={<MachineList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>
    </Routes>
  );
}
