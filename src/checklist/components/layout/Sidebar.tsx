// ==============================
// Sidebar Component
// ==============================

import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Settings,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface SidebarProps {
  isExpanded: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { label: 'แดชบอร์ด Checklist', icon: LayoutDashboard, path: '/checklist' },
  { label: 'การตรวจสอบ', icon: ClipboardCheck, path: '/checklist/inspect' },
  { label: 'เครื่องจักร', icon: Cpu, path: '/checklist/machines' },
  { label: 'แม่แบบ', icon: FileText, path: '/checklist/templates' },
];

export default function Sidebar({ isExpanded, isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettingsStore();

  const brandInitials = settings.systemTitle
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const userInitials = settings.inspectorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isActive = (path: string) => {
    if (path === '/checklist') return location.pathname === '/checklist';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`app-sidebar ${isExpanded ? 'expanded' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon shadow-sm">{brandInitials}</div>
        <div className="sidebar-brand-text">
          <h1>{settings.systemTitle}</h1>
          <span>{settings.systemSubtitle}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">เมนูหลัก</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => {
              navigate(item.path);
              if (isExpanded) onToggle(); // Close drawer on navigate
            }}
            title={!isExpanded ? item.label : undefined}
          >
            <item.icon size={22} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '16px' }}>ระบบ</div>
        <button
          className={`sidebar-nav-item ${isActive('/checklist/settings') ? 'active' : ''}`}
          onClick={() => {
            navigate('/checklist/settings');
            if (isExpanded) onToggle();
          }}
          title={!isExpanded ? 'ตั้งค่า' : undefined}
        >
          <Settings size={22} className="nav-icon" />
          <span className="nav-label">ตั้งค่า</span>
        </button>

        <button
          className={`sidebar-nav-item ${isActive('/checklist/help') ? 'active' : ''}`}
          onClick={() => {
            navigate('/checklist/help');
            if (isExpanded) onToggle();
          }}
          title={!isExpanded ? 'Help' : undefined}
        >
          <BookOpen size={22} className="nav-icon" />
          <span className="nav-label">คู่มือการใช้งาน</span>
        </button>
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {settings.signature ? (
              <img src={settings.signature} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : userInitials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{settings.inspectorName}</div>
            <div className="sidebar-user-role">{settings.inspectorId}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
