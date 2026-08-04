import { BookOpen, LayoutDashboard, FileText, ClipboardCheck, Cpu, Settings } from 'lucide-react';

export default function Help() {
  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">คู่มือการใช้งาน</h1>
          <p className="page-subtitle">วิธีการใช้งานระบบตรวจสอบ (Checklist)</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card-header">
          <div className="flex items-center gap-md">
            <div className="sidebar-brand-icon" style={{ background: 'var(--accent-blue-soft)', color: 'var(--accent-blue)' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-bold">บทนำ</h3>
              <p className="text-xs text-tertiary">เกี่ยวกับระบบ</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <p className="text-secondary leading-relaxed">
            ยินดีต้อนรับสู่ <strong>ระบบตรวจสอบ (Checklist)</strong> ระบบนี้ถูกออกแบบมาเพื่อช่วยให้คุณสามารถจัดการการตรวจสอบเครื่องจักร อุปกรณ์ และสร้างแบบฟอร์มการตรวจเช็คได้อย่างเป็นระบบ ง่ายต่อการติดตามและออกรายงาน
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-md mt-xl" style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>🌟 ส่วนประกอบหลักของระบบ</h2>
      <div className="settings-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm mb-sm font-bold" style={{ marginBottom: 'var(--space-sm)' }}>
              <LayoutDashboard style={{ color: 'var(--accent-blue)' }} size={20}/> 1. หน้าภาพรวม
            </div>
            <p className="text-sm text-secondary">หน้าจอสรุปภาพรวมของการตรวจสอบทั้งหมด เช่น จำนวนที่ตรวจสอบแล้ว, จำนวนที่ยังค้างอยู่ หรือรายการที่พบปัญหา</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm mb-sm font-bold" style={{ marginBottom: 'var(--space-sm)' }}>
              <FileText style={{ color: 'var(--accent-amber)' }} size={20}/> 2. จัดการแบบฟอร์ม
            </div>
            <p className="text-sm text-secondary">เมนูสำหรับ สร้าง แก้ไข และจัดการแบบฟอร์มเช็คลิสต์ ที่ใช้เป็นเกณฑ์ในการตรวจสอบ</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm mb-sm font-bold" style={{ marginBottom: 'var(--space-sm)' }}>
              <ClipboardCheck style={{ color: 'var(--accent-green)' }} size={20}/> 3. เริ่มตรวจสอบ
            </div>
            <p className="text-sm text-secondary">เมนูหลักสำหรับปฏิบัติงาน เพื่อเลือกแบบฟอร์มและเครื่องจักรที่ต้องการลงพื้นที่ตรวจสอบ</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm mb-sm font-bold" style={{ marginBottom: 'var(--space-sm)' }}>
              <Cpu style={{ color: 'var(--accent-purple)' }} size={20}/> 4. จัดการเครื่องจักร
            </div>
            <p className="text-sm text-secondary">เมนูสำหรับ เพิ่ม แก้ไข และจัดการรายชื่อเครื่องจักรหรืออุปกรณ์ทั้งหมดที่มีในระบบ</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-sm mb-sm font-bold" style={{ marginBottom: 'var(--space-sm)' }}>
              <Settings className="text-tertiary" size={20}/> 5. ตั้งค่าระบบ
            </div>
            <p className="text-sm text-secondary">เมนูสำหรับการตั้งค่าการทำงานทั่วไปของระบบและผู้ใช้งาน</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-md mt-xl" style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>🚀 ขั้นตอนการทำงานเบื้องต้น</h2>
      
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-body">
          <h3 className="font-bold text-lg mb-sm" style={{ marginBottom: 'var(--space-sm)' }}>ขั้นตอนที่ 1: การเพิ่มข้อมูลเครื่องจักร</h3>
          <p className="text-sm text-secondary mb-sm" style={{ marginBottom: 'var(--space-sm)' }}>ก่อนที่จะเริ่มตรวจสอบได้ คุณต้องมีรายชื่อเครื่องจักรในระบบเสียก่อน</p>
          <ol style={{ paddingLeft: 'var(--space-xl)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '4px' }}>ไปที่เมนู <strong>จัดการเครื่องจักร</strong></li>
            <li style={{ marginBottom: '4px' }}>คลิกปุ่ม <strong>"เพิ่มเครื่องจักร"</strong></li>
            <li style={{ marginBottom: '4px' }}>กรอกข้อมูลเครื่องจักร เช่น ชื่อเครื่องจักร รหัสเครื่องจักร แผนกที่รับผิดชอบ ฯลฯ</li>
            <li style={{ marginBottom: '4px' }}>กด <strong>"บันทึก"</strong> เพื่อเพิ่มข้อมูลเข้าสู่ระบบ</li>
          </ol>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-body">
          <h3 className="font-bold text-lg mb-sm" style={{ marginBottom: 'var(--space-sm)' }}>ขั้นตอนที่ 2: การสร้างแบบฟอร์มเช็คลิสต์</h3>
          <ol style={{ paddingLeft: 'var(--space-xl)', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            <li style={{ marginBottom: '4px' }}>ไปที่เมนู <strong>จัดการแบบฟอร์ม</strong></li>
            <li style={{ marginBottom: '4px' }}>คลิกปุ่ม <strong>"สร้างแม่แบบ"</strong></li>
            <li style={{ marginBottom: '4px' }}>ตั้งชื่อแบบฟอร์ม (เช่น "แบบฟอร์มตรวจเช็ครายวัน รถปั๊มน้ำ")</li>
            <li style={{ marginBottom: '4px' }}>เพิ่มหัวข้อการตรวจสอบ โดยคุณสามารถเลือกรูปแบบคำตอบได้ เช่น แบบผ่าน/ไม่ผ่าน, แบบเลือกตอบ, แบบพิมพ์ข้อความ</li>
            <li style={{ marginBottom: '4px' }}>ตรวจสอบความถูกต้องและกด <strong>"บันทึก"</strong></li>
          </ol>
          <div style={{ padding: 'var(--space-md)', borderRadius: '6px', backgroundColor: 'var(--accent-amber-soft)', color: 'var(--accent-amber)', fontSize: '0.875rem', border: '1px solid currentColor' }}>
            <strong>💡 เคล็ดลับ:</strong> คุณสามารถสร้างแบบฟอร์มเพียงครั้งเดียว และนำไปใช้ตรวจสอบกับเครื่องจักรหลายๆ ตัวได้ ไม่จำเป็นต้องสร้างใหม่ทุกครั้ง
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-body">
          <h3 className="font-bold text-lg mb-sm" style={{ marginBottom: 'var(--space-sm)' }}>ขั้นตอนที่ 3: การลงพื้นที่ตรวจสอบ</h3>
          <p className="text-sm text-secondary mb-sm" style={{ marginBottom: 'var(--space-sm)' }}>เมื่อถึงเวลาปฏิบัติงานตรวจเช็ค ให้ทำตามขั้นตอนนี้:</p>
          <ol style={{ paddingLeft: 'var(--space-xl)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '4px' }}>ไปที่เมนู <strong>เริ่มตรวจสอบ</strong></li>
            <li style={{ marginBottom: '4px' }}>ระบบจะให้คุณเลือก <strong>แบบฟอร์มที่จะใช้</strong> และเลือก <strong>เครื่องจักรที่จะไปตรวจ</strong></li>
            <li style={{ marginBottom: '4px' }}>เมื่อเลือกเสร็จสิ้น ระบบจะพาเข้าสู่หน้า <strong>แบบฟอร์มการตรวจสอบ</strong></li>
            <li style={{ marginBottom: '4px' }}>ดำเนินการตรวจสอบตามหัวข้อในหน้าจอ: ติ๊กเลือกผลการตรวจสอบ (ผ่าน หรือ ไม่ผ่าน) และระบุหมายเหตุหากพบปัญหา</li>
            <li style={{ marginBottom: '4px' }}>เมื่อตรวจสอบครบทุกข้อแล้ว ให้กดปุ่ม <strong>"ส่งข้อมูล"</strong> เพื่อส่งผลการตรวจสอบ</li>
          </ol>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-body">
          <h3 className="font-bold text-lg mb-sm" style={{ marginBottom: 'var(--space-sm)' }}>ขั้นตอนที่ 4: การติดตามผลและรายงาน</h3>
          <ol style={{ paddingLeft: 'var(--space-xl)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '4px' }}>ไปที่เมนู <strong>หน้าภาพรวม</strong></li>
            <li style={{ marginBottom: '4px' }}>คุณสามารถดูสรุปผลการตรวจสอบประจำวัน ประจำสัปดาห์ หรือประจำเดือนได้</li>
            <li style={{ marginBottom: '4px' }}>หากมีเครื่องจักรตัวไหนที่ตรวจสอบแล้วพบสถานะ <strong>"ไม่ผ่าน"</strong> ระบบจะเน้นสีให้เห็นชัดเจน เพื่อให้ผู้ที่เกี่ยวข้องเข้าไปแก้ไขต่อไป</li>
          </ol>
        </div>
      </div>

      <div style={{ padding: 'var(--space-md)', borderRadius: '6px', backgroundColor: 'var(--accent-blue-soft)', color: 'var(--accent-blue)', fontSize: '0.875rem', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>📌 คำแนะนำเพิ่มเติม:</strong>
        <ul style={{ paddingLeft: 'var(--space-xl)', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '4px' }}>หากคุณต้องการแก้ไขข้อมูลในภายหลัง สามารถเข้าไปที่เมนู <strong>จัดการแบบฟอร์ม</strong> หรือ <strong>จัดการเครื่องจักร</strong> เพื่อทำการอัปเดตข้อมูลได้ตลอดเวลา</li>
          <li style={{ marginBottom: '4px' }}>ตรวจสอบให้แน่ใจว่าได้กดปุ่ม <strong>"บันทึก"</strong> หรือ <strong>"ส่งข้อมูล"</strong> ทุกครั้งที่ทำงานเสร็จ เพื่อป้องกันข้อมูลสูญหาย</li>
        </ul>
      </div>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-md);
        }
      `}</style>
    </div>
  );
}
