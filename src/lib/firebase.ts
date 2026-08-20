// ==========================================
// Firebase Initialization & Config
// Firebase Project: visit-checklist-fec04
// ==========================================
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfurlklemzziYWnJJc5lr2-nfKVTzZ7Xc",
  authDomain: "visit-checklist-fec04.firebaseapp.com",
  projectId: "visit-checklist-fec04",
  storageBucket: "visit-checklist-fec04.firebasestorage.app",
  messagingSenderId: "154189771320",
  appId: "1:154189771320:web:d1cf8b5955bd24540a2ccd",
  measurementId: "G-T4ZDPG72ZP"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services with Modern Persistent Cache (Offline Mode)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const storage = getStorage(app);
export const auth = getAuth(app);

// ==========================================
// Firebase Firestore Collections & Helpers
// ==========================================

// Helper to clean undefined values for Firestore
const cleanForFirestore = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) => (value === undefined ? null : value)));
};

// 1. Visit Yard Reports Helper
export const saveVisitReportToFirebase = async (report: any) => {
  const cleanData = cleanForFirestore({
    ...report,
    updatedAt: new Date().toISOString()
  });
  const reportRef = doc(db, 'visit_reports', cleanData.id);
  await setDoc(reportRef, cleanData, { merge: true });
};

export const getVisitReportFromFirebase = async (id: string) => {
  const reportRef = doc(db, 'visit_reports', id);
  const snap = await getDoc(reportRef);
  return snap.exists() ? snap.data() : null;
};

export const getAllVisitReportsFromFirebase = async () => {
  const querySnapshot = await getDocs(collection(db, 'visit_reports'));
  const reports: any[] = [];
  querySnapshot.forEach((docSnap) => {
    if (docSnap.exists()) {
      reports.push(docSnap.data());
    }
  });
  return reports;
};

export const deleteVisitReportFromFirebase = async (id: string) => {
  const reportRef = doc(db, 'visit_reports', id);
  await deleteDoc(reportRef);
};

// 2. Checklist Inspections Helper
export const saveInspectionToFirebase = async (inspection: any) => {
  const cleanData = cleanForFirestore({
    ...inspection,
    updatedAt: new Date().toISOString()
  });
  const inspRef = doc(db, 'checklist_inspections', cleanData.id);
  await setDoc(inspRef, cleanData, { merge: true });
};

export const deleteInspectionFromFirebase = async (id: string) => {
  const inspRef = doc(db, 'checklist_inspections', id);
  await deleteDoc(inspRef);
};

// 3. Firebase Storage Image Upload Helper
export const uploadImageToFirebase = async (base64DataUrl: string, folderPath: string = 'evidence'): Promise<string> => {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:')) {
    return base64DataUrl; // Return as-is if already a HTTP URL
  }
  const filename = `${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
  const storageRef = ref(storage, `${folderPath}/${filename}`);
  await uploadString(storageRef, base64DataUrl, 'data_url');
  return await getDownloadURL(storageRef);
};

export default app;
