// ==========================================
// TypeScript Types — รายงานการเข้าเยี่ยม ลูกค้า/Yard
// ==========================================
import { generateUUID } from '../lib/uuid';

/** ประเภทลูกค้า / Yard / กลุ่มเครื่องจักร */
export type EntityType = 'existing' | 'new';

/** สถานะรายงาน */
export type ReportStatus = 'draft' | 'completed';

/** ข้อมูลรูปภาพ */
export interface Photo {
  id: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  caption?: string;
  category?: string; // หมวดหมู่รูปภาพ (1. ป้ายทางเข้า, 2. สำนักงาน, ฯลฯ)
  takenAt: string; // ISO date
  gps?: { lat: number; lng: number };
}

/** 8 หัวข้อรูปภาพตามกำหนด */
export interface PhotoCategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const PHOTO_CATEGORIES: PhotoCategoryInfo[] = [
  { id: 'entrance_sign', name: '1. ป้ายทางเข้า', icon: '🪧', description: 'ป้ายชื่อบริษัท / ทางเข้า Yard' },
  { id: 'office', name: '2. สำนักงาน', icon: '🏢', description: 'อาคารสำนักงาน / โต๊ะทำงาน' },
  { id: 'factory', name: '3. โรงงานปฏิบัติการ', icon: '🏭', description: 'อาคารโรงงาน / สายการผลิต' },
  { id: 'workshop', name: '4. workshop พื้นที่ทำงาน', icon: '🛠️', description: 'พื้นที่ทำงานวิศวกรรม / ซ่อมบำรุง' },
  { id: 'warehouse', name: '5. โกดัง', icon: '📦', description: 'โกดังเก็บสินค้า / คลังวัตถุดิบ' },
  { id: 'shipping', name: '6. รับส่งสินค้า', icon: '🚚', description: 'จุดโหลดสินค้า / ลานรับส่ง' },
  { id: 'team', name: '7. ทีมงาน', icon: '👥', description: 'ทีมวิศวกร / ผู้บริหาร / พนักงาน' },
  { id: 'brochure', name: '8. โบชัว', icon: '📄', description: 'เอกสารประชาสัมพันธ์ / แคตตาล็อก' },
];

/** ผู้ติดต่อ (ลูกค้า/Yard) */
export interface Contact {
  name: string;
  phone: string;
  position: string;
}

/** คะแนนความน่าสนใจ 4 หัวข้อ */
export interface Scores {
  businessNature: number | null;    // ลักษณะธุรกิจ
  ownerCharacter: number | null;    // ลักษณะเจ้าของ
  customerBase: number | null;      // ฐานลูกค้า
  partnership: number | null;       // ความเป็นพันธมิตร
}

/** ข้อสังเกต — ประสบการณ์ */
export interface ExperienceObservation {
  isOperator: string;      // เป็นผู้ปฏิบัติ
  isExecutive: string;     // เป็นผู้บริหาร
  isCorporate: string;     // ธุรกิจองค์กร
  isFamily: string;        // ธุรกิจครอบครัว
}

/** ข้อสังเกต — ทีมงาน */
export interface TeamObservation {
  main: string;
  srvTeam: string;   // Srv. Team
  opTeam: string;    // Op. Team
}

/** ข้อสังเกต — มูลค่าเครื่องจักร */
export interface MachineValue {
  highest: number | null;     // สูงสุด (ล้านบาท)
  lowest: number | null;      // ต่ำสุด (ล้านบาท)
  average: number | null;     // เฉลี่ย (คำนวณอัตโนมัติ แก้ทับได้)
  total: number | null;       // ทั้งระบบ
  remark: string;             // หมายเหตุ (ค่าเริ่มต้น "เป็นยอดขาย/ปี")
}

/** ข้อสังเกต 8 หัวข้อ */
export interface Observations {
  experience: ExperienceObservation;
  team: TeamObservation;
  spareParts: string;           // การจัดการอะไหล่
  theftPrevention: string;      // ระบบการป้องกันการสูญหาย
  customerCharacteristics: string; // ลักษณะลูกค้าที่มี
  machineValue: MachineValue;   // มูลค่าของเครื่องจักร
  competitors: string;          // คู่แข่ง
  others: string;               // อื่นๆ
}

/** ลายเซ็นอนุมัติ */
export interface Approval {
  signature?: string;  // base64 PNG data URL
  name?: string;
  date?: string;       // ISO date
}

/** ช่องเซ็นอนุมัติ 3 ช่อง */
export interface Approvals {
  engineering: Approval;
  credit: Approval;
  generalManager: Approval;
}

/** ไฟล์แนบ */
export interface Attachment {
  id: string;
  name: string;
  blob: Blob;
  type: string;
}

/** รายงานการเข้าเยี่ยม — โครงสร้างข้อมูลหลัก */
export interface VisitReport {
  // ระบบ
  id: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;

  // 4.1 ส่วนหัว
  visitDate: string;           // ISO date
  visitNo: number;
  customerType: EntityType;
  yardType: EntityType;
  companyName: string;
  address: string;
  assetGroupType: EntityType;
  machineType: string;
  visitorBusinessNature: string;

  // 4.2 ผู้ที่ได้เข้าพบ
  contacts: Contact[];

  // 4.3 เนื้อหาการเยี่ยม
  visitPurpose: string;
  visitDetail: string;
  financedMachineInfo: string;
  machinePhotos: Photo[];
  customerBackground: string;
  sitePhotos: Photo[];

  // 4.4 ข้อสังเกต
  observations: Observations;

  // 4.5 คะแนนความน่าสนใจ
  scores: Scores;

  // 4.6 ปิดท้าย
  nextAction: string;
  nextAppointment: string;    // ISO date (ว่างได้)
  hasAttachment: boolean;
  attachments: Attachment[];
  inspectorName: string;
  inspectorSignature?: string; // base64 PNG data URL

  // 4.7 ช่องเซ็นอนุมัติ
  approvals: Approvals;
}

/** ค่าเริ่มต้นสำหรับรายงานใหม่ */
export function createEmptyReport(): VisitReport {
  const now = new Date().toISOString();
  return {
    id: generateUUID(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    visitDate: now,
    visitNo: 1,
    customerType: 'existing',
    yardType: 'existing',
    companyName: '',
    address: '',
    assetGroupType: 'existing',
    machineType: '',
    visitorBusinessNature: '',
    contacts: [
      { name: '', phone: '', position: '' },
      { name: '', phone: '', position: '' },
      { name: '', phone: '', position: '' },
    ],
    visitPurpose: '',
    visitDetail: '',
    financedMachineInfo: '',
    machinePhotos: [],
    customerBackground: '',
    sitePhotos: [],
    observations: {
      experience: { isOperator: '', isExecutive: '', isCorporate: '', isFamily: '' },
      team: { main: '', srvTeam: '', opTeam: '' },
      spareParts: '',
      theftPrevention: '',
      customerCharacteristics: '',
      machineValue: {
        highest: null,
        lowest: null,
        average: null,
        total: null,
        remark: 'เป็นยอดขาย/ปี',
      },
      competitors: '',
      others: '',
    },
    scores: {
      businessNature: null,
      ownerCharacter: null,
      customerBase: null,
      partnership: null,
    },
    nextAction: '',
    nextAppointment: '',
    hasAttachment: false,
    attachments: [],
    inspectorName: '',
    inspectorSignature: undefined,
    approvals: {
      engineering: {},
      credit: {},
      generalManager: {},
    },
  };
}

/** Helper: คำนวณคะแนนเฉลี่ย */
export function calculateAverageScore(scores: Scores): number | null {
  const vals = [scores.businessNature, scores.ownerCharacter, scores.customerBase, scores.partnership];
  const valid = vals.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}
