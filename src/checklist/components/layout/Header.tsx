// ==============================
// Checklist Sub-Navigation Header
// Clean, Sleek Top Navigation Bar
// ==============================

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Cpu,
  FileText,
  Settings,
  BookOpen,
  Search,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'แดชบอร์ด', icon: LayoutDashboard, path: '/checklist' },
  { label: 'การตรวจสอบ', icon: ClipboardCheck, path: '/checklist/inspect' },
  { label: 'เครื่องจักร', icon: Cpu, path: '/checklist/machines' },
  { label: 'แม่แบบ', icon: FileText, path: '/checklist/templates' },
  { label: 'ตั้งค่า', icon: Settings, path: '/checklist/settings' },
  { label: 'คู่มือ', icon: BookOpen, path: '/checklist/help' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/checklist') return location.pathname === '/checklist';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-[64px] z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 h-14">
        {/* Sub-Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Search Input */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative w-48 lg:w-60">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเครื่องจักร/รายการ..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white shadow-2xs"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
