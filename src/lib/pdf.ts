// ==========================================
// PDF Export — html2canvas + jsPDF (1-Page A4 Thai PDF)
// ==========================================
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { VisitReport } from '../types/report';
import { toThaiDateShort, toThaiDateFull } from './thaidate';
import { calculateAverageScore } from '../types/report';

/** Convert Blob to Data URL */
function photoToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    if (!blob) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(blob);
  });
}

/** Generate high-resolution HTML Canvas for 1-Page A4 PDF */
export async function generatePDFCanvas(report: VisitReport): Promise<HTMLCanvasElement> {
  // Convert photo blobs to data URLs
  const machinePhotoUrls = await Promise.all(
    (report.machinePhotos || []).map(async (p) => ({
      url: await photoToDataUrl(p.blob),
      label: 'เครื่องจักร',
      caption: p.caption,
    }))
  );
  const sitePhotoUrls = await Promise.all(
    (report.sitePhotos || []).map(async (p) => ({
      url: await photoToDataUrl(p.blob),
      label: 'สถานที่/Yard',
      caption: p.caption,
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
  container.style.height = '1123px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Sarabun', 'Prompt', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  container.style.padding = '18px 22px';
  container.style.boxSizing = 'border-box';
  container.style.fontSize = '9.5px';
  container.style.lineHeight = '1.3';
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
        <div style="width: 15%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">ชื่อบริษัท:</div>
        <div style="width: 35%; padding: 3px 5px; font-weight: bold; color: #0f172a; border-right: 1px solid #cbd5e1; display: flex; align-items: center; word-break: break-word;">${report.companyName || '-'}</div>
        <div style="width: 18%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">ประเภทลูกค้า/Yard:</div>
        <div style="width: 32%; padding: 3px 5px; display: flex; align-items: center; word-break: break-word;">
          ${report.customerType === 'existing' ? 'ลูกค้าเดิม' : 'ลูกค้าใหม่'} / ${report.yardType === 'existing' ? 'Yard เดิม' : 'Yard ใหม่'}
        </div>
      </div>
      <!-- Row 2 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 15%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">ที่อยู่:</div>
        <div style="width: 85%; padding: 3px 5px; display: flex; align-items: center; word-break: break-word;">${report.address || '-'}</div>
      </div>
      <!-- Row 3 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 15%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">กลุ่มเครื่องจักร:</div>
        <div style="width: 35%; padding: 3px 5px; border-right: 1px solid #cbd5e1; display: flex; align-items: center; word-break: break-word;">${report.assetGroupType === 'existing' ? 'เครื่องจักรกลุ่มเดิม' : 'เครื่องจักรกลุ่มใหม่'}</div>
        <div style="width: 18%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">ประเภทเครื่องจักร:</div>
        <div style="width: 32%; padding: 3px 5px; display: flex; align-items: center; word-break: break-word;">${report.machineType || '-'}</div>
      </div>
      <!-- Row 4 -->
      <div style="display: flex; align-items: stretch;">
        <div style="width: 15%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">ลักษณะธุรกิจ:</div>
        <div style="width: 85%; padding: 3px 5px; display: flex; align-items: center; word-break: break-word;">${report.visitorBusinessNature || '-'}</div>
      </div>
    </div>

    <!-- SECTION 2: ผู้ติดต่อ & วัตถุประสงค์ -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      2. ผู้ที่ได้เข้าพบ & วัตถุประสงค์ (Contacts & Visit Purpose)
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 6px;">
      <div style="flex: 1.2; border: 1px solid #cbd5e1; border-radius: 2px; overflow: hidden;">
        <div style="display: flex; background: #DCE9F5; color: #1B3A5F; font-weight: bold; border-bottom: 1px solid #cbd5e1; font-size: 9px;">
          <div style="width: 40%; padding: 2px 5px; border-right: 1px solid #cbd5e1;">ชื่อผู้ติดต่อ</div>
          <div style="width: 30%; padding: 2px 5px; border-right: 1px solid #cbd5e1;">ตำแหน่ง</div>
          <div style="width: 30%; padding: 2px 5px;">เบอร์โทร</div>
        </div>
        ${
          validContacts.length > 0
            ? validContacts
                .map(
                  (c, idx) => `
          <div style="display: flex; font-size: 9px; ${idx < validContacts.length - 1 ? 'border-bottom: 1px solid #cbd5e1;' : ''}">
            <div style="width: 40%; padding: 2px 5px; border-right: 1px solid #cbd5e1; word-break: break-word;">${c.name}</div>
            <div style="width: 30%; padding: 2px 5px; border-right: 1px solid #cbd5e1; word-break: break-word;">${c.position || '-'}</div>
            <div style="width: 30%; padding: 2px 5px; word-break: break-word;">${c.phone || '-'}</div>
          </div>
        `
                )
                .join('')
            : `<div style="padding: 4px 5px; text-align: center; color: #94a3b8; font-size: 9px;">- ไม่ระบุ -</div>`
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
        <div style="width: 22%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">รายละเอียดการเยี่ยม:</div>
        <div style="width: 78%; padding: 3px 5px; word-break: break-word;">${report.visitDetail || '-'}</div>
      </div>
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 22%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">ข้อมูลเครื่องจักรขอสินเชื่อ:</div>
        <div style="width: 78%; padding: 3px 5px; word-break: break-word;">${report.financedMachineInfo || '-'}</div>
      </div>
      <div style="display: flex; align-items: stretch;">
        <div style="width: 22%; background: #f1f5f9; padding: 3px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">ข้อมูลลูกค้าเบื้องต้น:</div>
        <div style="width: 78%; padding: 3px 5px; word-break: break-word;">${report.customerBackground || '-'}</div>
      </div>
    </div>

    ${
      allPhotoItems.length > 0
        ? `
    <div style="display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;">
      ${allPhotoItems
        .slice(0, 6)
        .map(
          (p) => `
        <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px; text-align: center; background: #fff; width: 115px;">
          <img src="${p.url}" style="width: 111px; height: 55px; object-fit: cover; border-radius: 2px;" />
          <div style="font-size: 8px; color: #475569; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.label}${p.caption ? ': ' + p.caption : ''}</div>
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
        <div style="width: 18%; background: #f1f5f9; padding: 2.5px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">1. ประสบการณ์:</div>
        <div style="width: 32%; padding: 2.5px 5px; border-right: 1px solid #cbd5e1; word-break: break-word;">
          ปฏิบัติ: ${obs.experience.isOperator || '-'} | บริหาร: ${obs.experience.isExecutive || '-'}<br/>
          องค์กร: ${obs.experience.isCorporate || '-'} | ครอบครัว: ${obs.experience.isFamily || '-'}
        </div>
        <div style="width: 18%; background: #f1f5f9; padding: 2.5px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">2. ทีมงาน Srv/Op:</div>
        <div style="width: 32%; padding: 2.5px 5px; word-break: break-word;">
          ${obs.team.main || '-'}<br/>
          Srv: ${obs.team.srvTeam || '-'} | Op: ${obs.team.opTeam || '-'}
        </div>
      </div>
      <!-- Row 2 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 2.5px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">3. การจัดการอะไหล่:</div>
        <div style="width: 32%; padding: 2.5px 5px; border-right: 1px solid #cbd5e1; word-break: break-word;">${obs.spareParts || '-'}</div>
        <div style="width: 18%; background: #f1f5f9; padding: 2.5px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">4. ระบบป้องกันสูญหาย:</div>
        <div style="width: 32%; padding: 2.5px 5px; word-break: break-word;">${obs.theftPrevention || '-'}</div>
      </div>
      <!-- Row 3 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 2.5px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">5. ลักษณะลูกค้าที่มี:</div>
        <div style="width: 32%; padding: 2.5px 5px; border-right: 1px solid #cbd5e1; word-break: break-word;">${obs.customerCharacteristics || '-'}</div>
        <div style="width: 18%; background: #f1f5f9; padding: 2.5px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">6. คู่แข่ง:</div>
        <div style="width: 32%; padding: 2.5px 5px; word-break: break-word;">${obs.competitors || '-'}</div>
      </div>
      <!-- Row 4 -->
      <div style="display: flex; border-bottom: 1px solid #cbd5e1; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 2.5px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">7. มูลค่าเครื่องจักร (ลบ.):</div>
        <div style="width: 82%; padding: 2.5px 5px; word-break: break-word;">
          สูงสุด: ${obs.machineValue.highest ?? '-'} | ต่ำสุด: ${obs.machineValue.lowest ?? '-'} | เฉลี่ย: ${obs.machineValue.average ?? '-'} | รวม: ${obs.machineValue.total ?? '-'} (${obs.machineValue.remark || 'ยอดขาย/ปี'})
        </div>
      </div>
      <!-- Row 5 -->
      <div style="display: flex; align-items: stretch;">
        <div style="width: 18%; background: #f1f5f9; padding: 2.5px 5px; font-weight: bold; color: #1e293b; border-right: 1px solid #cbd5e1; display: flex; align-items: center;">8. อื่นๆ:</div>
        <div style="width: 82%; padding: 2.5px 5px; word-break: break-word;">${obs.others || '-'}</div>
      </div>
    </div>

    <!-- SECTION 5: คะแนนความน่าสนใจ -->
    <div style="background-color: #1B3A5F; color: white; padding: 3px 8px; font-weight: bold; font-size: 10.5px; margin-bottom: 4px; border-radius: 2px;">
      5. คะแนนความน่าสนใจ (Interest Scores 0–10)
    </div>
    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
      <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
        <div style="background: #DCE9F5; padding: 4px 6px; border-radius: 4px; text-align: center; border: 1px solid #bbe0f5;">
          <div style="font-size: 8.5px; font-weight: bold; color: #1B3A5F;">ลักษณะธุรกิจ</div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a;">${scores.businessNature !== null ? scores.businessNature : '-'}</div>
        </div>
        <div style="background: #DCE9F5; padding: 4px 6px; border-radius: 4px; text-align: center; border: 1px solid #bbe0f5;">
          <div style="font-size: 8.5px; font-weight: bold; color: #1B3A5F;">ลักษณะเจ้าของ</div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a;">${scores.ownerCharacter !== null ? scores.ownerCharacter : '-'}</div>
        </div>
        <div style="background: #DCE9F5; padding: 4px 6px; border-radius: 4px; text-align: center; border: 1px solid #bbe0f5;">
          <div style="font-size: 8.5px; font-weight: bold; color: #1B3A5F;">ฐานลูกค้า</div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a;">${scores.customerBase !== null ? scores.customerBase : '-'}</div>
        </div>
        <div style="background: #DCE9F5; padding: 4px 6px; border-radius: 4px; text-align: center; border: 1px solid #bbe0f5;">
          <div style="font-size: 8.5px; font-weight: bold; color: #1B3A5F;">ความเป็นพันธมิตร</div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a;">${scores.partnership !== null ? scores.partnership : '-'}</div>
        </div>
      </div>
      <div style="background: #1B3A5F; color: white; padding: 4px 10px; border-radius: 6px; text-align: center; min-width: 90px;">
        <div style="font-size: 8.5px; opacity: 0.9;">คะแนนเฉลี่ย</div>
        <div style="font-size: 15px; font-weight: bold;">⭐ ${avg !== null ? avg.toFixed(1) : '-'}/10</div>
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
      <div style="flex: 1; border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 2px; text-align: center; background: #fff;">
        <div style="font-weight: bold; font-size: 9px; color: #1B3A5F;">ผู้เข้าเยี่ยม/รายงาน (AA)</div>
        ${
          report.inspectorSignature
            ? `<img src="${report.inspectorSignature}" style="height: 28px; max-width: 100%; object-fit: contain; margin: 2px 0;" />`
            : '<div style="height: 28px;"></div>'
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
      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 6px; text-align: center; background: #fff;">
        <div style="font-weight: bold; font-size: 9px; color: #1B3A5F; margin-bottom: 2px;">Engineering Department</div>
        ${
          approvals.engineering?.signature
            ? `<img src="${approvals.engineering.signature}" style="height: 26px; max-width: 100%; object-fit: contain;" />`
            : '<div style="height: 26px;"></div>'
        }
        <div style="font-size: 8.5px; color: #475569; margin-top: 2px;">ชื่อ: ${approvals.engineering?.name || '.....................................'}</div>
        <div style="font-size: 8.5px; color: #475569;">วันที่: ..... / ..... / ..........</div>
      </div>
      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 6px; text-align: center; background: #fff;">
        <div style="font-weight: bold; font-size: 9px; color: #1B3A5F; margin-bottom: 2px;">Credit Department</div>
        ${
          approvals.credit?.signature
            ? `<img src="${approvals.credit.signature}" style="height: 26px; max-width: 100%; object-fit: contain;" />`
            : '<div style="height: 26px;"></div>'
        }
        <div style="font-size: 8.5px; color: #475569; margin-top: 2px;">ชื่อ: ${approvals.credit?.name || '.....................................'}</div>
        <div style="font-size: 8.5px; color: #475569;">วันที่: ..... / ..... / ..........</div>
      </div>
      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 6px; text-align: center; background: #fff;">
        <div style="font-weight: bold; font-size: 9px; color: #1B3A5F; margin-bottom: 2px;">General Manager</div>
        ${
          approvals.generalManager?.signature
            ? `<img src="${approvals.generalManager.signature}" style="height: 26px; max-width: 100%; object-fit: contain;" />`
            : '<div style="height: 26px;"></div>'
        }
        <div style="font-size: 8.5px; color: #475569; margin-top: 2px;">ชื่อ: ${approvals.generalManager?.name || '.....................................'}</div>
        <div style="font-size: 8.5px; color: #475569;">วันที่: ..... / ..... / ..........</div>
      </div>
    </div>
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

/** Generate and save PDF file */
export async function generatePDF(report: VisitReport): Promise<void> {
  const canvas = await generatePDFCanvas(report);
  const doc = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

  const fileName = `รายงานเข้าเยี่ยม_${report.companyName || 'draft'}_${toThaiDateShort(report.visitDate)}.pdf`;

  // Try Web Share API (iPad)
  const pdfBlob = doc.output('blob');
  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Visit Report',
          files: [file],
        });
        return;
      }
    } catch (e) {
      // Fallback to direct download
    }
  }

  // Fallback: direct download
  doc.save(fileName);
}
