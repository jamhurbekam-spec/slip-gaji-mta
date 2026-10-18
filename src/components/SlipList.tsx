import React, { useState } from 'react';
import { CompanyProfile, SlipGaji } from '../types';
import { formatRupiah, formatDisplayDate } from '../utils/formatters';
import { RekapModal } from './RekapModal';
import {
  Search,
  FileText,
  Printer,
  Download,
  Share2,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';

interface SlipListProps {
  slips: SlipGaji[];
  company: CompanyProfile;
  onView: (slip: SlipGaji) => void;
  onEdit: (slip: SlipGaji) => void;
  onDelete: (id: string) => void;
  onNewSlip: () => void;
}

export const SlipList: React.FC<SlipListProps> = ({
  slips,
  company,
  onView,
  onEdit,
  onDelete,
  onNewSlip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRekapOpen, setIsRekapOpen] = useState(false);
  const [slipToDelete, setSlipToDelete] = useState<SlipGaji | null>(null);

  const filteredSlips = slips.filter((slip) => {
    const q = searchTerm.toLowerCase();
    return (
      (slip.nama || '').toLowerCase().includes(q) ||
      (slip.periode || '').toLowerCase().includes(q) ||
      (slip.nomorSlip || '').toLowerCase().includes(q)
    );
  });

  const totalGajiTercatat = slips.reduce((acc, s) => acc + (s.gajiBersih || 0), 0);

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama karyawan atau periode..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {slips.length > 0 && (
            <button
              onClick={() => setIsRekapOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
              title="Download & Cetak Rekap Gaji Karyawan"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Rekap Gaji</span>
            </button>
          )}

          <button
            onClick={onNewSlip}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Slip Baru</span>
          </button>
        </div>
      </div>

      {/* Summary Chips if there are slips */}
      {slips.length > 0 && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Total Slip Dibuat:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {slips.length} Slip
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Total Nominal:</span>
            <span className="font-bold text-blue-600 font-mono text-sm">
              {formatRupiah(totalGajiTercatat)}
            </span>
          </div>
        </div>
      )}

      {/* Slips List or Empty State */}
      {filteredSlips.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-dashed border-slate-300">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-400 mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            {searchTerm ? 'Tidak ada slip yang cocok' : 'Belum Ada Slip Gaji'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {searchTerm
              ? `Tidak ditemukan slip gaji dengan kata kunci "${searchTerm}". Coba kata kunci lain.`
              : 'Belum ada slip gaji yang disimpan di perangkat Anda. Buat slip gaji pertama sekarang.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onNewSlip}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Slip Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSlips.map((slip) => (
            <div
              key={slip.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Slip Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-tight">
                    {slip.nama || 'Tanpa Nama'}
                  </h4>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                    No. {slip.nomorSlip || '-'}
                  </span>
                  <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                    {slip.jabatan || '-'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Periode: <strong className="text-slate-700 font-semibold">{slip.periode || '-'}</strong></span>
                  </div>
                  <span>•</span>
                  <span>Tanggal: {formatDisplayDate(slip.tanggal || '-')}</span>
                </div>

                <div className="pt-1 flex items-baseline gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">Gaji Bersih:</span>
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-600">
                    {formatRupiah(slip.gajiBersih)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => onView(slip)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all"
                  title="Lihat & Cetak"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat / Cetak</span>
                </button>

                <button
                  onClick={() => onEdit(slip)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  title="Edit Slip"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setSlipToDelete(slip)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Hapus Slip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up Modal Konfirmasi Hapus Slip */}
      {slipToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Hapus Slip Gaji?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus slip gaji untuk{' '}
              <strong className="text-slate-800">{slipToDelete.nama}</strong> ({slipToDelete.periode})?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setSlipToDelete(null)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(slipToDelete.id);
                  setSlipToDelete(null);
                }}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rekap Gaji Karyawan */}
      <RekapModal
        isOpen={isRekapOpen}
        onClose={() => setIsRekapOpen(false)}
        slips={slips}
        company={company}
      />
    </div>
  );
};
