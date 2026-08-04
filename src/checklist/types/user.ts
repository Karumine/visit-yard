// ==============================
// User & Role Types
// ==============================

export type UserRole = 'engineer' | 'supervisor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Permissions per role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  engineer: ['execute_checklist', 'view_own_inspections', 'view_dashboard'],
  supervisor: ['execute_checklist', 'view_all_inspections', 'edit_templates', 'approve_inspections', 'view_dashboard', 'export_reports'],
  admin: ['execute_checklist', 'view_all_inspections', 'edit_templates', 'approve_inspections', 'view_dashboard', 'export_reports', 'manage_users', 'manage_machines'],
};
