import React, { useState } from 'react';
import { CompanyProfile, SlipGaji } from '../types';
import { formatRupiah, formatDisplayDate } from '../utils/formatters';
import { exportSlipToPdf } from '../utils/pdfExport';
import {
  FileSpreadsheet,
  Download,
  Printer,
  X,
  Filter,
  DollarSign,
  Users,
  Loader2,
  Trash2,
} from 'lucide-react';

interface RekapModalProps {
  isOpen: boolean;
  onClose: () => void;
  slips: SlipGaji[];
  company: CompanyProfile;
  onDeleteSlip?: (id: string) => void;
}

export const RekapModal: React.FC<RekapModalProps> = ({
  isOpen,
  onClose,
  slips,
  company,
  onDeleteSlip,
}) => {
  const [selectedPeriode, setSelectedPeriode] = useState<string>('semua');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [slipToDelete, setSlipToDelete] = useState<SlipGaji | null>(null);

  if (!isOpen) return null;

  // Extract distinct periods
  const distinctPeriods = Array.from(new Set(slips.map((s) => s.periode || '').filter(Boolean)));

  // Filter slips based on period
  const filteredSlips =
    selectedPeriode === 'semua'
      ? slips
      : slips.filter((s) => (s.periode || '').toLowerCase() === selectedPeriode.toLowerCase());

  // Calculations
  const totalGajiPokok = filteredSlips.reduce((acc, s) => acc + (s.gajiPokok || 0), 0);
  const totalPendapatan = filteredSlips.reduce((acc, s) => acc + (s.totalPendapatan || 0), 0);
  const totalPotongan = filteredSlips.reduce((acc, s) => acc + (s.totalPotongan || 0), 0);
  const totalGajiBersih = filteredSlips.reduce((acc, s) => acc + (s.gajiBersih || 0), 0);

  // CSV Export for Excel
  const handleDownloadCsv = () => {
    const headers = [
      'No',
      'No. Slip',
      'Tanggal',
      'Nama Karyawan',
      'Jabatan',
      'NIK',
      'Periode',
      'Gaji Pokok (Rp)',
      'Uang Makan (Rp)',
      'Transport (Rp)',
      'THR (Rp)',
      'Bonus (Rp)',
      'Lemburan (Rp)',
      'Total Pendapatan (Rp)',
      'Pinjaman (Rp)',
      'BPJS Ketenagakerjaan (Rp)',
      'PPh21 (Rp)',
      'Potongan Lain (Rp)',
      'Uang Makan Potongan (Rp)',
      'Total Potongan (Rp)',
      'Gaji Bersih (Rp)',
    ];

    const rows = filteredSlips.map((s, idx) => [
      idx + 1,
      `"${s.nomorSlip || '-'}"`,
      `"${formatDisplayDate(s.tanggal || '-')}"`,
      `"${(s.nama || '').replace(/"/g, '""')}"`,
      `"${(s.jabatan || '').replace(/"/g, '""')}"`,
      `"${s.nik || '-'}"`,
      `"${s.periode || '-'}"`,
      s.gajiPokok || 0,
      s.uangMakanPendapatan || 0,
      s.transport || 0,
      s.thr || 0,
      s.bonus || 0,
      s.lemburan || 0,
      s.totalPendapatan || 0,
      s.pinjaman || 0,
      s.bpjsKetenagakerjaan || 0,
      s.pph21 || 0,
      s.lainLain || 0,
      s.uangMakanPotongan || 0,
      s.totalPotongan || 0,
      s.gajiBersih || 0,
    ]);

    // Summary row
    rows.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      totalGajiPokok,
      '',
      '',
      '',
      '',
      '',
      totalPendapatan,
      '',
      '',
      '',
      '',
      '',
      totalPotongan,
      totalGajiBersih,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const periodLabel = selectedPeriode === 'semua' ? 'Semua_Periode' : selectedPeriode.replace(/\s+/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Gaji_Karyawan_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const periodLabel = selectedPeriode === 'semua' ? 'Semua_Periode' : selectedPeriode.replace(/\s+/g, '_');
      await exportSlipToPdf('printable-rekap', `Rekap_Gaji_Karyawan_${periodLabel}`);
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[96vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 px-1.5 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-300">
              <img src="/logo_mta.png" alt="Logo MTA" className="h-5 w-auto object-contain" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide leading-tight text-white">
                REKAP GAJI KARYAWAN
              </h2>
              <p className="text-xs text-slate-300">
                {company.namaPerusahaan || 'SLIP GAJI MTA'} • {filteredSlips.length} Data Slip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Download Actions */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <label className="text-xs font-semibold text-slate-700">Filter Periode:</label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Periode ({slips.length})</option>
              {distinctPeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Download Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (CSV)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all disabled:opacity-60"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block">Total Karyawan</span>
            <span className="text-base font-bold text-slate-800">{filteredSlips.length} Slip</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block">Total Gaji Pokok</span>
            <span className="text-base font-bold text-slate-800 font-mono">{formatRupiah(totalGajiPokok)}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block">Total Potongan</span>
            <span className="text-base font-bold text-rose-600 font-mono">{formatRupiah(totalPotongan)}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <span className="text-emerald-800 font-semibold block">Total Gaji Bersih</span>
            <span className="text-base font-black text-emerald-700 font-mono">{formatRupiah(totalGajiBersih)}</span>
          </div>
        </div>

        {/* Modal Content: Printable Rekap Table */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-200/60 flex justify-center">
          <div
            id="printable-rekap"
            className="w-full bg-white p-6 shadow-sm border border-slate-300 rounded-xl"
            style={{ maxWidth: '900px', backgroundColor: '#ffffff' }}
          >
            {/* Header Perusahaan Rekap */}
            <div className="border-b-2 border-black pb-3 mb-4 text-center">
              <h2 className="text-lg font-black uppercase text-black font-['Plus_Jakarta_Sans',sans-serif]">
                {company.namaPerusahaan || 'CV. MULIA TEKHNIK ABADI'}
              </h2>
              <p className="text-xs text-neutral-800">
                {[company.alamat, company.kecamatan ? `Kec. ${company.kecamatan}` : '', company.kabupatenKota]
                  .filter(Boolean)
                  .join(' - ')}
              </p>
              <h3 className="text-sm font-extrabold text-neutral-900 mt-2 uppercase tracking-wide">
                REKAPITULASI GAJI KARYAWAN
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Periode: <strong className="text-black">{selectedPeriode === 'semua' ? 'Semua Periode' : selectedPeriode}</strong>
              </p>
            </div>

            {/* Table */}
            {filteredSlips.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm italic">
                Tidak ada data slip gaji pada periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-xs text-left">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black text-black font-bold">
                      <th className="border border-black px-2 py-1.5 text-center w-8">No</th>
                      <th className="border border-black px-2 py-1.5 text-center w-14">Slip</th>
                      <th className="border border-black px-2 py-1.5">Nama Karyawan</th>
                      <th className="border border-black px-2 py-1.5">Jabatan</th>
                      <th className="border border-black px-2 py-1.5 text-center">Periode</th>
                      <th className="border border-black px-2 py-1.5 text-right">Gaji Pokok</th>
                      <th className="border border-black px-2 py-1.5 text-right">Pendapatan</th>
                      <th className="border border-black px-2 py-1.5 text-right">Potongan</th>
                      <th className="border border-black px-2 py-1.5 text-right bg-neutral-200">Gaji Bersih</th>
                      {onDeleteSlip && (
                        <th className="border border-black px-2 py-1.5 text-center w-12 print:hidden">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlips.map((s, idx) => (
                      <tr key={s.id} className="border-b border-neutral-300 hover:bg-neutral-50">
                        <td className="border border-neutral-400 px-2 py-1.5 text-center">{idx + 1}</td>
                        <td className="border border-neutral-400 px-2 py-1.5 text-center font-mono">{s.nomorSlip || '-'}</td>
                        <td className="border border-neutral-400 px-2 py-1.5 font-bold uppercase text-neutral-950">{s.nama}</td>
                        <td className="border border-neutral-400 px-2 py-1.5">{s.jabatan || '-'}</td>
                        <td className="border border-neutral-400 px-2 py-1.5 text-center">{s.periode || '-'}</td>
                        <td className="border border-neutral-400 px-2 py-1.5 text-right font-mono">{formatRupiah(s.gajiPokok)}</td>
                        <td className="border border-neutral-400 px-2 py-1.5 text-right font-mono">{formatRupiah(s.totalPendapatan)}</td>
                        <td className="border border-neutral-400 px-2 py-1.5 text-right font-mono text-rose-700">{formatRupiah(s.totalPotongan)}</td>
                        <td className="border border-neutral-400 px-2 py-1.5 text-right font-mono font-bold bg-neutral-100 text-neutral-950">
                          {formatRupiah(s.gajiBersih)}
                        </td>
                        {onDeleteSlip && (
                          <td className="border border-neutral-400 px-1 py-1 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => setSlipToDelete(s)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus Slip Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-200 border-t-2 border-black font-extrabold text-black">
                      <td colSpan={5} className="border border-black px-3 py-2 text-center uppercase tracking-wide">
                        TOTAL KESELURUHAN
                      </td>
                      <td className="border border-black px-2 py-2 text-right font-mono">{formatRupiah(totalGajiPokok)}</td>
                      <td className="border border-black px-2 py-2 text-right font-mono">{formatRupiah(totalPendapatan)}</td>
                      <td className="border border-black px-2 py-2 text-right font-mono text-rose-800">{formatRupiah(totalPotongan)}</td>
                      <td className="border border-black px-2 py-2 text-right font-mono font-black text-black bg-neutral-300">
                        {formatRupiah(totalGajiBersih)}
                      </td>
                      {onDeleteSlip && <td className="border border-black print:hidden"></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Format rekap rapi siap cetak dan ekspor Excel</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-medium text-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {slipToDelete && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Hapus Slip Gaji?
            </h4>
            <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
              Anda yakin ingin menghapus slip gaji milik{' '}
              <strong className="text-slate-900">{slipToDelete.nama}</strong> periode{' '}
              <strong className="text-slate-900">{slipToDelete.periode}</strong>? Data yang dihapus tidak dapat dipulihkan.
            </p>
            <div className="flex items-center gap-2">
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
                  if (onDeleteSlip && slipToDelete.id) {
                    onDeleteSlip(slipToDelete.id);
                  }
                  setSlipToDelete(null);
                }}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Ya, Hapus Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
