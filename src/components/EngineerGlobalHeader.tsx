import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ClipboardCheck, 
  LayoutDashboard, 
  BookOpen, 
  Plus, 
  Wifi, 
  WifiOff, 
  Wrench,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../lib/store';

export default function EngineerGlobalHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline, createNewReport } = useAppStore();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleCreateVisitYard = () => {
    createNewReport();
    navigate('/visit-yard');
  };

  const handleCreateChecklist = () => {
    navigate('/checklist/inspect');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Portal Title */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    ENGINEER SUITE
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                    Hub
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  ระบบรวมศูนย์วิศวกรภาคสนาม (Yard & Checklist)
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Engineer Hub</span>
            </Link>

            <Link
              to="/visit-yard"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/visit-yard')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Visit Yard</span>
            </Link>

            <Link
              to="/checklist"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/checklist')
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Checklist System</span>
            </Link>

            <Link
              to="/manual"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/manual')
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>คู่มือวิศวกร</span>
            </Link>
          </nav>

          {/* Actions & Connection Badge */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions Dropdown / Buttons */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={handleCreateVisitYard}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                title="สร้างรายงานเข้าตรวจแปลงใหม่"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Visit Yard</span>
              </button>
              <button
                onClick={handleCreateChecklist}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                title="เริ่มทำรายการ Checklist ใหม่"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Checklist</span>
              </button>
            </div>

            {/* Offline/Online Indicator */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Online Sync</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offline Ready</span>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 text-xs">
          <Link
            to="/"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Hub</span>
          </Link>
          <Link
            to="/visit-yard"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/visit-yard') ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Visit Yard</span>
          </Link>
          <Link
            to="/checklist"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/checklist') ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Checklist</span>
          </Link>
          <Link
            to="/manual"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/manual') ? 'text-purple-600 font-bold' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คู่มือ</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
