import React, { useState, useRef } from 'react';
import { CompanyProfile } from '../types';
import {
  Building2,
  Upload,
  Trash2,
  CheckCircle2,
  FileImage,
  Stamp,
  PenTool,
  Save,
  HelpCircle,
  Download,
  UploadCloud,
  Copy,
  Check,
  Clock,
  Coffee,
  Heart,
} from 'lucide-react';

interface CompanySettingsProps {
  company: CompanyProfile;
  onSaveCompany: (updated: CompanyProfile) => void;
  onExportData?: () => void;
  onImportData?: (file: File) => void;
  onManualSyncOnline?: () => Promise<void>;
  isSyncingOnline?: boolean;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  company,
  onSaveCompany,
  onExportData,
  onImportData,
  onManualSyncOnline,
  isSyncingOnline = false,
}) => {
  const [copiedGopay, setCopiedGopay] = useState(false);
  const [namaPerusahaan, setNamaPerusahaan] = useState(company.namaPerusahaan || '');
  const [alamat, setAlamat] = useState(company.alamat || '');
  const [kecamatan, setKecamatan] = useState(company.kecamatan || '');
  const [kabupatenKota, setKabupatenKota] = useState(company.kabupatenKota || '');
  const [noTelepon, setNoTelepon] = useState(company.noTelepon || '');
  const [namaPimpinan, setNamaPimpinan] = useState(company.namaPimpinan || '');
  const [tarifLemburPerJam, setTarifLemburPerJam] = useState<number>(
    company.tarifLemburPerJam !== undefined ? company.tarifLemburPerJam : 12000
  );

  const [logoUrl, setLogoUrl] = useState(company.logoUrl || '/logo_mta.png');
  const [ttdUrl, setTtdUrl] = useState(company.ttdUrl || '');
  const [stempelUrl, setStempelUrl] = useState(company.stempelUrl || '');

  const [savedNotice, setSavedNotice] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const ttdInputRef = useRef<HTMLInputElement>(null);
  const stempelInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setter(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanyProfile = {
      namaPerusahaan: namaPerusahaan.trim(),
      alamat: alamat.trim(),
      kecamatan: kecamatan.trim(),
      kabupatenKota: kabupatenKota.trim(),
      noTelepon: noTelepon.trim(),
      namaPimpinan: namaPimpinan.trim(),
      tarifLemburPerJam: Math.max(0, tarifLemburPerJam || 0),
      logoUrl,
      ttdUrl,
      stempelUrl,
    };
    onSaveCompany(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {savedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan perusahaan berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Perusahaan */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Data Perusahaan / Toko
              </h3>
              <p className="text-xs text-slate-500">
                Informasi ini akan tercetak pada kop/header slip gaji di bagian kanan atas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Perusahaan / CV / Toko
              </label>
              <input
                type="text"
                value={namaPerusahaan}
                onChange={(e) => setNamaPerusahaan(e.target.value)}
                placeholder="Contoh: CV. MULIA TEKHNIK ABADI"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Perusahaan
              </label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Contoh: Jl. Letda Nasir No. 58 Cikeas udik"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                placeholder="Contoh: Gunung Putri"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                value={kabupatenKota}
                onChange={(e) => setKabupatenKota(e.target.value)}
                placeholder="Contoh: Bogor"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon (Opsional)
              </label>
              <input
                type="text"
                value={noTelepon}
                onChange={(e) => setNoTelepon(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pimpinan / Penyetuju (Opsional)
              </label>
              <input
                type="text"
                value={namaPimpinan}
                onChange={(e) => setNamaPimpinan(e.target.value)}
                placeholder="Nama pada kolom 'Di Setuju oleh'"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Pengaturan Tarif Lembur per Jam */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Tarif Lembur per Jam
              </h3>
            </div>
          </div>

          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nominal Tarif Lembur per Jam (Rp)
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-slate-400 select-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={tarifLemburPerJam === 0 ? '' : tarifLemburPerJam.toLocaleString('id-ID')}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setTarifLemburPerJam(val ? parseInt(val, 10) : 0);
                }}
                placeholder="12.000"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Upload Logo, TTD, & Stempel */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200">
          <div className="pb-3 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Upload Gambar (Logo, TTD, & Stempel Toko)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. UPLOAD LOGO CV */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <FileImage className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Logo Perusahaan / CV
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Tampil di header kiri atas slip
                </p>

                <div className="h-28 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 overflow-hidden">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <FileImage className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[11px]">Belum ada logo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={logoInputRef}
                  onChange={(e) => handleFileUpload(e, setLogoUrl)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{logoUrl ? 'Ganti Logo' : 'Pilih Logo'}</span>
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg"
                    title="Hapus Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. UPLOAD TTD */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <PenTool className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Upload Tanda Tangan (TTD)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Tampil pada kolom "Di Setuju oleh"
                </p>

                <div className="h-28 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 overflow-hidden">
                  {ttdUrl ? (
                    <img
                      src={ttdUrl}
                      alt="TTD Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <PenTool className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[11px]">Belum ada TTD</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={ttdInputRef}
                  onChange={(e) => handleFileUpload(e, setTtdUrl)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => ttdInputRef.current?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{ttdUrl ? 'Ganti TTD' : 'Pilih TTD'}</span>
                </button>
                {ttdUrl && (
                  <button
                    type="button"
                    onClick={() => setTtdUrl('')}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg"
                    title="Hapus TTD"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. UPLOAD STEMPEL TOKO */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Stamp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Upload Stempel Toko
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Tampil berpadu dengan TTD pimpinan
                </p>

                <div className="h-28 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 overflow-hidden">
                  {stempelUrl ? (
                    <img
                      src={stempelUrl}
                      alt="Stempel Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <Stamp className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[11px]">Belum ada stempel</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={stempelInputRef}
                  onChange={(e) => handleFileUpload(e, setStempelUrl)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => stempelInputRef.current?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{stempelUrl ? 'Ganti Stempel' : 'Pilih Stempel'}</span>
                </button>
                {stempelUrl && (
                  <button
                    type="button"
                    onClick={() => setStempelUrl('')}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg"
                    title="Hapus Stempel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Simpan Pengaturan */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Cadangkan & Pulihkan Data */}
      {(onExportData || onImportData) && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Cadangkan & Pulihkan Data Lokal (Backup)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onExportData && (
              <button
                type="button"
                onClick={onExportData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Unduh Cadangan Data (JSON)</span>
              </button>
            )}

            {onImportData && (
              <>
                <input
                  type="file"
                  accept=".json"
                  ref={importInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImportData(f);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-slate-600" />
                  <span>Pulihkan Data dari Cadangan</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tentang Pengembang & Bagi Kopi */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-700/80">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg">
                Tentang Pengembang
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                Developer
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Aplikasi <strong>SLIP GAJI MTA</strong> dikembangkan oleh <strong>Jamhur</strong> untuk mempermudah perhitungan, cetak, dan rekapitulasi gaji karyawan.
            </p>
          </div>
        </div>

        {/* Kotak Bagi Kopi GoPay */}
        <div className="bg-slate-950/70 rounded-xl p-4 sm:p-5 border border-amber-500/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Coffee className="w-4 h-4" />
              <span>Dukung Pengembang / Bagi Kopi</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200">
              Bagi kopi ke GoPay <strong className="text-amber-300 font-mono text-sm sm:text-base">08179015181</strong> an <strong className="text-white">Jamhur</strong>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs sm:text-sm">
                GoPay: 08179015181
              </span>
              <span className="text-xs text-slate-400 font-medium">
                a.n. <strong className="text-slate-200">Jamhur</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('08179015181');
                setCopiedGopay(true);
                setTimeout(() => setCopiedGopay(false), 2500);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all"
            >
              {copiedGopay ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Nomor Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>Salin No. GoPay</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center sm:text-left leading-relaxed">
          Apresiasi dan dukungan Anda sangat berarti untuk terus merawat dan menyempurnakan aplikasi ini. Terima kasih banyak!
        </p>
      </div>
    </div>
  );
};
