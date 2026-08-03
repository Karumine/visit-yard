# รายงานการเข้าเยี่ยม ลูกค้า/Yard — Visit Report App

เว็บแอปสำหรับให้วิศวกร/เจ้าหน้าที่สินเชื่อกรอก "รายงานการเข้าเยี่ยม ลูกค้า/Yard" ขณะอยู่หน้างานจริง ใช้งานบน iPad ได้ทั้ง online และ offline

## 🚀 วิธี Build & Run

```bash
# ติดตั้ง dependencies
npm install

# เปิด dev server
npm run dev

# Build สำหรับ production
npm run build

# Preview production build
npm run preview
```

## 📱 วิธีติดตั้งลง iPad

1. เปิด **Safari** บน iPad
2. เข้าเว็บแอปที่ deploy แล้ว (หรือ URL ของ dev server ในเครือข่ายเดียวกัน)
3. แตะปุ่ม **แชร์** (ไอคอนกล่องลูกศรชี้ขึ้น) ที่แถบเครื่องมือ Safari
4. เลื่อนลงแล้วแตะ **"เพิ่มไปยังหน้าจอโฮม"**
5. ตั้งชื่อ (หรือใช้ชื่อเริ่มต้น "Visit Yard") แล้วแตะ **เพิ่ม**
6. เปิดแอปจากหน้า Home Screen ได้เลย — ทำงานได้แม้ไม่มีอินเทอร์เน็ต

## 🔧 Tech Stack

- **React + TypeScript + Vite** — SPA framework
- **Tailwind CSS** — Styling
- **Dexie.js** (IndexedDB) — เก็บข้อมูลในเครื่อง
- **jsPDF** — สร้าง PDF
- **SheetJS** — Export Excel
- **signature_pad** — ลายเซ็นดิจิทัล
- **Zustand** — State management
- **vite-plugin-pwa** — PWA support

## 📋 Features

- ✅ กรอกรายงานแบบ 6 ขั้นตอน (Wizard)
- ✅ ถ่ายรูป/เลือกรูปจากอัลบั้ม (ย่อรูปอัตโนมัติ)
- ✅ บันทึกอัตโนมัติทุก 3 วินาที
- ✅ ทำงาน offline ได้ 100%
- ✅ ออก PDF (A4)
- ✅ Export Excel / JSON
- ✅ Import JSON กลับเข้ามา
- ✅ ลายเซ็นดิจิทัล
- ✅ คะแนนความน่าสนใจ 0–10
- ✅ ข้อมูลตัวอย่าง (sample data)
- ✅ รองรับ iPad ทั้งแนวตั้งและแนวนอน

## 📂 โครงสร้างโปรเจกต์

```
src/
├── types/          # TypeScript types
├── lib/            # Core utilities (storage, pdf, image, etc.)
├── components/     # Reusable UI components
│   └── wizard/     # Wizard step components
├── screens/        # Main screens (Home, Wizard)
├── data/           # Sample data
├── App.tsx         # Root component
└── main.tsx        # Entry point
```
