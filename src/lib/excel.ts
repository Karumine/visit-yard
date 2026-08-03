// ==========================================
// Excel Export — SheetJS
// ==========================================
import * as XLSX from 'xlsx';
import type { VisitReport } from '../types/report';
import { toThaiDateShort } from './thaidate';
import { calculateAverageScore } from '../types/report';

export function exportToExcel(reports: VisitReport[]): void {
  const data = reports.map(r => ({
    'Visit Date': toThaiDateShort(r.visitDate),
    'Visit No.': r.visitNo,
    'Status': r.status === 'completed' ? 'Completed' : 'Draft',
    'Customer Type': r.customerType === 'existing' ? 'Existing' : 'New',
    'Yard Type': r.yardType === 'existing' ? 'Existing' : 'New',
    'Company Name': r.companyName,
    'Address': r.address,
    'Asset Group': r.assetGroupType === 'existing' ? 'Existing' : 'New',
    'Machine Type': r.machineType,
    'Business Nature': r.visitorBusinessNature,
    'Contacts': r.contacts.filter(c => c.name).map(c => `${c.name} (${c.position}) ${c.phone}`).join('; '),
    'Visit Purpose': r.visitPurpose,
    'Visit Detail': r.visitDetail,
    'Financed Machine Info': r.financedMachineInfo,
    'Customer Background': r.customerBackground,
    'Machine Photos Count': r.machinePhotos.length,
    'Site Photos Count': r.sitePhotos.length,
    'Obs: Experience - Operator': r.observations.experience.isOperator,
    'Obs: Experience - Executive': r.observations.experience.isExecutive,
    'Obs: Experience - Corporate': r.observations.experience.isCorporate,
    'Obs: Experience - Family': r.observations.experience.isFamily,
    'Obs: Team Main': r.observations.team.main,
    'Obs: Srv. Team': r.observations.team.srvTeam,
    'Obs: Op. Team': r.observations.team.opTeam,
    'Obs: Spare Parts': r.observations.spareParts,
    'Obs: Theft Prevention': r.observations.theftPrevention,
    'Obs: Customer Characteristics': r.observations.customerCharacteristics,
    'Machine Value - Highest (M)': r.observations.machineValue.highest,
    'Machine Value - Lowest (M)': r.observations.machineValue.lowest,
    'Machine Value - Average (M)': r.observations.machineValue.average,
    'Machine Value - Total (M)': r.observations.machineValue.total,
    'Machine Value - Remark': r.observations.machineValue.remark,
    'Obs: Competitors': r.observations.competitors,
    'Obs: Others': r.observations.others,
    'Score: Business Nature': r.scores.businessNature,
    'Score: Owner Character': r.scores.ownerCharacter,
    'Score: Customer Base': r.scores.customerBase,
    'Score: Partnership': r.scores.partnership,
    'Score: Average': calculateAverageScore(r.scores),
    'Next Action': r.nextAction,
    'Next Appointment': r.nextAppointment ? toThaiDateShort(r.nextAppointment) : '',
    'Has Attachment': r.hasAttachment ? 'Yes' : 'No',
    'Inspector Name': r.inspectorName,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Visit Reports');
  XLSX.writeFile(wb, 'visit_reports.xlsx');
}
