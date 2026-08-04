// ==============================
// Inspection Record Types
// ==============================

export interface FieldValue {
  fieldId: string;
  value: string | number | boolean | null;
  mediaUrls?: string[];      // For media fields
  signatureData?: string;    // Base64 for signature fields
  note?: string;             // Additional notes
  timestamp: string;         // When this value was recorded
}

export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'approved';

export interface InspectionRecord {
  id: string;
  templateId: string;
  templateVersion: number;
  templateSnapshot?: any; // Stores a snapshot of the template to prevent historical data changes
  machineId: string;
  status: InspectionStatus;
  values: FieldValue[];
  startedAt: string;
  completedAt?: string;
  inspectorId: string;
  inspectorName: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  // For historical comparison
  previousInspectionId?: string;
}

// Summary for dashboard
export interface InspectionSummary {
  id: string;
  machineName: string;
  machineId: string;
  templateName: string;
  inspectorName: string;
  status: InspectionStatus;
  startedAt: string;
  completedAt?: string;
  passCount: number;
  failCount: number;
  totalFields: number;
  totalScore?: number;
  maxPossibleScore?: number;
}
