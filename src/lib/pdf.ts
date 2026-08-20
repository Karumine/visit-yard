// ==========================================
// PDF Export — html2canvas + jsPDF (1-Page A4 Thai PDF)
// ==========================================
import html2canvas from 'html2canvas';
import type { VisitReport } from '../types/report';
import { toThaiDateFull } from './thaidate';
import { calculateAverageScore } from '../types/report';

/** Convert Photo object or Blob to Data URL */
function photoToDataUrl(p: any): Promise<string> {
  return new Promise((resolve) => {
    if (!p) {
      resolve('');
      return;
    }
    if (typeof p === 'string') {
      resolve(p);
      return;
    }
    if (p.url) {
      resolve(p.url);
      return;
    }
    if (p.blobBase64) {
      resolve(p.blobBase64);
      return;
    }
    if (p.blob instanceof Blob) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(p.blob);
        return;
      } catch {
        resolve('');
        return;
      }
    }
    resolve('');
  });
}

/** Generate high-resolution HTML Canvas for 1-Page A4 PDF */
export async function generatePDFCanvas(report: VisitReport): Promise<HTMLCanvasElement> {
  // Convert photo blobs to data URLs
  const machinePhotoUrls = await Promise.all(
    (report.machinePhotos || []).map(async (p: any) => ({
      url: await photoToDataUrl(p),
      label: p.category || 'รูปภาพเครื่องจักร',
      caption: p.caption || '',
    }))
  );
  const sitePhotoUrls = await Promise.all(
    (report.sitePhotos || []).map(async (p: any) => ({
      url: await photoToDataUrl(p),
      label: p.category || 'รูปภาพหน้างาน',
      caption: p.caption || '',
    }))
  );
  const allPhotoItems = [...machinePhotoUrls, ...sitePhotoUrls].filter((p) => p.url);

  const validContacts = (report.contacts || []).filter((c) => c.name && c.name.trim());
  const obs = report.observations;
  const scores = report.scores;
  const avg = calculateAverageScore(scores);
  const approvals = report.approvals || {};

  // Create temporary container for HTML rendering
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  const appendixPages = allPhotoItems.length > 0 ? Math.ceil(allPhotoItems.length / 9) : 0;
  container.style.height = `${1123 * (1 + appendixPages)}px`;
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Sarabun', 'Prompt', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  container.style.padding = '18px 22px';
  container.style.boxSizing = 'border-box';
  container.style.lineHeight = '1.35';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <!-- HEADER -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1B3A5F; padding-bottom: 6px; margin-bottom: 8px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="/Logo_Agile Assets_CMYK.png" style="height: 34px; object-fit: contain;" onerror="this.src='/logo.png'" />
        <div>
          <div style="font-size: 16px; font-weight: bold; color: #1B3A5F; line-height: 1.2;">รายงานการเข้าเยี่ยม ลูกค้า/Yard</div>
          <div style="font-size: 10px; color: #64748b;">Agile Assets — Customer/Yard Visit Report</div>
        </div>
      </div>
      <div style="text-align: right; font-size: 10.5px; color: #334155; line-height: 1.4;">
        <div><strong style="color: #1B3A5F;">วันที่เข้าเยี่ยม:</strong> ${toThaiDateFull(report.visitDate)}</div>
        <div><strong style="color: #1B3A5F;">ครั้งที่:</strong> ${report.visitNo}</div>
      </div>
    </div>

    <!-- SECTION 1: ข้อมูลทั่วไป -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      1. ข้อมูลทั่วไป (General Information)
    </div>
    <div style="border: 1px solid #cbd5e1; border-radius: 2px; margin-bottom: 6px; font-size: 9.5px;">
      <!-- Row 1 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 15%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">ชื่อบริษัท:</div>
        <div style="width: 35%; padding: 3px 6px; font-weight: bold; color: #0f172a; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start; word-break: break-word;">${report.companyName || '-'}</div>
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">ประเภทลูกค้า/Yard:</div>
        <div style="width: 32%; padding: 3px 6px; display: flex; align-items: flex-start; word-break: break-word;">
          ${report.customerType === 'existing' ? 'ลูกค้าเดิม' : 'ลูกค้าใหม่'} / ${report.yardType === 'existing' ? 'Yard เดิม' : 'Yard ใหม่'}
        </div>
      </div>
      <!-- Row 2 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 15%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">ที่อยู่:</div>
        <div style="width: 85%; padding: 3px 6px; display: flex; align-items: flex-start; word-break: break-word;">${report.address || '-'}</div>
      </div>
      <!-- Row 3 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 15%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">กลุ่มเครื่องจักร:</div>
        <div style="width: 35%; padding: 3px 6px; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start; word-break: break-word;">${report.assetGroupType === 'existing' ? 'เครื่องจักรกลุ่มเดิม' : 'เครื่องจักรกลุ่มใหม่'}</div>
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">ประเภทเครื่องจักร:</div>
        <div style="width: 32%; padding: 3px 6px; display: flex; align-items: flex-start; word-break: break-word;">${report.machineType || '-'}</div>
      </div>
      <!-- Row 4 -->
      <div style="display: flex; align-items: stretch;">
        <div style="width: 15%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">ลักษณะธุรกิจ:</div>
        <div style="width: 85%; padding: 3px 6px; display: flex; align-items: flex-start; word-break: break-word;">${report.visitorBusinessNature || '-'}</div>
      </div>
    </div>

    <!-- SECTION 2: ผู้ติดต่อ & วัตถุประสงค์ -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      2. ผู้ที่ได้เข้าพบ & วัตถุประสงค์ (Contacts & Visit Purpose)
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 6px;">
      <div style="flex: 1.2; border: 1px solid #cbd5e1; border-radius: 2px; overflow: hidden;">
        <div style="display: flex; background: #DCE9F5; color: #1B3A5F; font-weight: bold; border-bottom: 1px solid #cbd5e1; font-size: 9px; align-items: center;">
          <div style="width: 40%; padding: 3px 6px; border-right: 1px solid #cbd5e1;">ชื่อผู้ติดต่อ</div>
          <div style="width: 30%; padding: 3px 6px; border-right: 1px solid #cbd5e1;">ตำแหน่ง</div>
          <div style="width: 30%; padding: 3px 6px;">เบอร์โทร</div>
        </div>
        ${validContacts.length > 0
      ? validContacts
        .map(
          (c, idx) => `
          <div style="display: flex; font-size: 9px; align-items: flex-start; ${idx < validContacts.length - 1 ? 'border-bottom: 1px solid #cbd5e1;' : ''}">
            <div style="width: 40%; padding: 3px 6px; border-right: 1px solid #cbd5e1; word-break: break-word;">${c.name}</div>
            <div style="width: 30%; padding: 3px 6px; border-right: 1px solid #cbd5e1; word-break: break-word;">${c.position || '-'}</div>
            <div style="width: 30%; padding: 3px 6px; word-break: break-word;">${c.phone || '-'}</div>
          </div>
        `
        )
        .join('')
      : `<div style="padding: 4px 6px; text-align: center; color: #94a3b8; font-size: 9px;">- ไม่ระบุ -</div>`
    }
      </div>
      <div style="flex: 1; border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 2px; font-size: 9px; background: #fafafa; word-break: break-word;">
        <div style="font-weight: bold; color: #1B3A5F; margin-bottom: 2px;">วัตถุประสงค์ในการเยี่ยม:</div>
        <div style="color: #334155;">${report.visitPurpose || '-'}</div>
      </div>
    </div>

    <!-- SECTION 3: รายละเอียดการเข้าเยี่ยม -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      3. รายละเอียดการเข้าเยี่ยม (Visit Details & Photos)
    </div>
    <div style="border: 1px solid #cbd5e1; border-radius: 2px; margin-bottom: 6px; font-size: 9px;">
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 22%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">รายละเอียดการเยี่ยม:</div>
        <div style="width: 78%; padding: 3px 6px; word-break: break-word;">${report.visitDetail || '-'}</div>
      </div>
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 22%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">ข้อมูลเครื่องจักรขอสินเชื่อ:</div>
        <div style="width: 78%; padding: 3px 6px; word-break: break-word;">${report.financedMachineInfo || '-'}</div>
      </div>
      <div style="display: flex; align-items: stretch;">
        <div style="width: 22%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">ข้อมูลลูกค้าเบื้องต้น:</div>
        <div style="width: 78%; padding: 3px 6px; word-break: break-word;">${report.customerBackground || '-'}</div>
      </div>
    </div>

    ${allPhotoItems.length > 0
      ? `
    <div style="display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;">
      ${allPhotoItems
        .slice(0, 6)
        .map(
          (p) => `
        <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px; text-align: center; background: #fff; width: 115px;">
          <img src="${p.url}" style="width: 111px; height: 58px; object-fit: cover; border-radius: 2px;" />
        </div>
      `
        )
        .join('')}
    </div>
    `
      : ''
    }

    <!-- SECTION 4: ข้อสังเกต -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      4. ข้อสังเกต (Observations)
    </div>
    <div style="border: 1px solid #cbd5e1; border-radius: 2px; margin-bottom: 6px; font-size: 9px;">
      <!-- Row 1 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">1. ประสบการณ์:</div>
        <div style="width: 32%; padding: 3px 6px; border-right: 1px solid #cbd5e1; word-break: break-word;">
          ปฏิบัติ: ${obs.experience.isOperator || '-'} | บริหาร: ${obs.experience.isExecutive || '-'}<br/>
          องค์กร: ${obs.experience.isCorporate || '-'} | ครอบครัว: ${obs.experience.isFamily || '-'}
        </div>
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">2. ทีมงาน Srv/Op:</div>
        <div style="width: 32%; padding: 3px 6px; word-break: break-word;">
          ${obs.team.main || '-'}<br/>
          Srv: ${obs.team.srvTeam || '-'} | Op: ${obs.team.opTeam || '-'}
        </div>
      </div>
      <!-- Row 2 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">3. การจัดการอะไหล่:</div>
        <div style="width: 32%; padding: 3px 6px; border-right: 1px solid #cbd5e1; word-break: break-word;">${obs.spareParts || '-'}</div>
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">4. ระบบป้องกันสูญหาย:</div>
        <div style="width: 32%; padding: 3px 6px; word-break: break-word;">${obs.theftPrevention || '-'}</div>
      </div>
      <!-- Row 3 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">5. ลักษณะลูกค้าที่มี:</div>
        <div style="width: 32%; padding: 3px 6px; border-right: 1px solid #cbd5e1; word-break: break-word;">${obs.customerCharacteristics || '-'}</div>
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">6. คู่แข่ง:</div>
        <div style="width: 32%; padding: 3px 6px; word-break: break-word;">${obs.competitors || '-'}</div>
      </div>
      <!-- Row 4 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">7. มูลค่าเครื่องจักร (ลบ.):</div>
        <div style="width: 82%; padding: 3px 6px; word-break: break-word;">
          สูงสุด: ${obs.machineValue.highest ?? '-'} | ต่ำสุด: ${obs.machineValue.lowest ?? '-'} | เฉลี่ย: ${obs.machineValue.average ?? '-'} | รวม: ${obs.machineValue.total ?? '-'} (${obs.machineValue.remark || 'ยอดขาย/ปี'})
        </div>
      </div>
      <!-- Row 5 -->
      <div style="display: flex; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 3px 6px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: flex-start;">8. อื่นๆ:</div>
        <div style="width: 82%; padding: 3px 6px; word-break: break-word;">${obs.others || '-'}</div>
      </div>
    </div>

    <!-- SECTION 5: คะแนนความน่าสนใจ -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      5. คะแนนความน่าสนใจ (Interest Scores 0–10)
    </div>
    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
      <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
        <div style="background: #DCE9F5; padding: 4px 6px; border-radius: 4px; text-align: center; border: 1px solid #bbe0f5; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="font-size: 8.5px; font-weight: bold; color: #1B3A5F; margin-bottom: 1px;">ลักษณะธุรกิจ</div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; line-height: 1;">${scores.businessNature !== null ? scores.businessNature : '-'}</div>
        </div>
        <div style="background: #DCE9F5; padding: 4px 6px; border-radius: 4px; text-align: center; border: 1px solid #bbe0f5; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="font-size: 8.5px; font-weight: bold; color: #1B3A5F; margin-bottom: 1px;">ลักษณะเจ้าของ</div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; line-height: 1;">${scores.ownerCharacter !== null ? scores.ownerCharacter : '-'}</div>
        </div>
        <div style="background: #DCE9F5; padding: 4px 6px; border-radius: 4px; text-align: center; border: 1px solid #bbe0f5; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="font-size: 8.5px; font-weight: bold; color: #1B3A5F; margin-bottom: 1px;">ฐานลูกค้า</div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; line-height: 1;">${scores.customerBase !== null ? scores.customerBase : '-'}</div>
        </div>
        <div style="background: #DCE9F5; padding: 4px 6px; border-radius: 4px; text-align: center; border: 1px solid #bbe0f5; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="font-size: 8.5px; font-weight: bold; color: #1B3A5F; margin-bottom: 1px;">ความเป็นพันธมิตร</div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; line-height: 1;">${scores.partnership !== null ? scores.partnership : '-'}</div>
        </div>
      </div>
      <div style="background: #DCE9F5; border: 2px solid #1B3A5F; color: #1B3A5F; padding: 5px 10px; border-radius: 6px; text-align: center; min-width: 90px; display: flex; flex-direction: column; justify-content: center; align-items: center; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <div style="font-size: 9.5px; font-weight: bold; color: #1B3A5F; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px;">คะแนนเฉลี่ย</div>
        <div style="font-size: 15px; font-weight: bold; line-height: 1; color: #1B3A5F;"><span style="color: #f59e0b;">⭐</span> ${avg !== null ? avg.toFixed(1) : '-'}<span style="font-size: 11px; font-weight: bold; color: #1B3A5F;">/10</span></div>
      </div>
    </div>

    <!-- SECTION 6: สรุป & ผู้ตรวจ -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      6. สรุปการดำเนินการ & ผู้รายงาน (Summary & Inspector)
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 6px;">
      <div style="flex: 2; border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 2px; font-size: 9px; background: #fafafa; word-break: break-word;">
        <div><strong>การดำเนินการถัดไป (Next Action):</strong> ${report.nextAction || '-'}</div>
        ${report.nextAppointment ? `<div style="margin-top: 2px;"><strong>วันนัดหมายครั้งถัดไป:</strong> ${toThaiDateFull(report.nextAppointment)}</div>` : ''}
      </div>
      <div style="flex: 1; border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 2px; text-align: center; background: #fff; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-weight: bold; font-size: 9px; color: #1B3A5F;">ผู้เข้าเยี่ยม/รายงาน (AA)</div>
        ${report.inspectorSignature
      ? `<img src="${report.inspectorSignature}" style="height: 26px; max-width: 100%; object-fit: contain; margin: 2px auto;" />`
      : '<div style="height: 26px;"></div>'
    }
        <div style="font-size: 9px; color: #334155; border-top: 1px dashed #cbd5e1; padding-top: 2px; word-break: break-word;">
          ${report.inspectorName || '(................................................)'}
        </div>
      </div>
    </div>

    <!-- SECTION 7: ช่องเซ็นอนุมัติ -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      7. ช่องเซ็นอนุมัติ (Inspected by)
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 6px; text-align: center; background: #fff;">
        <div style="font-weight: bold; font-size: 9px; color: #1B3A5F; margin-bottom: 2px;">Engineering Department</div>
        ${approvals.engineering?.signature
      ? `<img src="${approvals.engineering.signature}" style="height: 24px; max-width: 100%; object-fit: contain;" />`
      : '<div style="height: 24px;"></div>'
    }
        <div style="font-size: 8.5px; color: #475569; margin-top: 2px; line-height: 1.3;">ชื่อ: ${approvals.engineering?.name || '.....................................'}</div>
        <div style="font-size: 8.5px; color: #475569; margin-top: 1px; line-height: 1.3;">วันที่: ..... / ..... / ..........</div>
      </div>
      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 6px; text-align: center; background: #fff;">
        <div style="font-weight: bold; font-size: 9px; color: #1B3A5F; margin-bottom: 2px;">Credit Department</div>
        ${approvals.credit?.signature
      ? `<img src="${approvals.credit.signature}" style="height: 24px; max-width: 100%; object-fit: contain;" />`
      : '<div style="height: 24px;"></div>'
    }
        <div style="font-size: 8.5px; color: #475569; margin-top: 2px; line-height: 1.3;">ชื่อ: ${approvals.credit?.name || '.....................................'}</div>
        <div style="font-size: 8.5px; color: #475569; margin-top: 1px; line-height: 1.3;">วันที่: ..... / ..... / ..........</div>
      </div>
      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 6px; text-align: center; background: #fff;">
        <div style="font-weight: bold; font-size: 9px; color: #1B3A5F; margin-bottom: 2px;">General Manager</div>
        ${approvals.generalManager?.signature
      ? `<img src="${approvals.generalManager.signature}" style="height: 24px; max-width: 100%; object-fit: contain;" />`
      : '<div style="height: 24px;"></div>'
    }
        <div style="font-size: 8.5px; color: #475569; margin-top: 2px; line-height: 1.3;">ชื่อ: ${approvals.generalManager?.name || '.....................................'}</div>
        <div style="font-size: 8.5px; color: #475569; margin-top: 1px; line-height: 1.3;">วันที่: ..... / ..... / ..........</div>
      </div>
    </div>

    ${allPhotoItems.length > 0 ? (() => {
      const PHOTOS_PER_PAGE = 9;
      const pagesCount = Math.ceil(allPhotoItems.length / PHOTOS_PER_PAGE);
      let html = '';
      for (let pageIdx = 0; pageIdx < pagesCount; pageIdx++) {
        const pagePhotos = allPhotoItems.slice(pageIdx * PHOTOS_PER_PAGE, (pageIdx + 1) * PHOTOS_PER_PAGE);
        html += `
          <div style="margin-top: 40px; padding-top: 20px; page-break-before: always; height: 1080px; box-sizing: border-box;">
            <!-- Appendix Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1B3A5F; padding-bottom: 6px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="/Logo_Agile Assets_CMYK.png" style="height: 28px; object-fit: contain;" onerror="this.src='/logo.png'" />
                <div>
                  <div style="font-size: 14px; font-weight: bold; color: #1B3A5F; line-height: 1.2;">ภาคผนวก: รูปภาพประกอบการเข้าเยี่ยม</div>
                  <div style="font-size: 9.5px; color: #64748b;">Agile Assets — Customer/Yard Visit Report (หน้า ${pageIdx + 2})</div>
                </div>
              </div>
              <div style="text-align: right; font-size: 10px; color: #334155;">
                <div><strong style="color: #1B3A5F;">บริษัท:</strong> ${report.companyName || '-'}</div>
                <div><strong style="color: #1B3A5F;">วันที่เข้าเยี่ยม:</strong> ${toThaiDateFull(report.visitDate)}</div>
              </div>
            </div>

            <!-- 3x3 Photo Grid (9 Photos per A4 page) -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              ${pagePhotos.map((p, idx) => {
                const photoNo = pageIdx * PHOTOS_PER_PAGE + idx + 1;
                return `
                  <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #fff; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; font-weight: bold; color: #1B3A5F; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0;">
                      <span>📸 รูปที่ #${photoNo}</span>
                      <span style="font-size: 8.5px; background: #eff6ff; color: #1d4ed8; padding: 2px 5px; border-radius: 3px; border: 1px solid #bfdbfe;">${p.label || 'หลักฐาน'}</span>
                    </div>
                    <div style="height: 120px; border-radius: 4px; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0;">
                      <img src="${p.url}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    ${p.caption ? `<div style="font-size: 9.5px; color: #475569; margin-top: 6px; line-height: 1.2;">${p.caption}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }
      return html;
    })() : ''}
  `;

  document.body.appendChild(container);

  // Wait for all images inside container to finish loading
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  );

  // Short delay to ensure DOM layout rendering completes
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution (crisp text)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    return canvas;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
