import { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Database, 
  Cpu, 
  Info, 
  Save, 
  Download, 
  Trash2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import SignaturePad from '../components/common/SignaturePad';

export default function Settings() {
  const { settings, updateSettings, exportAllData, resetAllData } = useSettingsStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = () => {
    setSuccessMsg('บันทึกการตั้งค่าสำเร็จ!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleReset = () => {
    if (confirm('คำเตือน: การกระทำนี้จะลบข้อมูลทั้งหมด (การตรวจสอบ, แม่แบบ, เครื่องจักร) คุณแน่ใจหรือไม่?')) {
      resetAllData();
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">การตั้งค่า</h1>
          <p className="page-subtitle">จัดการการตั้งค่าอุปกรณ์และโปรไฟล์วิศวกร</p>
        </div>
        <div className="flex items-center gap-md">
          {successMsg && (
            <span className="flex items-center gap-xs text-sm text-green animate-fade-in" style={{ color: 'var(--accent-green)' }}>
              <CheckCircle2 size={16} /> {successMsg}
            </span>
          )}
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} /> บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* User Profile */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-md">
              <div className="sidebar-brand-icon" style={{ background: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' }}>
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold">โปรไฟล์วิศวกร</h3>
                <p className="text-xs text-tertiary">ข้อมูลผู้ตรวจสอบและลายเซ็น</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              <div className="form-group">
                <label className="form-label">ชื่อ - นามสกุล</label>
                <input 
                  className="form-input" 
                  value={settings.inspectorName} 
                  onChange={(e) => updateSettings({ inspectorName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">รหัสพนักงาน</label>
                <input 
                  className="form-input" 
                  value={settings.inspectorId} 
                  onChange={(e) => updateSettings({ inspectorId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ลายเซ็นเริ่มต้น</label>
                <SignaturePad 
                  value={settings.signature || undefined} 
                  onChange={(base64) => updateSettings({ signature: base64 })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Industrial Config */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-md">
              <div className="sidebar-brand-icon" style={{ background: 'var(--accent-amber-soft)', color: 'var(--accent-amber)' }}>
                <SettingsIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold">การตั้งค่าระบบ</h3>
                <p className="text-xs text-tertiary">ตั้งค่าเกณฑ์คะแนนและระบบ</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              <div className="form-group">
                <label className="form-label">ชื่อระบบ (แถบด้านข้าง)</label>
                <input 
                  className="form-input" 
                  value={settings.systemTitle} 
                  onChange={(e) => updateSettings({ systemTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">คำอธิบายระบบ</label>
                <input 
                  className="form-input" 
                  value={settings.systemSubtitle} 
                  onChange={(e) => updateSettings({ systemSubtitle: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="form-label text-xs">เกณฑ์การเตือน (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={settings.scoreThresholds.warning} 
                    onChange={(e) => updateSettings({ scoreThresholds: { ...settings.scoreThresholds, warning: Number(e.target.value) }})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">เกณฑ์วิกฤต (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={settings.scoreThresholds.critical} 
                    onChange={(e) => updateSettings({ scoreThresholds: { ...settings.scoreThresholds, critical: Number(e.target.value) }})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-md">
              <div className="sidebar-brand-icon" style={{ background: 'var(--accent-green-soft)', color: 'var(--accent-green)' }}>
                <Database size={20} />
              </div>
              <div>
                <h3 className="font-bold">การจัดการข้อมูล</h3>
                <p className="text-xs text-tertiary">สำรองข้อมูลและล้างระบบ</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              <p className="text-sm text-secondary">
                ดาวน์โหลดข้อมูลทั้งหมดในระบบเป็นไฟล์ JSON เพื่อนำไปส่งต่อหรือสำรองข้อมูล
              </p>
              <button className="btn btn-ghost" onClick={exportAllData}>
                <Download size={18} /> ส่งออกข้อมูล (JSON)
              </button>
              
              <div style={{ borderTop: '1px solid var(--border-default)', margin: 'var(--space-md) 0', paddingTop: 'var(--space-md)' }}>
                <h4 className="text-xs font-bold text-red mb-sm" style={{ color: 'var(--accent-red)' }}>DANGER ZONE</h4>
                <p className="text-xs text-tertiary mb-md">การรีเซ็ตจะลบข้อมูลทั้งหมดและไม่สามารถกู้คืนได้</p>
                <button className="btn btn-ghost" style={{ borderColor: 'var(--accent-red-soft)', color: 'var(--accent-red)' }} onClick={handleReset}>
                  <Trash2 size={18} /> รีเซ็ตข้อมูลระบบทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-md">
              <div className="sidebar-brand-icon" style={{ background: 'var(--accent-purple-soft)', color: 'var(--accent-purple)' }}>
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-bold">ข้อมูลแอปพลิเคชัน</h3>
                <p className="text-xs text-tertiary">รายละเอียดเวอร์ชัน</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">เวอร์ชันแอป</span>
                <span className="font-mono">1.2.0-industrial</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">ระบบจัดเก็บข้อมูล</span>
                <span className="font-mono">LocalStorage (Active)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">อัปเดตล่าสุด</span>
                <span className="font-mono">2026-04-21</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-xl);
        }
        @media (max-width: 900px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
