import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { Employee, CompanyProfile, SlipGaji } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with explicit databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

// Test initial connection as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local cache.');
    }
    return false;
  }
}

// ========================
// ONLINE FIRESTORE OPERATIONS
// ========================

// 1. Company Profile Online
export async function getCompanyProfileFromFirestore(): Promise<CompanyProfile | null> {
  const path = 'company/profile';
  try {
    const snap = await getDoc(doc(db, 'company', 'profile'));
    if (snap.exists()) {
      return snap.data() as CompanyProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveCompanyProfileToFirestore(profile: CompanyProfile): Promise<void> {
  const path = 'company/profile';
  try {
    await setDoc(doc(db, 'company', 'profile'), {
      ...profile,
      updatedAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 2. Employees Online
export async function getEmployeesFromFirestore(): Promise<Employee[]> {
  const path = 'employees';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: Employee[] = [];
    querySnapshot.forEach((d) => {
      list.push(d.data() as Employee);
    });
    // Sort by createdAt descending
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveEmployeeToFirestore(employee: Employee): Promise<void> {
  const path = `employees/${employee.id}`;
  try {
    await setDoc(doc(db, 'employees', employee.id), employee);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteEmployeeFromFirestore(employeeId: string): Promise<void> {
  const path = `employees/${employeeId}`;
  try {
    await deleteDoc(doc(db, 'employees', employeeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 3. Slips Online
export async function getSlipsFromFirestore(): Promise<SlipGaji[]> {
  const path = 'slips';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: SlipGaji[] = [];
    querySnapshot.forEach((d) => {
      list.push(d.data() as SlipGaji);
    });
    // Sort by createdAt descending
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveSlipToFirestore(slip: SlipGaji): Promise<void> {
  const path = `slips/${slip.id}`;
  try {
    await setDoc(doc(db, 'slips', slip.id), slip);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSlipFromFirestore(slipId: string): Promise<void> {
  const path = `slips/${slipId}`;
  try {
    await deleteDoc(doc(db, 'slips', slipId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Realtime listeners
export function subscribeToCompanyOnline(callback: (profile: CompanyProfile | null) => void) {
  return onSnapshot(
    doc(db, 'company', 'profile'),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as CompanyProfile);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'company/profile');
    }
  );
}

export function subscribeToEmployeesOnline(callback: (employees: Employee[]) => void) {
  return onSnapshot(
    collection(db, 'employees'),
    (snap) => {
      const list: Employee[] = [];
      snap.forEach((d) => list.push(d.data() as Employee));
      callback(list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'employees');
    }
  );
}

export function subscribeToSlipsOnline(callback: (slips: SlipGaji[]) => void) {
  return onSnapshot(
    collection(db, 'slips'),
    (snap) => {
      const list: SlipGaji[] = [];
      snap.forEach((d) => list.push(d.data() as SlipGaji));
      callback(list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'slips');
    }
  );
}

// Google Auth Helpers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Login gagal:', err);
    throw err;
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Logout gagal:', err);
  }
}
