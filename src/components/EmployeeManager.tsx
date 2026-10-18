import React, { useState } from 'react';
import { Employee } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  X,
  Check,
  IdCard,
  Banknote,
} from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  onAddEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => void;
  onUpdateEmployee: (id: string, emp: Partial<Omit<Employee, 'id' | 'createdAt'>>) => void;
  onDeleteEmployee: (id: string) => void;
  onCreateSlipForEmployee: (emp: Employee) => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onCreateSlipForEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empToDelete, setEmpToDelete] = useState<Employee | null>(null);

  // Form Inputs
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [nomorSlipGaji, setNomorSlipGaji] = useState('');
  const [gajiPokok, setGajiPokok] = useState<number>(0);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingEmployee(null);
    setNama('');
    setNik('');
    setJabatan('');
    setNomorSlipGaji(String(employees.length + 1));
    setGajiPokok(0);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setNama(emp.nama);
    setNik(emp.nik || '');
    setJabatan(emp.jabatan || '');
    setNomorSlipGaji(emp.nomorSlipGaji || '');
    setGajiPokok(emp.gajiPokok || 0);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setFormError('Nama Karyawan wajib diisi.');
      return;
    }

    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, {
        nama: nama.trim(),
        nik: nik.trim() || '-',
        jabatan: jabatan.trim(),
        nomorSlipGaji: nomorSlipGaji.trim() || '1',
        gajiPokok,
      });
    } else {
      onAddEmployee({
        nama: nama.trim(),
        nik: nik.trim() || '-',
        jabatan: jabatan.trim(),
        nomorSlipGaji: nomorSlipGaji.trim() || String(employees.length + 1),
        gajiPokok,
      });
    }

    setIsModalOpen(false);
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    return (
      emp.nama.toLowerCase().includes(q) ||
      (emp.nik || '').toLowerCase().includes(q) ||
      (emp.jabatan || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari karyawan berdasarkan nama, NIK, jabatan..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
          />
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Employee List or Empty State */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-dashed border-slate-300">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-400 mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            {searchTerm ? 'Karyawan tidak ditemukan' : 'Belum Ada Data Karyawan'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {searchTerm
              ? `Tidak ditemukan karyawan dengan kata kunci "${searchTerm}".`
              : 'Daftar karyawan Anda masih kosong. Daftarkan karyawan agar saat membuat slip, data Nama, NIK, dan Jabatan otomatis terisi.'}
          </p>
          {!searchTerm && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Karyawan Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {emp.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase">
                      {emp.nama}
                    </h4>
                    <p className="text-xs text-blue-600 font-medium">
                      {emp.jabatan || 'Staf / Karyawan'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(emp)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Karyawan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEmpToDelete(emp)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Karyawan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="space-y-0.5">
                  <div>
                    NIK: <span className="font-mono text-slate-700">{emp.nik || '-'}</span>
                  </div>
                  <div>
                    Nomor Slip: <span className="font-mono text-slate-700">{emp.nomorSlipGaji || '-'}</span>
                  </div>
                  <div>
                    Gaji Pokok: <span className="font-mono font-semibold text-emerald-700">{formatRupiah(emp.gajiPokok || 0)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onCreateSlipForEmployee(emp)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Buat Slip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Karyawan *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Ajat Sudrajat"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK (Nomor Induk Kependudukan / Karyawan)
                </label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Nomor identitas karyawan atau -"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan / Posisi *
                </label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Teknisi, Kasir, Admin, Supir"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Slip Gaji (Urutan / Kode Slip)
                </label>
                <input
                  type="text"
                  value={nomorSlipGaji}
                  onChange={(e) => setNomorSlipGaji(e.target.value)}
                  placeholder="Contoh: 1, 2, atau 001/MTA"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gaji Pokok Karyawan (Rp)
                </label>
                <div className="relative rounded-lg">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={gajiPokok === 0 ? '' : gajiPokok.toLocaleString('id-ID')}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setGajiPokok(digits ? parseInt(digits, 10) : 0);
                    }}
                    placeholder="0"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Gaji Pokok ini akan otomatis terisi saat membuat slip gaji karyawan ini.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Karyawan */}
      {empToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Hapus Data Karyawan?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus data karyawan{' '}
              <strong className="text-slate-800">{empToDelete.nama}</strong> ({empToDelete.jabatan})?
              Data yang dihapus tidak dapat dipulihkan.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setEmpToDelete(null)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteEmployee(empToDelete.id);
                  setEmpToDelete(null);
                }}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
