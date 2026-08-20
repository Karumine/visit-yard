// ==============================
// Inspection Select Page — Choose machine to inspect
// ==============================

import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  ClipboardCheck,
  MapPin,
  Calendar,
  ArrowRight,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { useTemplateStore } from '../store/useTemplateStore';
import { useInspectionStore } from '../store/useInspectionStore';

export default function InspectionSelect() {
  const navigate = useNavigate();
  const { machines } = useMachineStore();
  const { getTemplate } = useTemplateStore();
  const { createInspection, inspections } = useInspectionStore();
  const [search, setSearch] = useState('');

  const filteredMachines = machines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.type.toLowerCase().includes(search.toLowerCase()) ||
    m.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartInspection = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine || !machine.assignedTemplateId) return;

    const template = getTemplate(machine.assignedTemplateId);
    if (!template) return;

    // Check if there's already an in-progress inspection
    const existing = inspections.find(
      i => i.machineId === machineId && i.status === 'in_progress'
    );

    if (existing) {
      navigate(`/checklist/inspect/${existing.id}`);
      return;
    }

    const newInspection = createInspection(
      template.id,
      template.version,
      machineId,
      'วิศวกร สมชาย',
      template // Pass snapshot
    );
    navigate(`/checklist/inspect/${newInspection.id}`);
  };

  const getInProgressCount = (machineId: string) => {
    return inspections.filter(i => i.machineId === machineId && i.status === 'in_progress').length;
  };

  const getLastInspection = (machineId: string) => {
    const completed = inspections
      .filter(i => i.machineId === machineId && i.status === 'completed')
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return completed[0];
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">เริ่มการตรวจสอบ</h1>
          <p className="page-subtitle">เลือกเครื่องจักรที่ต้องการตรวจสอบ</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: 'var(--space-lg)', maxWidth: '100%' }}>
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="ค้นหาเครื่องจักรจากชื่อ, ประเภท หรือสถานที่..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 'none' }}
        />
      </div>

      {/* Active / Maintenance Groups */}
      {['active', 'maintenance'].map(status => {
        const group = filteredMachines.filter(m => m.status === status);
        if (group.length === 0) return null;
        return (
          <div key={status} style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-md)' }}>
              <span className={`badge ${status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                {status === 'active' ? 'พร้อมใช้งาน' : 'ซ่อมบำรุง'}
              </span>
              <span className="text-sm text-tertiary">{group.length} เครื่อง</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-md)' }}>
              {group.map(machine => {
                const template = machine.assignedTemplateId ? getTemplate(machine.assignedTemplateId) : null;
                const inProgress = getInProgressCount(machine.id);
                const lastInspection = getLastInspection(machine.id);

                return (
                  <div key={machine.id} className="card card-interactive" style={{ cursor: 'pointer' }}>
                    <div className="card-body" onClick={() => handleStartInspection(machine.id)}>
                      <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-md)' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-md)',
                            background: status === 'active'
                              ? 'linear-gradient(135deg, var(--accent-green-soft), var(--accent-cyan-soft))'
                              : 'linear-gradient(135deg, var(--accent-amber-soft), var(--accent-red-soft))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Cpu size={24} style={{ color: status === 'active' ? 'var(--accent-green)' : 'var(--accent-amber)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{machine.name}</h3>
                          <div className="text-xs text-tertiary">{machine.type} · {machine.machineNo}</div>
                        </div>
                        {inProgress > 0 && (
                          <span className="badge badge-blue">
                            <ClipboardCheck size={12} /> กำลังดำเนินการ
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-xs text-sm text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                        <div className="flex items-center gap-sm">
                          <MapPin size={14} /> {machine.location}
                        </div>
                        {machine.brand && (
                          <div className="flex items-center gap-sm">
                            <span style={{ width: '14px', textAlign: 'center', fontSize: '12px' }}>🏭</span>
                            {machine.brand} {machine.serialNumber && `· ${machine.serialNumber}`}
                          </div>
                        )}
                        {(machine.contractNo || machine.registrationNo) && (
                          <div className="flex items-center gap-sm text-xs text-tertiary">
                            <span style={{ width: '14px', textAlign: 'center', fontSize: '12px' }}>📜</span>
                            {machine.contractNo && `สัญญา: ${machine.contractNo}`} {machine.registrationNo && `· ทะเบียน: ${machine.registrationNo}`}
                          </div>
                        )}
                        {lastInspection && (
                          <div className="flex items-center gap-sm">
                            <Calendar size={14} />
                            ล่าสุด: {new Date(lastInspection.startedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {!template ? (
                        <div className="flex items-center gap-sm text-xs" style={{ color: 'var(--accent-amber)' }}>
                          <AlertTriangle size={14} /> ยังไม่ได้กำหนดแม่แบบ
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-tertiary">{template.name}</span>
                          <ArrowRight size={16} style={{ color: 'var(--accent-blue)' }} />
                        </div>
                      )}

                      {machine.notes && (
                        <div
                          style={{
                            marginTop: 'var(--space-sm)',
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'var(--accent-amber-soft)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--accent-amber)',
                          }}
                        >
                          ⚠️ {machine.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
