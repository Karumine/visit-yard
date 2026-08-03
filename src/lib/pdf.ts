// ==========================================
// PDF Export — jsPDF with Thai font
// ==========================================
import { jsPDF } from 'jspdf';
import type { VisitReport } from '../types/report';
import { toThaiDateShort, toThaiDateFull, gregorianToBuddhist } from './thaidate';
import { calculateAverageScore } from '../types/report';

// We'll use the built-in Helvetica font as fallback
// For Thai text, we register the Sarabun font when available

export async function generatePDF(report: VisitReport): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // --- Helper functions ---
  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      addPage();
    }
  };

  const drawLine = (yPos: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  const addLabelValue = (label: string, value: string, labelWidth = 55) => {
    checkPageBreak(10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    // Wrap long values
    const maxValWidth = contentWidth - labelWidth;
    const lines = doc.splitTextToSize(value || '-', maxValWidth);
    doc.text(lines, margin + labelWidth, y);
    y += Math.max(lines.length * 4.5, 6);
    drawLine(y);
    y += 2;
  };

  const addSection = (title: string) => {
    checkPageBreak(15);
    y += 3;
    doc.setFillColor(27, 58, 95); // #1B3A5F
    doc.rect(margin, y - 4, contentWidth, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, y);
    doc.setTextColor(0, 0, 0);
    y += 7;
  };

  const addTextBlock = (label: string, value: string) => {
    checkPageBreak(20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value || '-', contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  };

  // ===== LOGO & HEADER =====
  try {
    const logoImg = await loadImage('/logo.png');
    doc.addImage(logoImg, 'PNG', margin, y, 25, 15);
  } catch (e) {
    // If logo fails to load, skip
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Visit Report', pageWidth / 2, y + 5, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Customer/Yard Visit Report', pageWidth / 2, y + 11, { align: 'center' });

  y += 20;
  drawLine(y);
  y += 4;

  // ===== SECTION 1: General Info =====
  addSection('1. General Information');

  addLabelValue('Visit Date:', toThaiDateFull(report.visitDate));
  addLabelValue('Visit No.:', String(report.visitNo));
  addLabelValue('Customer Type:', report.customerType === 'existing' ? 'Existing' : 'New');
  addLabelValue('Yard Type:', report.yardType === 'existing' ? 'Existing' : 'New');
  addLabelValue('Company Name:', report.companyName);
  addLabelValue('Address:', report.address);
  addLabelValue('Asset Group:', report.assetGroupType === 'existing' ? 'Existing' : 'New');
  addLabelValue('Machine Type:', report.machineType);
  addLabelValue('Business Nature:', report.visitorBusinessNature);

  // ===== SECTION 2: Contacts =====
  addSection('2. Contacts');

  const validContacts = report.contacts.filter(c => c.name.trim());
  if (validContacts.length > 0) {
    // Table header
    checkPageBreak(10);
    doc.setFillColor(220, 233, 245); // #DCE9F5
    doc.rect(margin, y - 3, contentWidth, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Name', margin + 2, y);
    doc.text('Position', margin + 70, y);
    doc.text('Phone', margin + 120, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    validContacts.forEach(c => {
      checkPageBreak(7);
      doc.text(c.name, margin + 2, y);
      doc.text(c.position, margin + 70, y);
      doc.text(c.phone, margin + 120, y);
      y += 5;
      drawLine(y);
      y += 1;
    });
  }

  // Visit Purpose
  y += 2;
  addTextBlock('Visit Purpose:', report.visitPurpose);

  // ===== SECTION 3: Details =====
  addSection('3. Visit Details');
  addTextBlock('Details:', report.visitDetail);
  addTextBlock('Financed Machine Info:', report.financedMachineInfo);
  addTextBlock('Customer Background:', report.customerBackground);

  // Photos (machine + site)
  const allPhotos = [
    ...report.machinePhotos.map(p => ({ ...p, label: 'Machine' })),
    ...report.sitePhotos.map(p => ({ ...p, label: 'Site' })),
  ];

  if (allPhotos.length > 0) {
    checkPageBreak(60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Photos:', margin, y);
    y += 5;

    let col = 0;
    const photoSize = 40;
    const photosPerRow = 4;
    const photoGap = 4;

    for (const photo of allPhotos) {
      if (col >= photosPerRow) {
        col = 0;
        y += photoSize + 10;
        checkPageBreak(photoSize + 15);
      }
      try {
        const imgUrl = URL.createObjectURL(photo.blob);
        const imgData = await loadImage(imgUrl);
        const xPos = margin + col * (photoSize + photoGap);
        doc.addImage(imgData, 'JPEG', xPos, y, photoSize, photoSize);
        if (photo.caption) {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.text(photo.caption.substring(0, 20), xPos, y + photoSize + 3);
        }
        URL.revokeObjectURL(imgUrl);
      } catch (e) {
        // skip failed images
      }
      col++;
    }
    y += photoSize + 10;
  }

  // ===== SECTION 4: Observations =====
  addSection('4. Observations');

  const obs = report.observations;
  addTextBlock('1. Experience:',
    `Operator: ${obs.experience.isOperator || '-'} | Executive: ${obs.experience.isExecutive || '-'} | Corporate: ${obs.experience.isCorporate || '-'} | Family: ${obs.experience.isFamily || '-'}`
  );
  addTextBlock('2. Service/Operation Team:',
    `${obs.team.main || '-'}\nSrv. Team: ${obs.team.srvTeam || '-'} | Op. Team: ${obs.team.opTeam || '-'}`
  );
  addTextBlock('3. Spare Parts Management:', obs.spareParts);
  addTextBlock('4. Theft Prevention System:', obs.theftPrevention);
  addTextBlock('5. Customer Characteristics:', obs.customerCharacteristics);

  // Machine value
  checkPageBreak(20);
  addTextBlock('6. Machine Value (Million Baht):',
    `Highest: ${obs.machineValue.highest ?? '-'} | Lowest: ${obs.machineValue.lowest ?? '-'} | Average: ${obs.machineValue.average ?? '-'} | Total: ${obs.machineValue.total ?? '-'}\nRemark: ${obs.machineValue.remark}`
  );

  addTextBlock('7. Competitors:', obs.competitors);
  addTextBlock('8. Others:', obs.others);

  // ===== SECTION 5: Scores =====
  addSection('5. Interest Scores (0-10)');

  checkPageBreak(35);
  const scores = report.scores;
  const avg = calculateAverageScore(scores);

  // Score boxes with light blue background
  const scoreItems = [
    { label: 'Business Nature', value: scores.businessNature },
    { label: 'Owner Character', value: scores.ownerCharacter },
    { label: 'Customer Base', value: scores.customerBase },
    { label: 'Partnership', value: scores.partnership },
  ];

  const boxWidth = contentWidth / 4 - 2;
  scoreItems.forEach((item, i) => {
    const xPos = margin + i * (boxWidth + 2.5);
    doc.setFillColor(220, 233, 245); // #DCE9F5
    doc.rect(xPos, y, boxWidth, 18, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, xPos + boxWidth / 2, y + 5, { align: 'center' });
    doc.setFontSize(14);
    doc.text(item.value !== null ? String(item.value) : '-', xPos + boxWidth / 2, y + 14, { align: 'center' });
  });
  y += 22;

  // Average
  doc.setFillColor(27, 58, 95);
  doc.rect(margin + contentWidth / 2 - 25, y, 50, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Average: ' + (avg !== null ? avg.toFixed(1) : '-') + '/10', pageWidth / 2, y + 8, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y += 18;

  // ===== SECTION 6: Summary =====
  addSection('6. Summary & Next Action');

  addTextBlock('Next Action:', report.nextAction);
  if (report.nextAppointment) {
    addLabelValue('Next Appointment:', toThaiDateFull(report.nextAppointment));
  }
  addLabelValue('Attachments:', report.hasAttachment ? 'Yes' : 'No');

  // Inspector signature
  y += 5;
  checkPageBreak(30);
  addLabelValue('Inspector (AA):', report.inspectorName);
  if (report.inspectorSignature) {
    try {
      doc.addImage(report.inspectorSignature, 'PNG', margin + 55, y - 5, 40, 15);
    } catch (e) {}
    y += 15;
  }

  // ===== APPROVAL SECTION =====
  checkPageBreak(50);
  y += 5;
  addSection('Inspected By');
  y += 3;

  const approvalBoxWidth = contentWidth / 3 - 3;
  const approvalLabels = ['Engineering Department', 'Credit Department', 'General Manager'];
  const approvalKeys = ['engineering', 'credit', 'generalManager'] as const;

  approvalKeys.forEach((key, i) => {
    const xPos = margin + i * (approvalBoxWidth + 4);
    const approval = report.approvals[key];

    doc.setDrawColor(180, 180, 180);
    doc.rect(xPos, y, approvalBoxWidth, 35);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(approvalLabels[i], xPos + approvalBoxWidth / 2, y + 4, { align: 'center' });

    // Signature
    if (approval.signature) {
      try {
        doc.addImage(approval.signature, 'PNG', xPos + 5, y + 6, approvalBoxWidth - 10, 12);
      } catch (e) {}
    }

    // Name & Date lines
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Name: ' + (approval.name || '......................'), xPos + 3, y + 25);
    doc.text('Date: ...../...../.....', xPos + 3, y + 30);
  });

  y += 40;

  // ===== SAVE =====
  const fileName = `Visit_Report_${report.companyName || 'draft'}_${toThaiDateShort(report.visitDate)}.pdf`;

  // Try Web Share API first (for iPad)
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
      // Fallback to download
    }
  }

  // Fallback: download
  doc.save(fileName);
}

function loadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
}
