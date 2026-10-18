import React, { useState, useEffect } from 'react';
import { Employee, CompanyProfile, SlipGaji } from '../types';
import { saveSlip } from '../utils/storage';
import {
  formatRupiah,
  getTodayISODate,
  getCurrentMonthName,
  INDONESIAN_MONTHS,
} from '../utils/formatters';
import {
  Calculator,
  UserCheck,
  Save,
  Eye,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Trash2,
} from 'lucide-react';

interface SlipFormProps {
  employees: Employee[];
  company: CompanyProfile;
  initialSlip?: SlipGaji | null;
  onSaved: (slip: SlipGaji) => void;
  onPreview: (slip: SlipGaji) => void;
  onCancelEdit?: () => void;
  onDelete?: (id: string) => void;
}

export const SlipForm: React.FC<SlipFormProps> = ({
  employees,
  company,
  initialSlip,
  onSaved,
  onPreview,
  onCancelEdit,
  onDelete,
}) => {
  // Form State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [nama, setNama] = useState<string>('');
  const [jabatan, setJabatan] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [nomorSlip, setNomorSlip] = useState<string>('');
  const [tanggal, setTanggal] = useState<string>(getTodayISODate());
  const [periode, setPeriode] = useState<string>(getCurrentMonthName());

  // Pendapatan state (semua opsional / tidak ada yang wajib diisi)
  const [gajiPokok, setGajiPokok] = useState<number>(0);
  const [uangMakanPendapatan, setUangMakanPendapatan] = useState<number>(0);
  const [transport, setTransport] = useState<number>(0);
  const [thr, setThr] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const [lemburan, setLemburan] = useState<number>(0);
  const [jamLembur, setJamLembur] = useState<number>(0);
  const [masukKerja, setMasukKerja] = useState<number>(0);

  // Pemotongan state (semua opsional / tidak ada yang wajib diisi)
  const [pinjaman, setPinjaman] = useState<number>(0);
  const [bpjsKetenagakerjaan, setBpjsKetenagakerjaan] = useState<number>(0);
  const [pph21, setPph21] = useState<number>(0);
  const [lainLain, setLainLain] = useState<number>(0);
  const [uangMakanPotongan, setUangMakanPotongan] = useState<number>(0);

  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | 'warning';
  } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Populate if editing existing slip
  useEffect(() => {
    if (initialSlip) {
      setSelectedEmpId(initialSlip.employeeId || '');
      setNama(initialSlip.nama || '');
      setJabatan(initialSlip.jabatan || '');
      setNik(initialSlip.nik || '');
      setNomorSlip(initialSlip.nomorSlip || '');
      setTanggal(initialSlip.tanggal || getTodayISODate());
      setPeriode(initialSlip.periode || getCurrentMonthName());

      setGajiPokok(Math.max(0, initialSlip.gajiPokok || 0));
      setUangMakanPendapatan(Math.max(0, initialSlip.uangMakanPendapatan || 0));
      setTransport(Math.max(0, initialSlip.transport || 0));
      setThr(Math.max(0, initialSlip.thr || 0));
      setBonus(Math.max(0, initialSlip.bonus || 0));
      setLemburan(Math.max(0, initialSlip.lemburan || 0));
      setJamLembur(Math.max(0, initialSlip.jamLembur || 0));
      setMasukKerja(Math.max(0, initialSlip.masukKerja || 0));

      setPinjaman(Math.max(0, initialSlip.pinjaman || 0));
      setBpjsKetenagakerjaan(Math.max(0, initialSlip.bpjsKetenagakerjaan || 0));
      setPph21(Math.max(0, initialSlip.pph21 || 0));
      setLainLain(Math.max(0, initialSlip.lainLain || 0));
      setUangMakanPotongan(Math.max(0, initialSlip.uangMakanPotongan || 0));
    }
  }, [initialSlip]);

  // When user selects an employee from dropdown: auto-fill nama, jabatan, nik, nomorSlip AND gajiPokok
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    if (!empId) return;
    const found = employees.find((e) => e.id === empId);
    if (found) {
      setNama(found.nama);
      setJabatan(found.jabatan);
      setNik(found.nik || '-');
      setNomorSlip(found.nomorSlipGaji || '1');
      // Otomatis isi Gaji Pokok dari data karyawan (non-negatif)
      setGajiPokok(Math.max(0, found.gajiPokok || 0));
    }
  };

  // Real-time automatic calculations
  const totalPendapatan =
    (gajiPokok || 0) +
    (uangMakanPendapatan || 0) +
    (transport || 0) +
    (thr || 0) +
    (bonus || 0) +
    (lemburan || 0);

  const totalPotongan =
    (pinjaman || 0) +
    (bpjsKetenagakerjaan || 0) +
    (pph21 || 0) +
    (lainLain || 0) +
    (uangMakanPotongan || 0);

  const gajiBersih = totalPendapatan - totalPotongan;

  const currentSlipObject: SlipGaji = {
    id: initialSlip?.id || '',
    employeeId: selectedEmpId,
    nama: nama.trim(),
    jabatan: jabatan.trim(),
    nik: nik.trim() || '-',
    nomorSlip: nomorSlip.trim() || '1',
    tanggal: tanggal.trim() || getTodayISODate(),
    periode: periode.trim() || getCurrentMonthName(),

    gajiPokok: Math.max(0, gajiPokok),
    uangMakanPendapatan: Math.max(0, uangMakanPendapatan),
    transport: Math.max(0, transport),
    thr: Math.max(0, thr),
    bonus: Math.max(0, bonus),
    lemburan: Math.max(0, lemburan),
    jamLembur: Math.max(0, jamLembur),
    masukKerja: Math.max(0, masukKerja),

    pinjaman: Math.max(0, pinjaman),
    bpjsKetenagakerjaan: Math.max(0, bpjsKetenagakerjaan),
    pph21: Math.max(0, pph21),
    lainLain: Math.max(0, lainLain),
    uangMakanPotongan: Math.max(0, uangMakanPotongan),

    totalPendapatan,
    totalPotongan,
    gajiBersih,

    createdAt: initialSlip?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  const handleReset = () => {
    if (window.confirm('Kosongkan semua isian form slip ini?')) {
      setSelectedEmpId('');
      setNama('');
      setJabatan('');
      setNik('');
      setNomorSlip('');
      setTanggal(getTodayISODate());
      setPeriode(getCurrentMonthName());

      setGajiPokok(0);
      setUangMakanPendapatan(0);
      setTransport(0);
      setThr(0);
      setBonus(0);
      setLemburan(0);
      setJamLembur(0);
      setMasukKerja(0);

      setPinjaman(0);
      setBpjsKetenagakerjaan(0);
      setPph21(0);
      setLainLain(0);
      setUangMakanPotongan(0);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi toast jika tanpa nama karyawan
    if (!nama.trim()) {
      showToast('Nama Karyawan wajib diisi sebelum menyimpan slip!', 'error');
      return;
    }

    // Validasi toast jika tanpa periode
    if (!periode.trim()) {
      showToast('Periode Gaji (Bulan) wajib dipilih sebelum menyimpan slip!', 'error');
      return;
    }

    const saved = saveSlip({
      ...currentSlipObject,
      id: initialSlip?.id,
    });

    showToast(
      initialSlip
        ? 'Slip gaji berhasil diperbarui!'
        : 'Slip gaji berhasil disimpan ke perangkat!',
      'success'
    );

    onSaved(saved);
  };

  const handlePreviewClick = () => {
    if (!nama.trim()) {
      showToast('Nama Karyawan wajib diisi sebelum melihat preview!', 'error');
      return;
    }
    if (!periode.trim()) {
      showToast('Periode Gaji (Bulan) wajib dipilih sebelum melihat preview!', 'error');
      return;
    }
    onPreview(currentSlipObject);
  };

  // Helper component for money input with currency format display and non-negative enforcement
  const MoneyInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
        <div className="relative rounded-lg shadow-2xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={value === 0 ? '' : value.toLocaleString('id-ID')}
            onChange={(e) => {
              // Validasi non-negatif: hanya terima digit angka
              const digits = e.target.value.replace(/\D/g, '');
              const num = digits ? parseInt(digits, 10) : 0;
              onChange(Math.max(0, num));
            }}
            placeholder="0"
            className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/30'
                : toast.type === 'warning'
                ? 'bg-amber-900/95 text-white border-amber-700 shadow-amber-950/30'
                : 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
              ) : toast.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* IDENTITAS KARYAWAN SECTION */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Identitas Slip Gaji
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih data karyawan tersimpan atau isi secara langsung
                </p>
              </div>
            </div>

            {/* Quick Picker Dropdown */}
            {employees.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Pilih Karyawan:
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Pilih dari Karyawan Tersimpan --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nama} ({emp.jabatan})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Karyawan
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Misal: Jamhur"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Misal: Teknisi / Admin"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIK
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Misal: 3201... atau -"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Slip Gaji
              </label>
              <input
                type="text"
                value={nomorSlip}
                onChange={(e) => setNomorSlip(e.target.value)}
                placeholder="Misal: 1, 2, atau 001/MTA"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Slip
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Periode Gaji (Bulan)
              </label>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                {INDONESIAN_MONTHS.map((bln) => (
                  <option key={bln} value={bln}>
                    {bln}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION: PENDAPATAN & PEMOTONGAN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* KOLOM PENDAPATAN */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-emerald-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
                      PENDAPATAN
                    </h3>
                    <p className="text-[11px] text-slate-400">Tidak ada yang wajib diisi (opsional)</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Pemasukan
                </span>
              </div>

              <div className="space-y-3">
                <MoneyInput
                  label="Gaji Pokok (Otomatis dari Data Karyawan)"
                  value={gajiPokok}
                  onChange={setGajiPokok}
                />
                <MoneyInput
                  label="Uang Makan"
                  value={uangMakanPendapatan}
                  onChange={setUangMakanPendapatan}
                />
                <MoneyInput
                  label="Transport"
                  value={transport}
                  onChange={setTransport}
                />
                <MoneyInput
                  label="THR"
                  value={thr}
                  onChange={setThr}
                />
                <MoneyInput
                  label="Bonus"
                  value={bonus}
                  onChange={setBonus}
                />
                <MoneyInput
                  label="Lemburan"
                  value={lemburan}
                  onChange={setLemburan}
                />

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jam Lembur
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={jamLembur || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value || '0', 10);
                          setJamLembur(Math.max(0, isNaN(val) ? 0 : val));
                        }}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">
                        Jam
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Masuk Kerja
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={masukKerja || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value || '0', 10);
                          setMasukKerja(Math.max(0, isNaN(val) ? 0 : val));
                        }}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">
                        Hari
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Pendapatan Subtotal box */}
            <div className="mt-5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase">
                TOTAL PENDAPATAN :
              </span>
              <span className="text-sm font-extrabold font-mono text-emerald-700">
                {formatRupiah(totalPendapatan)}
              </span>
            </div>
          </div>

          {/* KOLOM PEMOTONGAN */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-rose-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
                      PEMOTONGAN
                    </h3>
                    <p className="text-[11px] text-slate-400">Tidak ada yang wajib diisi (opsional)</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  Potongan
                </span>
              </div>

              <div className="space-y-3">
                <MoneyInput
                  label="Pinjaman"
                  value={pinjaman}
                  onChange={setPinjaman}
                />
                <MoneyInput
                  label="BPJS Ketenagakerjaan"
                  value={bpjsKetenagakerjaan}
                  onChange={setBpjsKetenagakerjaan}
                />
                <MoneyInput
                  label="PPh21"
                  value={pph21}
                  onChange={setPph21}
                />
                <MoneyInput
                  label="Lain - lain"
                  value={lainLain}
                  onChange={setLainLain}
                />
                <MoneyInput
                  label="Uang Makan (Potongan)"
                  value={uangMakanPotongan}
                  onChange={setUangMakanPotongan}
                />
              </div>
            </div>

            {/* Total Potongan Subtotal box */}
            <div className="mt-5 p-3 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 uppercase">
                TOTAL POTONGAN :
              </span>
              <span className="text-sm font-extrabold font-mono text-rose-700">
                {formatRupiah(totalPotongan)}
              </span>
            </div>
          </div>
        </div>

        {/* LIVE SUMMARY: GAJI BERSIH BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block">
                  GAJI BERSIH (TAKE HOME PAY)
                </span>
                <span className="text-xs text-slate-400">
                  Total Pendapatan ({formatRupiah(totalPendapatan)}) - Total Potongan ({formatRupiah(totalPotongan)})
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {formatRupiah(gajiBersih)}
              </div>
            </div>
          </div>
        </div>

        {/* FORM ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kosongkan Form</span>
            </button>
            {onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Batal Edit
              </button>
            )}
            {initialSlip?.id && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Slip Ini</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePreviewClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs rounded-xl active:scale-95 transition-all"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Preview Slip</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/20 rounded-xl transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialSlip ? 'Simpan Perubahan' : 'Simpan Slip Gaji'}</span>
            </button>
          </div>
        </div>

        {/* Modal Konfirmasi Hapus Slip saat Edit */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Slip Gaji Ini?
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Apakah Anda yakin ingin menghapus slip gaji untuk{' '}
                <strong className="text-slate-800">{nama || 'Karyawan'}</strong> ({periode})?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (initialSlip?.id && onDelete) {
                      onDelete(initialSlip.id);
                      setShowDeleteModal(false);
                      if (onCancelEdit) onCancelEdit();
                    }
                  }}
                  className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
