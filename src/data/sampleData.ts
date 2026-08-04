// ==========================================
// Sample Data — GE TECH PACKING / GREEN PROUD
// ==========================================
import type { VisitReport } from '../types/report';
import { storageService } from '../lib/storage';
import { generateUUID } from '../lib/uuid';

export async function loadSampleData(): Promise<void> {
  const sample: VisitReport = {
    id: generateUUID(),
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visitDate: new Date().toISOString(),
    visitNo: 1,
    customerType: 'existing',
    yardType: 'existing',
    companyName: 'GE TECH PACKING SOLUTION / GREEN PROUD TRADING',
    address: '99/1 Moo 5, Bangna-Trad Rd., Bangplee, Samutprakarn 10540',
    assetGroupType: 'existing',
    machineType: 'Forklift, Excavator, Crane, Wheel Loader',
    visitorBusinessNature: 'Heavy machinery leasing and trading',
    contacts: [
      { name: 'Mr. Somchai Thaweesak', phone: '081-234-5678', position: 'Managing Director' },
      { name: 'Ms. Pranee Charoenphol', phone: '089-876-5432', position: 'Finance Manager' },
      { name: 'Mr. Wichai Sriprasert', phone: '092-345-6789', position: 'Operation Manager' },
    ],
    visitPurpose: 'Site inspection for credit renewal assessment and machine condition evaluation',
    visitDetail: 'Visited the main yard and warehouse facility. The compound is well-organized with separate areas for different machine types. Security system includes CCTV coverage and 24-hour guards. All machines have proper documentation and serial number tags. The yard has been in operation for over 10 years with consistent business growth.',
    financedMachineInfo: 'Requesting credit for 5 units of Komatsu PC200-8 Excavators. Each unit valued at approximately 3.5 million baht. Total credit requested: 17.5 million baht. All machines are 2023 models with full import documentation.',
    machinePhotos: [],
    customerBackground: 'GE TECH PACKING SOLUTION has been in the heavy machinery business since 2012. Started with 5 machines and grew to over 200 machines in inventory. GREEN PROUD TRADING is the sister company handling international trade. Annual revenue approximately 500 million baht. Good payment history with 3 financial institutions. Owner has 15+ years experience in the industry.',
    sitePhotos: [],
    observations: {
      experience: {
        isOperator: 'Over 15 years in machinery operation',
        isExecutive: 'Manages both companies',
        isCorporate: 'Registered company with board of directors',
        isFamily: 'Family-owned, second generation',
      },
      team: {
        main: 'Well-structured team with clear responsibilities',
        srvTeam: '12 technicians with certified training',
        opTeam: '8 operators with valid licenses',
      },
      spareParts: 'Has dedicated spare parts warehouse with inventory management system. Partners with 3 authorized distributors for Komatsu, Caterpillar, and Hitachi.',
      theftPrevention: '24/7 CCTV system with 32 cameras, GPS tracking on all machines, security guards on rotation, barbed wire perimeter fence.',
      customerCharacteristics: 'Primary customers are construction companies and government contractors. 60% repeat customers. Average contract length 2-3 years.',
      machineValue: {
        highest: 8.5,
        lowest: 1.2,
        average: 4.85,
        total: 350,
        remark: 'Annual sales/revenue',
      },
      competitors: 'Thai Watsadu Leasing, SCB Leasing, KrungThai Asset. Main competitive advantage is local service network and fast response time.',
      others: 'Planning to expand to EEC area (Eastern Economic Corridor) next year. Interested in financing for new Volvo equipment line.',
    },
    scores: {
      businessNature: 8,
      ownerCharacter: 7,
      customerBase: 8,
      partnership: 9,
    },
    nextAction: 'Prepare credit proposal for committee review. Schedule follow-up visit to inspect new Volvo machines. Request updated financial statements for FY2025.',
    nextAppointment: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    hasAttachment: false,
    attachments: [],
    inspectorName: 'Khun Nattapong Wongcharoen',
    inspectorSignature: undefined,
    approvals: {
      engineering: {},
      credit: {},
      generalManager: {},
    },
  };

  await storageService.saveReport(sample);
}
