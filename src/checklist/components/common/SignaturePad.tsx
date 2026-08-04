import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, RotateCcw, Save, PenTool } from 'lucide-react';

interface SignaturePadProps {
  value: string | undefined;
  onChange: (base64: string) => void;
  disabled?: boolean;
}

export default function SignaturePad({ value, onChange, disabled }: SignaturePadProps) {
  const [showModal, setShowModal] = useState(false);
  const sigPadRef = useRef<SignatureCanvas | null>(null);

  const handleSave = () => {
    if (sigPadRef.current) {
      if (sigPadRef.current.isEmpty()) {
        alert('กรุณาเซ็นชื่อก่อนบันทึก');
        return;
      }
      const base64 = sigPadRef.current.getCanvas().toDataURL('image/png');
      onChange(base64);
      setShowModal(false);
    }
  };

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  return (
    <div className="signature-container">
      {value ? (
        <div 
          className="signature-preview shadow-sm"
          onClick={() => !disabled && setShowModal(true)}
          style={{ cursor: disabled ? 'default' : 'pointer' }}
        >
          <img src={value} alt="Signature" style={{ maxHeight: '100px', maxWidth: '100%' }} />
          {!disabled && <span className="signature-edit-hint">แตะเพื่อเซ็นชื่อใหม่</span>}
        </div>
      ) : (
        <button 
          className="signature-placeholder"
          onClick={() => !disabled && setShowModal(true)}
          disabled={disabled}
        >
          <PenTool size={24} style={{ color: 'var(--text-tertiary)' }} />
          <span>แตะเพื่อเซ็นชื่อ</span>
        </button>
      )}

      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={() => setShowModal(false)}>
          <div className="modal modal-lg animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title flex items-center gap-sm">
                <PenTool size={18} />
                ลายเซ็นวิศวกร (Signature)
              </span>
              <button className="btn btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ background: '#f8fafc', padding: 'var(--space-lg)' }}>
              <div className="signature-pad-wrapper-active shadow-inner">
                <SignatureCanvas 
                  ref={sigPadRef}
                  penColor="navy"
                  canvasProps={{
                    className: 'signature-canvas',
                    style: { width: '100%', height: '300px' }
                  }}
                />
              </div>
              <p className="text-xs text-secondary mt-md text-center">
                ใช้เมาส์หรือนิ้วมือเพื่อวาดลายเซ็นภายในกรอบ
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={handleClear}>
                <RotateCcw size={18} /> ล้าง
              </button>
              <div className="flex gap-sm">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={18} /> บันทึกลายเซ็น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .signature-container {
          width: 100%;
        }
        .signature-preview {
          background: white;
          border: 2px solid var(--border-default);
          border-radius: var(--radius-md);
          min-height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-md);
          position: relative;
          transition: all var(--transition-fast);
        }
        .signature-preview:hover {
          border-color: var(--accent-blue);
          background: var(--bg-hover);
        }
        .signature-edit-hint {
          position: absolute;
          bottom: 4px;
          right: 8px;
          font-size: 10px;
          color: var(--text-tertiary);
        }
        .signature-placeholder {
          width: 100%;
          height: 120px;
          background: var(--bg-elevated);
          border: 2px dashed var(--border-default);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .signature-placeholder:hover {
          background: var(--bg-hover);
          border-color: var(--accent-blue);
          color: var(--accent-blue);
        }
        .signature-pad-wrapper-active {
          background: white;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-default);
        }
        .signature-canvas {
          cursor: crosshair;
        }
      `}</style>
    </div>
  );
}
