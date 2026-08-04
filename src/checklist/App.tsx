// ==============================
// App.tsx — Root Component with Routing
// ==============================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import TemplateList from './pages/TemplateList';
import TemplateEditor from './pages/TemplateEditor';
import InspectionSelect from './pages/InspectionSelect';
import InspectionForm from './pages/InspectionForm';
import MachineList from './pages/MachineList';
import Settings from './pages/Settings';
import Help from './pages/Help';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/templates/:id" element={<TemplateEditor />} />
          <Route path="/inspect" element={<InspectionSelect />} />
          <Route path="/inspect/:id" element={<InspectionForm />} />
          <Route path="/machines" element={<MachineList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
