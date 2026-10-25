/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, CompanyProfile, Employee, SlipGaji } from './types';
import {
  getCompanyProfile,
  saveCompanyProfile,
  getEmployees,
  saveEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getSavedSlips,
  saveSlip,
  deleteSlip,
} from './utils/storage';
import {
  testConnection,
  subscribeToCompanyOnline,
  subscribeToEmployeesOnline,
  subscribeToSlipsOnline,
  getCompanyProfileFromFirestore,
  getEmployeesFromFirestore,
  getSlipsFromFirestore,
  saveCompanyProfileToFirestore,
  saveEmployeeToFirestore,
  saveSlipToFirestore,
  deleteSlipFromFirestore,
} from './utils/firebase';
import { Navbar } from './components/Navbar';
import { SlipForm } from './components/SlipForm';
import { SlipList } from './components/SlipList';
import { EmployeeManager } from './components/EmployeeManager';
import { CompanySettings } from './components/CompanySettings';
import { SlipModal } from './components/SlipModal';
import { RekapView } from './components/RekapView';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { FilePlus2, ListFilter, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('slip');
  const [slipSubTab, setSlipSubTab] = useState<'form' | 'list'>('form');

  // Application Data States
  const [company, setCompany] = useState<CompanyProfile>(getCompanyProfile());
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [slips, setSlips] = useState<SlipGaji[]>(getSavedSlips());

  // Online Cloud Status
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncingOnline, setIsSyncingOnline] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Active slip for editing or previewing
  const [editingSlip, setEditingSlip] = useState<SlipGaji | null>(null);
  const [previewSlip, setPreviewSlip] = useState<Partial<SlipGaji> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Sync state & Real-time Cloud listeners on mount
  useEffect(() => {
    // 1. Initial local load
    setCompany(getCompanyProfile());
    setEmployees(getEmployees());
    setSlips(getSavedSlips());

    // 2. Test Firestore connection
    testConnection().then((connected) => {
      setIsOnline(connected);
    });

    // 3. Bidirectional initial sync with Firestore
    const initCloudSync = async () => {
      try {
        const [cloudCompany, cloudEmps, cloudSlips] = await Promise.all([
          getCompanyProfileFromFirestore(),
          getEmployeesFromFirestore(),
          getSlipsFromFirestore(),
        ]);

        const localComp = getCompanyProfile();
        const localEmps = getEmployees();
        const localSlips = getSavedSlips();

        // Sync Company Profile
        if (cloudCompany && cloudCompany.namaPerusahaan) {
          saveCompanyProfile(cloudCompany);
          setCompany(cloudCompany);
        } else if (localComp.namaPerusahaan) {
          await saveCompanyProfileToFirestore(localComp);
        }

        // Sync Employees
        if (cloudEmps && cloudEmps.length > 0) {
          saveEmployees(cloudEmps);
          setEmployees(cloudEmps);
        } else if (localEmps.length > 0) {
          await Promise.all(localEmps.map((emp) => saveEmployeeToFirestore(emp)));
        }

        // Sync Slips
        if (cloudSlips && cloudSlips.length > 0) {
          localStorage.setItem('mta_slip_history_v1', JSON.stringify(cloudSlips));
          setSlips(cloudSlips);
        } else if (localSlips.length > 0) {
          await Promise.all(localSlips.map((slip) => saveSlipToFirestore(slip)));
        }
      } catch (err) {
        console.warn('Initial cloud sync deferred:', err);
      }
    };

    initCloudSync();

    // 4. Real-time Firestore Listeners
    const unsubCompany = subscribeToCompanyOnline((updated) => {
      if (updated) {
        setCompany(updated);
        try {
          localStorage.setItem('mta_slip_company_v1', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
    });

    const unsubEmps = subscribeToEmployeesOnline((list) => {
      if (list && list.length > 0) {
        setEmployees(list);
        try {
          localStorage.setItem('mta_slip_employees_v1', JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }
      }
    });

    const unsubSlips = subscribeToSlipsOnline((list) => {
      if (list) {
        setSlips(list);
        try {
          localStorage.setItem('mta_slip_history_v1', JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }
      }
    });

    return () => {
      unsubCompany();
      unsubEmps();
      unsubSlips();
    };
  }, []);

  // Handlers for Company
  const handleSaveCompany = (updated: CompanyProfile) => {
    saveCompanyProfile(updated);
    setCompany(updated);
    showToast('Profil perusahaan berhasil disimpan dan disinkronkan ke Cloud!');
  };

  // Handlers for Employees
  const handleAddEmployee = (empData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmp = addEmployee(empData);
    setEmployees(getEmployees());
    showToast(`Data karyawan ${newEmp.nama} berhasil disimpan online!`);
    return newEmp;
  };

  const handleUpdateEmployee = (
    id: string,
    updates: Partial<Omit<Employee, 'id' | 'createdAt'>>
  ) => {
    updateEmployee(id, updates);
    setEmployees(getEmployees());
    showToast('Data karyawan berhasil diperbarui online!');
  };

  const handleDeleteEmployee = (id: string) => {
    deleteEmployee(id);
    setEmployees(getEmployees());
    showToast('Data karyawan berhasil dihapus!', 'info');
  };

  // Quick action from EmployeeManager to create a slip
  const handleCreateSlipForEmployee = (emp: Employee) => {
    const baseSalary = emp.gajiPokok || 0;
    setEditingSlip({
      id: '',
      employeeId: emp.id,
      nama: emp.nama,
      jabatan: emp.jabatan,
      nik: emp.nik || '-',
      nomorSlip: emp.nomorSlipGaji || '1',
      tanggal: new Date().toISOString().split('T')[0],
      periode: new Date().toLocaleString('id-ID', { month: 'long' }),
      gajiPokok: baseSalary,
      uangMakanPendapatan: 0,
      transport: 0,
      thr: 0,
      bonus: 0,
      lemburan: 0,
      jamLembur: 0,
      masukKerja: 0,
      pinjaman: 0,
      bpjsKetenagakerjaan: 0,
      pph21: 0,
      lainLain: 0,
      uangMakanPotongan: 0,
      totalPendapatan: baseSalary,
      totalPotongan: 0,
      gajiBersih: baseSalary,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setActiveTab('slip');
    setSlipSubTab('form');
  };

  // Handlers for Slips
  const handleSlipSaved = (saved: SlipGaji) => {
    setSlips(getSavedSlips());
    setPreviewSlip(saved);
    setIsModalOpen(true);
    setEditingSlip(null);
    showToast(`Slip gaji untuk ${saved.nama} berhasil disimpan online!`);
  };

  const handlePreviewSlip = (slipToPreview: SlipGaji) => {
    setPreviewSlip(slipToPreview);
    setIsModalOpen(true);
  };

  const handleEditSlip = (slipToEdit: SlipGaji) => {
    setEditingSlip(slipToEdit);
    setActiveTab('slip');
    setSlipSubTab('form');
  };

  const handleDeleteSlip = (id: string) => {
    deleteSlip(id);
    setSlips(getSavedSlips());
    if (previewSlip?.id === id) {
      setPreviewSlip(null);
      setIsModalOpen(false);
    }
    if (editingSlip?.id === id) {
      setEditingSlip(null);
      setSlipSubTab('list');
    }
    showToast('Slip gaji berhasil dihapus!', 'info');
  };

  // Manual Sync Button
  const handleManualSyncOnline = async () => {
    try {
      setIsSyncingOnline(true);
      const [cloudEmps, cloudSlips, cloudComp] = await Promise.all([
        getEmployeesFromFirestore(),
        getSlipsFromFirestore(),
        getCompanyProfileFromFirestore(),
      ]);

      const localEmps = getEmployees();
      const localSlips = getSavedSlips();
      const localComp = getCompanyProfile();

      // Push local items to Firestore
      for (const emp of localEmps) {
        await saveEmployeeToFirestore(emp);
      }
      for (const slip of localSlips) {
        await saveSlipToFirestore(slip);
      }
      if (localComp.namaPerusahaan) {
        await saveCompanyProfileToFirestore(localComp);
      }

      // Merge and update
      if (cloudEmps && cloudEmps.length > 0) setEmployees(cloudEmps);
      if (cloudSlips && cloudSlips.length > 0) setSlips(cloudSlips);
      if (cloudComp && cloudComp.namaPerusahaan) setCompany(cloudComp);

      setIsOnline(true);
      showToast('Sinkronisasi cloud online selesai! Semua data tersimpan aman di Google Cloud.');
    } catch (err) {
      console.error(err);
      showToast('Sinkronisasi cloud gagal: Periksa koneksi internet.', 'error');
    } finally {
      setIsSyncingOnline(false);
    }
  };

  // Backup & Restore
  const handleExportData = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company,
      employees,
      slips,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Backup_SlipGajiMTA_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.company) {
          saveCompanyProfile(parsed.company);
          setCompany(parsed.company);
        }
        if (Array.isArray(parsed.employees)) {
          localStorage.setItem('mta_slip_employees_v1', JSON.stringify(parsed.employees));
          setEmployees(parsed.employees);
          for (const emp of parsed.employees) {
            await saveEmployeeToFirestore(emp);
          }
        }
        if (Array.isArray(parsed.slips)) {
          localStorage.setItem('mta_slip_history_v1', JSON.stringify(parsed.slips));
          setSlips(parsed.slips);
          for (const slip of parsed.slips) {
            await saveSlipToFirestore(slip);
          }
        }
        showToast('Data berhasil dipulihkan dari cadangan dan disinkronkan ke Cloud!');
      } catch (err) {
        showToast('Format file cadangan tidak valid.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-20 sm:pb-8">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-semibold border ${
              toastNotification.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/50'
                : toastNotification.type === 'error'
                ? 'bg-rose-900 text-white border-rose-500/50'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toastNotification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastNotification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toastNotification.message}</span>
          </div>
        </div>
      )}

      {/* Navbar Component */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        slipCount={slips.length}
        employeeCount={employees.length}
        isOnline={isOnline}
      />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* SLIP GAJI TAB */}
        {activeTab === 'slip' && (
          <div className="space-y-4">
            {/* Sub-tab switcher */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => {
                    setSlipSubTab('form');
                    setEditingSlip(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    slipSubTab === 'form' && !editingSlip
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Buat Slip Baru</span>
                </button>

                {editingSlip && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 text-white shadow-xs">
                    <span>Sedang Edit Slip: {editingSlip.nama}</span>
                  </div>
                )}

                <button
                  onClick={() => setSlipSubTab('list')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    slipSubTab === 'list'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span>Daftar Slip Tersimpan ({slips.length})</span>
                </button>
              </div>
            </div>

            {/* Content for Slip Sub-tabs */}
            {slipSubTab === 'form' ? (
              <SlipForm
                employees={employees}
                company={company}
                initialSlip={editingSlip}
                onSaved={handleSlipSaved}
                onPreview={handlePreviewSlip}
                onDelete={handleDeleteSlip}
                onCancelEdit={
                  editingSlip
                    ? () => {
                        setEditingSlip(null);
                        setSlipSubTab('list');
                      }
                    : undefined
                }
              />
            ) : (
              <SlipList
                slips={slips}
                company={company}
                onView={handlePreviewSlip}
                onEdit={handleEditSlip}
                onDelete={handleDeleteSlip}
                onNewSlip={() => {
                  setEditingSlip(null);
                  setSlipSubTab('form');
                }}
              />
            )}
          </div>
        )}

        {/* REKAP GAJI TAB */}
        {activeTab === 'rekap' && (
          <RekapView
            slips={slips}
            company={company}
            onViewSlip={handlePreviewSlip}
            onDeleteSlip={handleDeleteSlip}
            onNavigateToSlip={() => {
              setActiveTab('slip');
              setSlipSubTab('form');
            }}
          />
        )}

        {/* DATA KARYAWAN TAB */}
        {activeTab === 'karyawan' && (
          <EmployeeManager
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onCreateSlipForEmployee={handleCreateSlipForEmployee}
          />
        )}

        {/* PENGATURAN TAB */}
        {activeTab === 'pengaturan' && (
          <CompanySettings
            company={company}
            onSaveCompany={handleSaveCompany}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onManualSyncOnline={handleManualSyncOnline}
            isSyncingOnline={isSyncingOnline}
          />
        )}
      </main>

      {/* Full Preview & Print / PDF Modal */}
      <SlipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slip={previewSlip}
        company={company}
        onDelete={handleDeleteSlip}
      />
    </div>
  );
}
