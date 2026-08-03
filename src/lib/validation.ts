// ==========================================
// Validation — Zod-like validation for report completion
// ==========================================
import type { VisitReport } from '../types/report';

export interface ValidationError {
  field: string;
  message: string;
  step: number; // wizard step (1-6)
}

/** ตรวจสอบข้อมูลก่อน "บันทึกเป็นเสร็จสิ้น" */
export function validateForCompletion(report: VisitReport): ValidationError[] {
  const errors: ValidationError[] = [];

  // visitDate
  if (!report.visitDate) {
    errors.push({ field: 'visitDate', message: 'กรุณาระบุวันที่เข้าเยี่ยม', step: 1 });
  }

  // companyName
  if (!report.companyName.trim()) {
    errors.push({ field: 'companyName', message: 'กรุณาระบุชื่อบริษัท', step: 1 });
  }

  // ผู้ติดต่ออย่างน้อย 1 คน
  const hasContact = report.contacts.some(c => c.name.trim() !== '');
  if (!hasContact) {
    errors.push({ field: 'contacts', message: 'กรุณาระบุผู้ที่ได้เข้าพบอย่างน้อย 1 คน', step: 2 });
  }

  // visitPurpose
  if (!report.visitPurpose.trim()) {
    errors.push({ field: 'visitPurpose', message: 'กรุณาระบุวัตถุประสงค์ในการเยี่ยม', step: 2 });
  }

  // รูปอย่างน้อย 1 รูป
  const totalPhotos = report.machinePhotos.length + report.sitePhotos.length;
  if (totalPhotos === 0) {
    errors.push({ field: 'photos', message: 'กรุณาถ่ายรูปอย่างน้อย 1 รูป', step: 3 });
  }

  // คะแนนครบ 4 ข้อ
  const { businessNature, ownerCharacter, customerBase, partnership } = report.scores;
  if (businessNature === null) errors.push({ field: 'scores.businessNature', message: 'กรุณาให้คะแนน "ลักษณะธุรกิจ"', step: 5 });
  if (ownerCharacter === null) errors.push({ field: 'scores.ownerCharacter', message: 'กรุณาให้คะแนน "ลักษณะเจ้าของ"', step: 5 });
  if (customerBase === null) errors.push({ field: 'scores.customerBase', message: 'กรุณาให้คะแนน "ฐานลูกค้า"', step: 5 });
  if (partnership === null) errors.push({ field: 'scores.partnership', message: 'กรุณาให้คะแนน "ความเป็นพันธมิตร"', step: 5 });

  return errors;
}

/** ตรวจว่า step ที่กำหนดกรอกครบหรือยัง */
export function isStepComplete(report: VisitReport, step: number): boolean {
  switch (step) {
    case 1:
      return !!(report.visitDate && report.companyName.trim());
    case 2:
      return report.contacts.some(c => c.name.trim()) && !!report.visitPurpose.trim();
    case 3:
      return !!(report.visitDetail.trim() || report.machinePhotos.length > 0 || report.sitePhotos.length > 0);
    case 4:
      return !!(
        report.observations.experience.isOperator ||
        report.observations.team.main ||
        report.observations.spareParts ||
        report.observations.machineValue.highest !== null
      );
    case 5:
      return (
        report.scores.businessNature !== null &&
        report.scores.ownerCharacter !== null &&
        report.scores.customerBase !== null &&
        report.scores.partnership !== null
      );
    case 6:
      return !!report.inspectorName.trim();
    default:
      return false;
  }
}
