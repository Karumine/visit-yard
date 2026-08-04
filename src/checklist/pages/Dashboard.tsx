// ==============================
// Dashboard Page
// ==============================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  FileText,
  Plus,
} from 'lucide-react';
import { useInspectionStore } from '../store/useInspectionStore';
import { useMachineStore } from '../store/useMachineStore';
import { useTemplateStore } from '../store/useTemplateStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { inspections } = useInspectionStore();
  const { machines } = useMachineStore();
  const { templates } = useTemplateStore();

  const stats = useMemo(() => {
    const completed = inspections.filter(i => i.status === 'completed').length;
    const inProgress = inspections.filter(i => i.status === 'in_progress').length;
    const failItems = inspections.reduce((acc, i) => {
      return acc + i.values.filter(v => v.value === 'NG' || v.value === 'fail' || v.value === 'Overload').length;
    }, 0);
    const activeMachines = machines.filter(m => m.status === 'active').length;
    const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;

    return { completed, inProgress, failItems, activeMachines, maintenanceMachines, totalTemplates: templates.length };
  }, [inspections, machines, templates]);

  const recentInspections = useMemo(() => {
    return [...inspections]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 5);
  }, [inspections]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="badge badge-green"><CheckCircle2 size={12} /> เสร็จสิ้น</span>;
      case 'in_progress': return <span className="badge badge-blue"><Clock size={12} /> กำลังดำเนินการ</span>;
      case 'draft': return <span className="badge badge-default">ร่าง</span>;
      case 'approved': return <span className="badge badge-purple"><CheckCircle2 size={12} /> อนุมัติแล้ว</span>;
      default: return <span className="badge badge-default">{status}</span>;
    }
  };

  const getMachineName = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine?.name || machineId;
  };

  return (
    <div className="animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">แดชบอร์ด</h1>
          <p className="page-subtitle">ภาพรวมการตรวจสอบเครื่องจักร</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/checklist/inspect')}>
          <Plus size={18} />
          เริ่มการตรวจใหม่
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-green)' }}>
          <div className="flex items-center justify-between">
            <CheckCircle2 size={24} style={{ color: 'var(--accent-green)' }} />
            <span className="stat-card-trend up"><TrendingUp size={14} /> +12%</span>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{stats.completed}</div>
          <div className="stat-card-label">ตรวจสอบเสร็จสิ้น</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
          <div className="flex items-center justify-between">
            <Clock size={24} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.inProgress}</div>
          <div className="stat-card-label">กำลังดำเนินการ</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-red)' }}>
          <div className="flex items-center justify-between">
            <AlertTriangle size={24} style={{ color: 'var(--accent-red)' }} />
          </div>
          <div className="stat-card-value" style={{ color: 'var(--accent-red)' }}>{stats.failItems}</div>
          <div className="stat-card-label">รายการที่ไม่ผ่าน</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-cyan)' }}>
          <div className="flex items-center justify-between">
            <Cpu size={24} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div className="stat-card-value" style={{ color: 'var(--accent-cyan)' }}>
            {stats.activeMachines}
            {stats.maintenanceMachines > 0 && (
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-amber)', marginLeft: '8px' }}>
                +{stats.maintenanceMachines} กำลังซ่อมบำรุง
              </span>
            )}
          </div>
          <div className="stat-card-label">เครื่องจักรที่พร้อมใช้งาน</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        {/* Recent Inspections */}
        <div className="card">
          <div className="card-header">
            <span className="font-semibold">การตรวจสอบล่าสุด</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/checklist/inspect')}>
              ดูทั้งหมด <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentInspections.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <ClipboardCheck size={40} />
                <h3>ยังไม่มีการตรวจสอบ</h3>
                <p>เริ่มการตรวจสอบครั้งแรกเพื่อดูผลที่นี่</p>
              </div>
            ) : (
              <div>
                {recentInspections.map((insp) => (
                  <div
                    key={insp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-md) var(--space-lg)',
                      borderBottom: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => {
                      if (insp.status === 'in_progress') navigate(`/checklist/inspect/${insp.id}`);
                    }}
                  >
                    <div>
                      <div className="font-semibold text-sm">{getMachineName(insp.machineId)}</div>
                      <div className="text-xs text-tertiary">{new Date(insp.startedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    {getStatusBadge(insp.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Machine Overview */}
        <div className="card">
          <div className="card-header">
            <span className="font-semibold">เครื่องจักร</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/checklist/machines')}>
              จัดการ <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {machines.map((machine) => (
              <div
                key={machine.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-md) var(--space-lg)',
                  borderBottom: '1px solid var(--border-default)',
                }}
              >
                <div className="flex items-center gap-md">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: machine.status === 'active' ? 'var(--accent-green-soft)' : 'var(--accent-amber-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Cpu size={18} style={{ color: machine.status === 'active' ? 'var(--accent-green)' : 'var(--accent-amber)' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{machine.name}</div>
                    <div className="text-xs text-tertiary">{machine.location}</div>
                  </div>
                </div>
                <span className={`badge ${machine.status === 'active' ? 'badge-green' : machine.status === 'maintenance' ? 'badge-amber' : 'badge-default'}`}>
                  {machine.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Overview */}
      <div className="card">
        <div className="card-header">
          <span className="font-semibold">
            <FileText size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            แม่แบบการตรวจสอบ ({stats.totalTemplates})
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/checklist/templates')}>
            จัดการ <ArrowRight size={14} />
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ชื่อแม่แบบ</th>
                <th>ประเภทเครื่องจักร</th>
                <th>จำนวนฟิลด์</th>
                <th>เวอร์ชั่น</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tmpl) => (
                <tr key={tmpl.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/checklist/templates/${tmpl.id}`)}>
                  <td className="font-semibold">{tmpl.name}</td>
                  <td className="text-secondary">{tmpl.machineType}</td>
                  <td>{tmpl.fields.length} ฟิลด์</td>
                  <td><span className="badge badge-default">v{tmpl.version}</span></td>
                  <td>
                    <span className={`badge ${tmpl.isActive ? 'badge-green' : 'badge-default'}`}>
                      {tmpl.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
