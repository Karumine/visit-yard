// ==============================
// Template & Form Field Types
// JSON Schema-based dynamic form system
// ==============================

export type FieldType =
  | 'checkbox'    // Pass/Fail, Yes/No
  | 'radio'       // Multiple choice
  | 'number'      // Numeric with min/max validation
  | 'text'        // Short text input
  | 'textarea'    // Long text / notes
  | 'media'       // Photo upload
  | 'signature'   // Signature pad
  | 'select';     // Dropdown selection

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  warningThreshold?: number;  // % variance for historical comparison alerts
}

export interface ConditionalRule {
  dependsOn: string;      // field ID this depends on
  showWhen: string;        // value that triggers visibility
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  sectionId: string;
  order: number;
  placeholder?: string;
  unit?: string;                      // Unit for numeric fields (e.g., "V", "A", "°C")
  options?: FieldOption[];            // For checkbox/radio/select
  validation?: FieldValidation;
  conditionalRules?: ConditionalRule;
  defaultValue?: string | number | boolean;
  maxScore?: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  version: number;
  machineType: string;
  sections: FormSection[];
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

// For versioning
export interface TemplateVersion {
  templateId: string;
  version: number;
  snapshot: FormTemplate;
  changedAt: string;
  changedBy: string;
  changeNote: string;
}
