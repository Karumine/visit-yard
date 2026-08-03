// ==========================================
// Storage Layer — Interface + Dexie.js Implementation
// ==========================================
import Dexie, { type EntityTable } from 'dexie';
import type { VisitReport } from '../types/report';
import { createEmptyReport } from '../types/report';

// ----- Storage Interface (เผื่อต่อ API ภายหลัง) -----
export interface IStorageService {
  saveReport(report: VisitReport): Promise<void>;
  getReport(id: string): Promise<VisitReport | undefined>;
  getAllReports(): Promise<VisitReport[]>;
  deleteReport(id: string): Promise<void>;
  duplicateReport(id: string): Promise<VisitReport>;
}

// ----- Dexie Database -----
class VisitYardDB extends Dexie {
  reports!: EntityTable<VisitReport, 'id'>;

  constructor() {
    super('VisitYardDB');
    this.version(1).stores({
      reports: 'id, status, companyName, updatedAt, createdAt',
    });
  }
}

const db = new VisitYardDB();

// ----- Local Storage Service (IndexedDB via Dexie) -----
export const storageService: IStorageService = {
  async saveReport(report: VisitReport): Promise<void> {
    report.updatedAt = new Date().toISOString();
    await db.reports.put(report);
  },

  async getReport(id: string): Promise<VisitReport | undefined> {
    return db.reports.get(id);
  },

  async getAllReports(): Promise<VisitReport[]> {
    return db.reports.orderBy('updatedAt').reverse().toArray();
  },

  async deleteReport(id: string): Promise<void> {
    await db.reports.delete(id);
  },

  async duplicateReport(id: string): Promise<VisitReport> {
    const original = await db.reports.get(id);
    if (!original) throw new Error('Report not found');

    const newReport: VisitReport = {
      ...structuredClone(original),
      id: crypto.randomUUID(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyName: `${original.companyName} (สำเนา)`,
      inspectorSignature: undefined,
      approvals: { engineering: {}, credit: {}, generalManager: {} },
    };

    await db.reports.put(newReport);
    return newReport;
  },
};

// ----- JSON Export / Import -----
export async function exportReportAsJSON(report: VisitReport): Promise<string> {
  // Convert Blobs in photos to base64 for export
  const exportData = structuredClone(report) as any;

  const convertPhotos = async (photos: any[]) => {
    for (const photo of photos) {
      if (photo.blob instanceof Blob) {
        photo.blobBase64 = await blobToBase64(photo.blob);
        delete photo.blob;
      }
      if (photo.thumbnailBlob instanceof Blob) {
        photo.thumbnailBase64 = await blobToBase64(photo.thumbnailBlob);
        delete photo.thumbnailBlob;
      }
    }
  };

  if (exportData.machinePhotos) await convertPhotos(exportData.machinePhotos);
  if (exportData.sitePhotos) await convertPhotos(exportData.sitePhotos);

  return JSON.stringify(exportData, null, 2);
}

export async function importReportFromJSON(json: string): Promise<VisitReport> {
  const data = JSON.parse(json);

  const convertPhotosBack = (photos: any[]) => {
    for (const photo of photos) {
      if (photo.blobBase64) {
        photo.blob = base64ToBlob(photo.blobBase64);
        delete photo.blobBase64;
      }
      if (photo.thumbnailBase64) {
        photo.thumbnailBlob = base64ToBlob(photo.thumbnailBase64);
        delete photo.thumbnailBase64;
      }
    }
  };

  if (data.machinePhotos) convertPhotosBack(data.machinePhotos);
  if (data.sitePhotos) convertPhotosBack(data.sitePhotos);

  // Assign new ID for imported report
  data.id = crypto.randomUUID();
  data.updatedAt = new Date().toISOString();

  await storageService.saveReport(data);
  return data;
}

// ----- Helpers -----
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string): Blob {
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export { db };
