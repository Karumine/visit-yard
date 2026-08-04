// ==============================
// Machine List Page
// ==============================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Plus,
  Search,
  MapPin,
  Edit3,
  Trash2,
  X,
  Save,
  Wrench,
  History as HistoryIcon,
  Clock,
} from 'lucide-react';
import { useMachineStore } from '../store/useMachineStore';
import { useTemplateStore } from '../store/useTemplateStore';
import { useInspectionStore } from '../store/useInspectionStore';
import type { Machine } from '../types/machine';

export default function MachineList() {
  const navigate = useNavigate();
  const { machines, addMachine, updateMachine, deleteMachine } = useMachineStore();
  const { templates } = useTemplateStore();
  const { inspections } = useInspectionStore();
  const [search, setSearch] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7d' | '30d' | 'overdue'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Machine['status']>('all');
  const [showForm, setShowForm] = useState(false);
  const [historyMachineId, setHistoryMachineId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Machine>>({
    name: '', type: '', machineNo: '', location: '', projectName: '',
    brand: '', serialNumber: '', status: 'active', assignedTemplateId: '',
  });

  const getMachineStats = (machineId: string) => {
    const machineInspections = inspections.filter(i => i.machineId === machineId && i.status === 'completed');
    const visitCount = machineInspections.length;
    const lastVisit = machineInspections.length > 0 
      ? new Date(Math.max(...machineInspections.map(i => new Date(i.completedAt || i.startedAt || '').getTime())))
      : null;
    return { visitCount, lastVisit };
  };

  const filteredMachines = machines.filter(m => {
    const stats = getMachineStats(m.id);
    
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase()) ||
      m.machineNo.toLowerCase().includes(search.toLowerCase());
    
    let matchesPeriod = true;
    if (filterPeriod === '7d') {
      matchesPeriod = !!stats.lastVisit && (new Date().getTime() - stats.lastVisit.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    } else if (filterPeriod === '30d') {
      matchesPeriod = !!stats.lastVisit && (new Date().getTime() - stats.lastVisit.getTime()) <= 30 * 24 * 60 * 60 * 1000;
    } else if (filterPeriod === 'overdue') {
      matchesPeriod = !stats.lastVisit || (new Date().getTime() - stats.lastVisit.getTime()) > 30 * 24 * 60 * 60 * 1000;
    }

    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    
    return matchesSearch && matchesPeriod && matchesStatus;
  });

  const handleSave = () => {
    if (!form.name || !form.type || !form.machineNo) return;
    if (editingId) {
      updateMachine(editingId, form);
    } else {
      addMachine(form as Omit<Machine, 'id'>);
    }
    resetForm();
  };

  const handleEdit = (machine: Machine) => {
    setForm({ ...machine });
    setEditingId(machine.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('ต้องการลบเครื่องจักรนี้หรือไม่?')) {
      deleteMachine(id);
    }
  };

  const resetForm = () => {
    setForm({ name: '', type: '', machineNo: '', location: '', projectName: '', brand: '', serialNumber: '', status: 'active', assignedTemplateId: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--accent-green)';
      case 'maintenance': return 'var(--accent-amber)';
      case 'inactive': return 'var(--text-tertiary)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">เครื่องจักร</h1>
          <p className="page-subtitle">จัดการเครื่องจักรและอุปกรณ์ทั้งหมด</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={18} />
          เพิ่มเครื่องจักร
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="ค้นหาเครื่องจักร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="form-input form-select" 
          style={{ width: 'auto', minWidth: '160px' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="active">พร้อมใช้งาน</option>
          <option value="maintenance">ซ่อมบำรุง</option>
          <option value="inactive">ไม่ใช้งาน</option>
        </select>

        <select 
          className="form-input form-select" 
          style={{ width: 'auto', minWidth: '180px' }}
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value as any)}
        >
          <option value="all">ทุกเวลา</option>
          <option value="7d">ตรวจสอบ (7 วันล่าสุด)</option>
          <option value="30d">ตรวจสอบ (30 วันล่าสุด)</option>
          <option value="overdue">เกินกำหนด (&gt; 30 วัน)</option>
        </select>
      </div>

      {/* Machine Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>เครื่องจักร</th>
                <th>ประเภท</th>
                <th>สถานที่</th>
                <th>โครงการ</th>
                <th>จำนวนครั้ง</th>
                <th>ตรวจสอบล่าสุด</th>
                <th>สถานะ</th>
                <th style={{ width: '120px' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map(machine => {
                const template = machine.assignedTemplateId
                  ? templates.find(t => t.id === machine.assignedTemplateId)
                  : null;
                const { visitCount, lastVisit } = getMachineStats(machine.id);
                return (
                  <tr key={machine.id}>
                    <td>
                      <div className="flex items-center gap-md">
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            background: `${getStatusColor(machine.status)}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Cpu size={18} style={{ color: getStatusColor(machine.status) }} />
                        </div>
                        <div>
                          <div className="font-semibold">{machine.name}</div>
                          <div className="text-xs text-tertiary">
                            {machine.brand && `${machine.brand} · `}{machine.machineNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-secondary">{machine.type}</td>
                    <td>
                      <div className="flex items-center gap-xs text-sm">
                        <MapPin size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                        {machine.location}
                      </div>
                    </td>
                    <td className="text-sm">{machine.projectName}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold">{visitCount}</span>
                        <span className="text-xs text-tertiary">ครั้ง</span>
                      </div>
                    </td>
                    <td>
                      {lastVisit ? (
                        <div className="flex flex-col">
                          <span className="text-sm">{lastVisit.toLocaleDateString('th-TH')}</span>
                          <span className="text-xs text-tertiary">
                            {Math.floor((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))} วันที่ผ่านมา
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-tertiary">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${machine.status === 'active' ? 'badge-green' : machine.status === 'maintenance' ? 'badge-amber' : 'badge-default'}`}>
                        {machine.status === 'maintenance' && <Wrench size={12} />}
                        {machine.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-xs">
                        <button className="btn btn-icon btn-sm" onClick={() => handleEdit(machine)} title="แก้ไข">
                          <Edit3 size={16} />
                        </button>
                        <button className="btn btn-icon btn-sm" style={{ color: 'var(--accent-blue)' }} onClick={() => setHistoryMachineId(machine.id)} title="ประวัติ">
                          <HistoryIcon size={16} />
                        </button>
                        <button className="btn btn-icon btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(machine.id)} title="ลบ">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMachines.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Cpu size={40} />
                      <h3>ไม่พบเครื่องจักร</h3>
                      <p>เพิ่มเครื่องจักรแรกของคุณเพื่อเริ่มต้น</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingId ? 'แก้ไขเครื่องจักร' : 'เพิ่มเครื่องจักรใหม่'}</span>
              <button className="btn btn-icon" onClick={resetForm}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">ชื่อ <span className="required">*</span></label>
                  <input className="form-input" value={form.name || ''} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. เครื่องเป่าขวด A" />
                </div>
                <div className="form-group">
                  <label className="form-label">ประเภท <span className="required">*</span></label>
                  <input className="form-input" value={form.type || ''} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} placeholder="e.g. เครื่องเป่าขวด" />
                </div>
                <div className="form-group">
                  <label className="form-label">หมายเลขเครื่อง <span className="required">*</span></label>
                  <input className="form-input" value={form.machineNo || ''} onChange={(e) => setForm(p => ({ ...p, machineNo: e.target.value }))} placeholder="e.g. A, B, INV-01" />
                </div>
                <div className="form-group">
                  <label className="form-label">สถานที่</label>
                  <input className="form-input" value={form.location || ''} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. อาคาร A ชั้น 2" />
                </div>
                <div className="form-group">
                  <label className="form-label">ชื่อโครงการ</label>
                  <input className="form-input" value={form.projectName || ''} onChange={(e) => setForm(p => ({ ...p, projectName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">ยี่ห้อ</label>
                  <input className="form-input" value={form.brand || ''} onChange={(e) => setForm(p => ({ ...p, brand: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">ซีเรียลนัมเบอร์</label>
                  <input className="form-input" value={form.serialNumber || ''} onChange={(e) => setForm(p => ({ ...p, serialNumber: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">สถานะ</label>
                  <select className="form-input form-select" value={form.status || 'active'} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as Machine['status'] }))}>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">กำหนดแม่แบบ</label>
                  <select className="form-input form-select" value={form.assignedTemplateId || ''} onChange={(e) => setForm(p => ({ ...p, assignedTemplateId: e.target.value }))}>
                    <option value="">-- ไม่มีแม่แบบ --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">หมายเหตุ</label>
                  <textarea className="form-input form-textarea" value={form.notes || ''} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={resetForm}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.name || !form.type || !form.machineNo}>
                <Save size={18} /> {editingId ? 'อัปเดต' : 'เพิ่มเครื่องจักร'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyMachineId && (
        <MachineHistoryModal 
          machineId={historyMachineId} 
          onClose={() => setHistoryMachineId(null)} 
        />
      )}
    </div>
  );
}

// ==============================
// Machine History Modal Component
// ==============================
function MachineHistoryModal({ machineId, onClose }: { machineId: string, onClose: () => void }) {
  const navigate = useNavigate();
  const { machines } = useMachineStore();
  const { inspections } = useInspectionStore();
  const { templates } = useTemplateStore();
  
  const machine = machines.find(m => m.id === machineId);
  const machineInspections = inspections
    .filter(i => i.machineId === machineId && i.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime());

  if (!machine) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-md">
            <div className="sidebar-brand-icon" style={{ background: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' }}>
              <HistoryIcon size={20} />
            </div>
            <div>
              <span className="modal-title">ประวัติการตรวจสอบ: {machine.name}</span>
              <div className="text-xs text-tertiary">{machine.machineNo} · {machine.type}</div>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body" style={{ padding: 0 }}>
          {machineInspections.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-2xl)' }}>
              <Clock size={40} />
              <h3>ไม่มีประวัติการตรวจสอบ</h3>
              <p>เครื่องจักรนี้ยังไม่เคยได้รับการตรวจสอบ</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>วันและเวลา</th>
                  <th>ผู้ตรวจสอบ</th>
                  <th>คะแนน</th>
                  <th>ผลลัพธ์</th>
                  <th style={{ width: '100px' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {machineInspections.map(insp => {
                  const template = templates.find(t => t.id === insp.templateId);
                  let actualScore = 0;
                  let maxScore = 0;

                  if (template) {
                    template.fields.forEach(f => {
                      if (f.maxScore) {
                        maxScore += f.maxScore;
                        const val = insp.values.find(v => v.fieldId === f.id);
                        if (val && typeof val.value === 'number') {
                          actualScore += val.value;
                        }
                      }
                    });
                  }

                  const scorePercent = maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : null;
                  const passCount = insp.values.filter(v => v.value === 'OK' || v.value === 'pass').length;
                  const failCount = insp.values.filter(v => v.value === 'NG' || v.value === 'fail' || v.value === 'Overload').length;
                  
                  return (
                    <tr key={insp.id}>
                      <td>
                        <div className="font-semibold text-sm">
                          {new Date(insp.completedAt || insp.startedAt).toLocaleDateString('th-TH', { 
                            day: 'numeric', month: 'short', year: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-tertiary">
                          {new Date(insp.completedAt || insp.startedAt).toLocaleTimeString('th-TH', { 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="text-sm">{insp.inspectorName}</td>
                      <td>
                        {scorePercent !== null ? (
                          <div className="flex flex-col">
                            <span className="font-bold" style={{ color: scorePercent >= 80 ? 'var(--accent-green)' : scorePercent >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                              {scorePercent}%
                            </span>
                            <span className="text-xs text-tertiary">{actualScore}/{maxScore} pts</span>
                          </div>
                        ) : (
                          <span className="text-xs text-tertiary">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-xs">
                          {passCount > 0 && <span className="badge badge-green">{passCount} P</span>}
                          {failCount > 0 && <span className="badge badge-red">{failCount} F</span>}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/checklist/inspect/${insp.id}`)}
                        >
                          รายละเอียด
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>ปิดประวัติ</button>
        </div>
      </div>
    </div>
  );
}
