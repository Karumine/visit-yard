// ==============================
// Template List Page
// ==============================

import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  MoreVertical,
  Trash2,
  Copy,
  Edit3,
  Search,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTemplateStore } from '../store/useTemplateStore';

export default function TemplateList() {
  const navigate = useNavigate();
  const { templates, createBlankTemplate, deleteTemplate } = useTemplateStore();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (menuOpen) setMenuOpen(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [menuOpen]);

  const filteredTemplates = templates.filter(
    t => t.name.toLowerCase().includes(search.toLowerCase()) ||
         t.machineType.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const newTemplate = createBlankTemplate();
    navigate(`/checklist/templates/${newTemplate.id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('ต้องการลบแม่แบบนี้หรือไม่?')) {
      deleteTemplate(id);
    }
    setMenuOpen(null);
  };

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">แม่แบบ</h1>
          <p className="page-subtitle">จัดการแบบฟอร์ม Checklist สำหรับเครื่องจักรต่างๆ</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={18} />
          สร้างแม่แบบ
        </button>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: 'var(--space-lg)' }}>
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="ค้นหาแม่แบบ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>ไม่พบแม่แบบ</h3>
          <p>สร้างแม่แบบแรกของคุณเพื่อเริ่มต้นสร้างแบบฟอร์มตรวจสอบ</p>
          <button className="btn btn-primary mt-lg" onClick={handleCreate}>
            <Plus size={18} />
            สร้างแม่แบบ
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
          {filteredTemplates.map((template) => (
            <div key={template.id} className="card card-interactive" style={{ cursor: 'pointer', position: 'relative', zIndex: menuOpen === template.id ? 10 : 1, overflow: menuOpen === template.id ? 'visible' : 'hidden' }}>
              <div className="card-body" onClick={() => navigate(`/checklist/templates/${template.id}`)}>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--accent-blue-soft), var(--accent-purple-soft))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={22} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`badge ${template.isActive ? 'badge-green' : 'badge-default'}`}>
                      {template.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                    <span className="badge badge-default">v{template.version}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: '4px', lineHeight: 1.3 }}>
                  {template.name}
                </h3>
                <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-md)', lineHeight: 1.4 }}>
                  {template.description || 'ไม่มีคำอธิบาย'}
                </p>

                <div className="flex items-center gap-lg text-xs text-tertiary">
                  <span>{template.sections.length} หมวดหมู่</span>
                  <span>{template.fields.length} รายการ</span>
                  <span>{template.machineType || 'ไม่ได้กำหนด'}</span>
                </div>
              </div>

              <div className="card-footer">
                <span className="text-xs text-tertiary">
                  อัปเดตเมื่อ {new Date(template.updatedAt).toLocaleDateString('th-TH')}
                </span>
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                  <button
                    className="btn btn-icon btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === template.id ? null : template.id);
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen === template.id && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 50,
                        minWidth: '160px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        className="sidebar-nav-item"
                        style={{ borderRadius: 0, fontSize: 'var(--font-size-sm)' }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/checklist/templates/${template.id}`); setMenuOpen(null); }}
                      >
                        <Edit3 size={16} /> แก้ไข
                      </button>
                      <button
                        className="sidebar-nav-item"
                        style={{ borderRadius: 0, fontSize: 'var(--font-size-sm)' }}
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(null); }}
                      >
                        <Copy size={16} /> ทำซ้ำ
                      </button>
                      <button
                        className="sidebar-nav-item"
                        style={{ borderRadius: 0, fontSize: 'var(--font-size-sm)', color: 'var(--accent-red)' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                      >
                        <Trash2 size={16} /> ลบ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
