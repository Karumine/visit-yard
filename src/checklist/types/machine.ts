// ==============================
// Machine / Asset Types
// ==============================

export interface Machine {
  id: string;
  name: string;
  type: string;
  machineNo: string;
  location: string;
  projectName: string;
  brand?: string;
  serialNumber?: string;
  installDate?: string;
  lastInspectionDate?: string;
  status: 'active' | 'inactive' | 'maintenance';
  assignedTemplateId?: string;
  notes?: string;
}
