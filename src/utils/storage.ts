import { Employee, CompanyProfile, SlipGaji } from '../types';
import {
  saveCompanyProfileToFirestore,
  saveEmployeeToFirestore,
  deleteEmployeeFromFirestore,
  saveSlipToFirestore,
  deleteSlipFromFirestore,
} from './firebase';

const STORAGE_KEYS = {
  EMPLOYEES: 'mta_slip_employees_v1',
  COMPANY: 'mta_slip_company_v1',
  SLIPS: 'mta_slip_history_v1',
};

// Company Profile: Defaults to completely empty strings (NO DUMMY DATA)
const DEFAULT_COMPANY: CompanyProfile = {
  namaPerusahaan: 'CV. MULIA TEKHNIK ABADI',
  alamat: 'Jl. Letda Nasir No. 58 Cikeas Udik',
  kecamatan: 'Gunung Putri',
  kabupatenKota: 'Bogor',
  noTelepon: '',
  logoUrl: '/logo_mta.png',
  ttdUrl: '',
  stempelUrl: '',
  namaPimpinan: '',
  tarifLemburPerJam: 12000,
};

export function getCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (!raw) return { ...DEFAULT_COMPANY };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_COMPANY,
      ...parsed,
      logoUrl: parsed.logoUrl || '/logo_mta.png',
      namaPerusahaan: parsed.namaPerusahaan || 'CV. MULIA TEKHNIK ABADI',
    };
  } catch (e) {
    console.error('Error reading company profile from storage:', e);
    return { ...DEFAULT_COMPANY };
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving company profile to local storage:', e);
  }
  // Online sync to Firestore
  saveCompanyProfileToFirestore(profile).catch((err) => {
    console.warn('Sync company profile online deferred:', err);
  });
}

export function getEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading employees from storage:', e);
    return [];
  }
}

export function saveEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (e) {
    console.error('Error saving employees:', e);
  }
}

export function addEmployee(emp: Omit<Employee, 'id' | 'createdAt'>): Employee {
  const current = getEmployees();
  const newEmp: Employee = {
    ...emp,
    id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    createdAt: Date.now(),
  };
  const updatedList = [newEmp, ...current];
  saveEmployees(updatedList);
  // Online sync to Firestore
  saveEmployeeToFirestore(newEmp).catch((err) => {
    console.warn('Sync employee online deferred:', err);
  });
  return newEmp;
}

export function updateEmployee(id: string, updates: Partial<Omit<Employee, 'id' | 'createdAt'>>): void {
  const current = getEmployees();
  const next = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
  saveEmployees(next);
  const target = next.find((e) => e.id === id);
  if (target) {
    saveEmployeeToFirestore(target).catch((err) => {
      console.warn('Sync updated employee online deferred:', err);
    });
  }
}

export function deleteEmployee(id: string): void {
  const current = getEmployees();
  const next = current.filter((e) => e.id !== id);
  saveEmployees(next);
  // Online deletion from Firestore
  deleteEmployeeFromFirestore(id).catch((err) => {
    console.warn('Sync delete employee online deferred:', err);
  });
}

export function getSavedSlips(): SlipGaji[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SLIPS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading slips from storage:', e);
    return [];
  }
}

export function saveSlip(slip: Omit<SlipGaji, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SlipGaji {
  const current = getSavedSlips();
  if (slip.id) {
    // update existing
    const existingIndex = current.findIndex((s) => s.id === slip.id);
    if (existingIndex >= 0) {
      const updated: SlipGaji = {
        ...current[existingIndex],
        ...slip,
        id: slip.id,
        updatedAt: Date.now(),
      };
      current[existingIndex] = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.SLIPS, JSON.stringify(current));
      } catch (e) {
        console.error('Error saving slip:', e);
      }
      // Online sync to Firestore
      saveSlipToFirestore(updated).catch((err) => {
        console.warn('Sync slip online deferred:', err);
      });
      return updated;
    }
  }

  // create new
  const newSlip: SlipGaji = {
    ...slip,
    id: 'slip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEYS.SLIPS, JSON.stringify([newSlip, ...current]));
  } catch (e) {
    console.error('Error creating slip:', e);
  }
  // Online sync to Firestore
  saveSlipToFirestore(newSlip).catch((err) => {
    console.warn('Sync new slip online deferred:', err);
  });
  return newSlip;
}

export function deleteSlip(id: string): void {
  if (!id) return;
  const current = getSavedSlips();
  const next = current.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.SLIPS, JSON.stringify(next));
  } catch (e) {
    console.error('Error deleting slip:', e);
  }
  // Online deletion from Firestore
  deleteSlipFromFirestore(id).catch((err) => {
    console.warn('Sync delete slip online deferred:', err);
  });
}
