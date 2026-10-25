import React, { useState } from 'react';
import { CompanyProfile, SlipGaji } from '../types';
import { formatRupiah, formatDisplayDate } from '../utils/formatters';
import { exportSlipToPdf } from '../utils/pdfExport';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  DollarSign,
  Users,
  Loader2,
  Calendar,
  Eye,
  Trash2,
} from 'lucide-react';

interface RekapViewProps {
  slips: SlipGaji[];
  company: CompanyProfile;
  onViewSlip?: (slip: SlipGaji) => void;
  onNavigateToSlip?: () => void;
  onDeleteSlip?: (id: string) => void;
}

export const RekapView: React.FC<RekapViewProps> = ({
  slips,
  company,
  onViewSlip,
  onNavigateToSlip,
  onDeleteSlip,
}) => {
  const [selectedPeriode, setSelectedPeriode] = useState<string>('semua');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [slipToDelete, setSlipToDelete] = useState<SlipGaji | null>(null);

  // Extract distinct periods
  const distinctPeriods = Array.from(
    new Set(slips.map((s) => s.periode || '').filter(Boolean))
  );

  // Filter slips based on period
  const filteredSlips =
    selectedPeriode === 'semua'
      ? slips
      : slips.filter(
          (s) => (s.periode || '').toLowerCase() === selectedPeriode.toLowerCase()
        );

  // Totals
  const totalGajiPokok = filteredSlips.reduce((acc, s) => acc + (s.gajiPokok || 0), 0);
  const totalPendapatan = filteredSlips.reduce((acc, s) => acc + (s.totalPendapatan || 0), 0);
  const totalPotongan = filteredSlips.reduce((acc, s) => acc + (s.totalPotongan || 0), 0);
  const totalGajiBersih = filteredSlips.reduce((acc, s) => acc + (s.gajiBersih || 0), 0);

  // CSV Export
  const handleDownloadCsv = () => {
    if (filteredSlips.length === 0) return;

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
    const periodLabel =
      selectedPeriode === 'semua'
        ? 'Semua_Periode'
        : selectedPeriode.replace(/\s+/g, '_');
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
    if (filteredSlips.length === 0) return;
    try {
      setIsExportingPdf(true);
      const periodLabel =
        selectedPeriode === 'semua'
          ? 'Semua_Periode'
          : selectedPeriode.replace(/\s+/g, '_');
      await exportSlipToPdf('printable-rekap', `Rekap_Gaji_Karyawan_${periodLabel}`);
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Rekapitulasi Gaji Karyawan
            </h2>
            <p className="text-xs text-slate-500">
              Download laporan rekapitulasi slip gaji ke file Excel (CSV) atau cetak ke PDF
            </p>
          </div>
        </div>

        {/* Filter and Download Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="text-xs font-semibold bg-transparent border-none text-slate-800 focus:outline-none"
            >
              <option value="semua">Semua Periode ({slips.length})</option>
              {distinctPeriods.map((p) => (
                <option key={p} value={p}>
                  Periode: {p}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadCsv}
            disabled={filteredSlips.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            title="Download file CSV / Excel"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={filteredSlips.length === 0 || isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            title="Simpan tabel rekap ke format PDF"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyiapkan...</span>
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
            disabled={filteredSlips.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            title="Cetak rekap"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {slips.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400 font-medium block">Total Slip Tercatat</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 block">
              {filteredSlips.length} Slip
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400 font-medium block">Total Gaji Pokok</span>
            <span className="text-base sm:text-lg font-black text-slate-800 font-mono mt-0.5 block truncate">
              {formatRupiah(totalGajiPokok)}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-slate-400 font-medium block">Total Potongan</span>
            <span className="text-base sm:text-lg font-black text-rose-600 font-mono mt-0.5 block truncate">
              {formatRupiah(totalPotongan)}
            </span>
          </div>
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-emerald-800 font-semibold block">Total Gaji Bersih</span>
            <span className="text-base sm:text-lg font-black text-emerald-700 font-mono mt-0.5 block truncate">
              {formatRupiah(totalGajiBersih)}
            </span>
          </div>
        </div>
      )}

      {/* Main Table / Empty State */}
      {filteredSlips.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-400 mb-3">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            Belum Ada Data Rekap Gaji
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {slips.length === 0
              ? 'Belum ada slip gaji yang dibuat di perangkat Anda. Buat slip gaji terlebih dahulu untuk menghasilkan rekapitulasi gaji otomatis.'
              : `Tidak ditemukan slip gaji untuk periode "${selectedPeriode}".`}
          </p>
          {onNavigateToSlip && slips.length === 0 && (
            <button
              onClick={onNavigateToSlip}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              <span>Buat Slip Gaji Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <div
              id="printable-rekap"
              className="bg-white p-4 sm:p-6 min-w-[700px]"
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* Kop Laporan Rekap */}
              <div className="border-b-2 border-black pb-3 mb-4 text-center">
                <h2 className="text-lg font-black uppercase text-black font-['Plus_Jakarta_Sans',sans-serif]">
                  {company.namaPerusahaan || 'CV. MULIA TEKHNIK ABADI'}
                </h2>
                <p className="text-xs text-neutral-800">
                  {[
                    company.alamat,
                    company.kecamatan ? `Kec. ${company.kecamatan}` : '',
                    company.kabupatenKota,
                  ]
                    .filter(Boolean)
                    .join(' - ')}
                </p>
                <h3 className="text-sm font-extrabold text-neutral-900 mt-2 uppercase tracking-wide">
                  REKAPITULASI GAJI KARYAWAN
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Periode:{' '}
                  <strong className="text-black">
                    {selectedPeriode === 'semua' ? 'Semua Periode' : selectedPeriode}
                  </strong>
                </p>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border border-black text-xs text-left">
                <thead>
                  <tr className="bg-neutral-100 border-b border-black text-black font-bold">
                    <th className="border border-black px-2 py-2 text-center w-8">No</th>
                    <th className="border border-black px-2 py-2 text-center w-14">Slip</th>
                    <th className="border border-black px-2.5 py-2">Nama Karyawan</th>
                    <th className="border border-black px-2.5 py-2">Jabatan</th>
                    <th className="border border-black px-2 py-2 text-center">Periode</th>
                    <th className="border border-black px-2 py-2 text-right">Gaji Pokok</th>
                    <th className="border border-black px-2 py-2 text-right">Pendapatan</th>
                    <th className="border border-black px-2 py-2 text-right">Potongan</th>
                    <th className="border border-black px-2 py-2 text-right bg-neutral-200">
                      Gaji Bersih
                    </th>
                    {(onViewSlip || onDeleteSlip) && (
                      <th className="border border-black px-2 py-2 text-center w-16 print:hidden">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlips.map((s, idx) => (
                    <tr
                      key={s.id}
                      className="border-b border-neutral-300 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="border border-neutral-400 px-2 py-2 text-center">
                        {idx + 1}
                      </td>
                      <td className="border border-neutral-400 px-2 py-2 text-center font-mono">
                        {s.nomorSlip || '-'}
                      </td>
                      <td className="border border-neutral-400 px-2.5 py-2 font-bold uppercase text-neutral-950">
                        {s.nama}
                      </td>
                      <td className="border border-neutral-400 px-2.5 py-2 text-neutral-700">
                        {s.jabatan || '-'}
                      </td>
                      <td className="border border-neutral-400 px-2 py-2 text-center">
                        {s.periode || '-'}
                      </td>
                      <td className="border border-neutral-400 px-2 py-2 text-right font-mono">
                        {formatRupiah(s.gajiPokok)}
                      </td>
                      <td className="border border-neutral-400 px-2 py-2 text-right font-mono text-emerald-700">
                        {formatRupiah(s.totalPendapatan)}
                      </td>
                      <td className="border border-neutral-400 px-2 py-2 text-right font-mono text-rose-700">
                        {formatRupiah(s.totalPotongan)}
                      </td>
                      <td className="border border-neutral-400 px-2 py-2 text-right font-mono font-bold bg-neutral-100 text-neutral-950">
                        {formatRupiah(s.gajiBersih)}
                      </td>
                      {(onViewSlip || onDeleteSlip) && (
                        <td className="border border-neutral-400 px-1 py-1 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            {onViewSlip && (
                              <button
                                type="button"
                                onClick={() => onViewSlip(s)}
                                className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Lihat Slip"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteSlip && (
                              <button
                                type="button"
                                onClick={() => setSlipToDelete(s)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Hapus Slip Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-200 border-t-2 border-black font-extrabold text-black">
                    <td
                      colSpan={5}
                      className="border border-black px-3 py-2 text-center uppercase tracking-wide"
                    >
                      TOTAL KESELURUHAN
                    </td>
                    <td className="border border-black px-2 py-2 text-right font-mono">
                      {formatRupiah(totalGajiPokok)}
                    </td>
                    <td className="border border-black px-2 py-2 text-right font-mono text-emerald-800">
                      {formatRupiah(totalPendapatan)}
                    </td>
                    <td className="border border-black px-2 py-2 text-right font-mono text-rose-800">
                      {formatRupiah(totalPotongan)}
                    </td>
                    <td className="border border-black px-2 py-2 text-right font-mono font-black text-black bg-neutral-300">
                      {formatRupiah(totalGajiBersih)}
                    </td>
                    {(onViewSlip || onDeleteSlip) && (
                      <td className="border border-black print:hidden"></td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Slip dari Rekap */}
      {slipToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
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
              <strong className="text-slate-900">{slipToDelete.periode}</strong> (No. Slip:{' '}
              {slipToDelete.nomorSlip || '-'})? Tindakan ini tidak dapat dibatalkan.
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
