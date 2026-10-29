import React from 'react';
import { CompanyProfile, SlipGaji } from '../types';
import { formatRupiah, formatDisplayDate } from '../utils/formatters';

interface SlipPreviewProps {
  slip: Partial<SlipGaji>;
  company: CompanyProfile;
  printableId?: string;
  className?: string;
}

export const SlipPreview: React.FC<SlipPreviewProps> = ({
  slip,
  company,
  printableId = 'printable-slip',
  className = '',
}) => {
  // Safe field values
  const nama = slip.nama || '-';
  const jabatan = slip.jabatan || '-';
  const nik = slip.nik || '-';
  const nomorSlip = slip.nomorSlip || '-';
  const tanggal = formatDisplayDate(slip.tanggal || '-');
  const periode = slip.periode || '-';

  const gajiPokok = slip.gajiPokok ?? 0;
  const uangMakanPendapatan = slip.uangMakanPendapatan ?? 0;
  const transport = slip.transport ?? 0;
  const thr = slip.thr ?? 0;
  const bonus = slip.bonus ?? 0;
  const lemburan = slip.lemburan ?? 0;
  const jamLembur = slip.jamLembur ?? 0;
  const masukKerja = slip.masukKerja ?? 0;

  const pinjaman = slip.pinjaman ?? 0;
  const bpjs = slip.bpjsKetenagakerjaan ?? 0;
  const pph21 = slip.pph21 ?? 0;
  const lainLain = slip.lainLain ?? 0;
  const uangMakanPotongan = slip.uangMakanPotongan ?? 0;

  const totalPendapatan =
    slip.totalPendapatan !== undefined
      ? slip.totalPendapatan
      : gajiPokok + uangMakanPendapatan + transport + thr + bonus + lemburan;

  const totalPotongan =
    slip.totalPotongan !== undefined
      ? slip.totalPotongan
      : pinjaman + bpjs + pph21 + lainLain + uangMakanPotongan;

  const gajiBersih =
    slip.gajiBersih !== undefined ? slip.gajiBersih : totalPendapatan - totalPotongan;

  return (
    <div
      id={printableId}
      className={`bg-white text-black font-sans leading-tight shadow-sm select-none ${className}`}
      style={{
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Outer Table container with black borders */}
      <div className="border-2 border-black divide-y-2 divide-black">
        {/* ROW 1: HEADER (TITLE LEFT, COMPANY RIGHT) */}
        <div
          className="grid grid-cols-2 divide-x-2 divide-black"
          style={{ minHeight: '94px' }}
        >
          {/* Top-Left: LOGO & SLIP GAJI KARYAWAN (No collision) */}
          <div
            className="p-3 sm:p-3.5 flex flex-col justify-center items-start"
            style={{ boxSizing: 'border-box' }}
          >
            {company.logoUrl || true ? (
              <div
                className="overflow-hidden flex items-center justify-start mb-2"
                style={{
                  height: '44px',
                  maxHeight: '44px',
                  maxWidth: '190px',
                  width: 'auto',
                  flexShrink: 0,
                }}
              >
                <img
                  src={company.logoUrl || '/logo_mta.png'}
                  alt="Logo Perusahaan"
                  className="object-contain block"
                  style={{
                    height: '100%',
                    maxHeight: '44px',
                    maxWidth: '190px',
                    width: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            ) : null}
            <div style={{ width: '100%', flexShrink: 0 }}>
              <h1
                className="font-black tracking-wide text-black uppercase font-['Plus_Jakarta_Sans',sans-serif]"
                style={{
                  fontSize: '20px',
                  lineHeight: '24px',
                  margin: 0,
                  fontWeight: 900,
                  letterSpacing: '0.025em',
                }}
              >
                SLIP GAJI KARYAWAN
              </h1>
            </div>
          </div>

          {/* Top-Right: COMPANY INFO */}
          <div
            className="p-3 sm:p-3.5 flex flex-col justify-center"
            style={{ boxSizing: 'border-box' }}
          >
            <h2
              className="font-black uppercase text-black font-['Plus_Jakarta_Sans',sans-serif]"
              style={{
                fontSize: '15px',
                lineHeight: '19px',
                fontWeight: 900,
                marginBottom: '4px',
              }}
            >
              {company.namaPerusahaan || 'NAMA PERUSAHAAN'}
            </h2>
            <div className="text-xs text-neutral-800 leading-snug space-y-0.5">
              {company.alamat ? (
                <div>{company.alamat}</div>
              ) : (
                <div className="text-neutral-400 italic">Alamat Perusahaan</div>
              )}
              {company.kecamatan || company.kabupatenKota ? (
                <div>
                  {[
                    company.kecamatan ? `Kec. ${company.kecamatan}` : '',
                    company.kabupatenKota,
                  ]
                    .filter(Boolean)
                    .join(' - ')}
                </div>
              ) : (
                <div className="text-neutral-400 italic">Kecamatan, Kabupaten/Kota</div>
              )}
              {company.noTelepon && (
                <div className="text-neutral-600 font-medium">Telp: {company.noTelepon}</div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: IDENTITAS KARYAWAN (Rapi & Titik Dua Sejajar Sempurna) */}
        <div className="grid grid-cols-2 divide-x-2 divide-black text-xs sm:text-sm">
          {/* Kolom Kiri Identitas */}
          <div className="divide-y divide-neutral-300">
            <div className="flex px-3 py-1.5 items-center">
              <span className="w-20 font-bold text-neutral-900 shrink-0">NAMA</span>
              <span className="w-3 text-center font-bold text-neutral-900 shrink-0">:</span>
              <span className="font-semibold text-neutral-950 uppercase truncate flex-1 pl-1">
                {nama}
              </span>
            </div>
            <div className="flex px-3 py-1.5 items-center">
              <span className="w-20 font-bold text-neutral-900 shrink-0">JABATAN</span>
              <span className="w-3 text-center font-bold text-neutral-900 shrink-0">:</span>
              <span className="font-semibold text-neutral-950 uppercase truncate flex-1 pl-1">
                {jabatan}
              </span>
            </div>
            <div className="flex px-3 py-1.5 items-center">
              <span className="w-20 font-bold text-neutral-900 shrink-0">NIK</span>
              <span className="w-3 text-center font-bold text-neutral-900 shrink-0">:</span>
              <span className="font-medium text-neutral-800 flex-1 pl-1">{nik}</span>
            </div>
          </div>

          {/* Kolom Kanan Identitas */}
          <div className="divide-y divide-neutral-300">
            <div className="flex px-3 py-1.5 items-center">
              <span className="w-24 font-bold text-neutral-900 shrink-0">SLIP GAJI</span>
              <span className="w-3 text-center font-bold text-neutral-900 shrink-0">:</span>
              <span className="font-semibold text-neutral-950 flex-1 pl-1">{nomorSlip}</span>
            </div>
            <div className="flex px-3 py-1.5 items-center">
              <span className="w-24 font-bold text-neutral-900 shrink-0">TANGGAL</span>
              <span className="w-3 text-center font-bold text-neutral-900 shrink-0">:</span>
              <span className="font-medium text-neutral-800 flex-1 pl-1">{tanggal}</span>
            </div>
            <div className="flex px-3 py-1.5 items-center">
              <span className="w-24 font-bold text-neutral-900 shrink-0">PERIODE</span>
              <span className="w-3 text-center font-bold text-neutral-900 shrink-0">:</span>
              <span className="font-semibold text-neutral-950 flex-1 pl-1">{periode}</span>
            </div>
          </div>
        </div>

        {/* ROW 3: HEADER PENDAPATAN & PEMOTONGAN */}
        <div className="grid grid-cols-2 divide-x-2 divide-black text-xs sm:text-sm font-black uppercase bg-neutral-50 tracking-wider">
          <div className="px-3 py-2 text-neutral-950">PENDAPATAN</div>
          <div className="px-3 py-2 text-neutral-950">PEMOTONGAN</div>
        </div>

        {/* ROW 4: DETAIL PENDAPATAN & PEMOTONGAN (Titik Dua Sejajar Vertikal Rapi) */}
        <div className="grid grid-cols-2 divide-x-2 divide-black text-xs sm:text-sm">
          {/* Kolom Detail Pendapatan */}
          <div className="divide-y divide-neutral-200">
            <div className="flex items-center px-3 py-1.5">
              <span className="w-32 sm:w-36 text-neutral-900 font-normal shrink-0">Gaji Pokok</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(gajiPokok, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-32 sm:w-36 text-neutral-900 font-normal shrink-0">Uang Makan</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(uangMakanPendapatan, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-32 sm:w-36 text-neutral-900 font-normal shrink-0">Transport</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(transport, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-32 sm:w-36 text-neutral-900 font-normal shrink-0">THR</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(thr, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-32 sm:w-36 text-neutral-900 font-normal shrink-0">Bonus</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(bonus, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-32 sm:w-36 text-neutral-900 font-normal shrink-0">Lemburan</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(lemburan, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-32 sm:w-36 text-neutral-900 font-normal shrink-0">Jam Lembur</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {jamLembur > 0 ? `${jamLembur} Jam` : '0 Jam'}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-32 sm:w-36 text-neutral-900 font-normal shrink-0">Masuk Kerja</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {masukKerja > 0 ? `${masukKerja} hari` : '0 hari'}
              </span>
            </div>
          </div>

          {/* Kolom Detail Pemotongan */}
          <div className="divide-y divide-neutral-200">
            <div className="flex items-center px-3 py-1.5">
              <span className="w-36 sm:w-44 text-neutral-900 font-normal shrink-0">Pinjaman</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(pinjaman, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-36 sm:w-44 text-neutral-900 font-normal shrink-0">BPJS Ketenagakerjaan</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(bpjs, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-36 sm:w-44 text-neutral-900 font-normal shrink-0">PPh21</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(pph21, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-36 sm:w-44 text-neutral-900 font-normal shrink-0">Lain - lain</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(lainLain, true)}
              </span>
            </div>
            <div className="flex items-center px-3 py-1.5">
              <span className="w-36 sm:w-44 text-neutral-900 font-normal shrink-0">Uang Makan</span>
              <span className="w-3 text-center text-neutral-900 font-normal shrink-0">:</span>
              <span className="flex-1 text-right font-mono font-medium text-neutral-950">
                {formatRupiah(uangMakanPotongan, true)}
              </span>
            </div>
            {/* Empty matching rows to keep height balanced exactly as in the reference image */}
            <div className="px-3 py-1.5 h-[31px]"></div>
            <div className="px-3 py-1.5 h-[31px]"></div>
            <div className="px-3 py-1.5 h-[31px]"></div>
          </div>
        </div>

        {/* ROW 5: TOTAL PENDAPATAN & TOTAL POTONGAN (Titik Dua Sejajar) */}
        <div className="grid grid-cols-2 divide-x-2 divide-black text-xs sm:text-sm font-bold bg-neutral-50">
          <div className="flex items-center px-3 py-2">
            <span className="w-32 sm:w-36 uppercase tracking-wide shrink-0">TOTAL PENDAPATAN</span>
            <span className="w-3 text-center shrink-0">:</span>
            <span className="flex-1 text-right font-mono text-neutral-950 font-bold">
              {formatRupiah(totalPendapatan)}
            </span>
          </div>
          <div className="flex items-center px-3 py-2">
            <span className="w-36 sm:w-44 uppercase tracking-wide shrink-0">TOTAL POTONGAN</span>
            <span className="w-3 text-center shrink-0">:</span>
            <span className="flex-1 text-right font-mono text-neutral-950 font-bold">
              {formatRupiah(totalPotongan)}
            </span>
          </div>
        </div>

        {/* ROW 6: GAJI BERSIH (FULL WIDTH, Titik Dua Rapi, Tanpa Tanda Bintang) */}
        <div className="flex justify-between items-center px-4 py-2.5 text-sm sm:text-base font-black bg-neutral-100">
          <div className="flex items-center gap-2">
            <span className="tracking-wider uppercase">GAJI BERSIH</span>
            <span className="font-bold">:</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-base sm:text-lg">
            <span>Rp</span>
            <span>{Math.round(gajiBersih).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* SIGNATURE AREA (MATCHING REFERENCE IMAGE) */}
      <div className="border-x-2 border-b-2 border-t-2 border-black mt-[2px]">
        <div className="grid grid-cols-2 divide-x-2 divide-black text-xs sm:text-sm min-h-[145px]">
          {/* Kolom Kiri: Di Setuju oleh */}
          <div className="p-3 flex flex-col justify-between relative">
            <div className="font-medium text-neutral-900">Di Setuju oleh,</div>

            {/* Area TTD / Stempel overlay */}
            <div className="relative h-20 my-1 flex items-center justify-start pointer-events-none">
              {company.ttdUrl && (
                <img
                  src={company.ttdUrl}
                  alt="Tanda Tangan"
                  className="max-h-16 max-w-[130px] object-contain z-10 block"
                  style={{ maxHeight: '60px', maxWidth: '130px', objectFit: 'contain', display: 'block' }}
                />
              )}
              {company.stempelUrl && (
                <img
                  src={company.stempelUrl}
                  alt="Stempel Toko"
                  className={`max-h-20 max-w-[130px] object-contain opacity-85 block ${
                    company.ttdUrl ? 'absolute left-8 -top-1 z-20 mix-blend-multiply' : ''
                  }`}
                  style={{ maxHeight: '72px', maxWidth: '130px', objectFit: 'contain', display: 'block' }}
                />
              )}
            </div>

            {/* Titik-titik tanda tangan */}
            <div className="border-b border-dotted border-neutral-600 w-44 pt-1">
              <span className="text-[11px] text-neutral-700 font-medium">
                {company.namaPimpinan ? `( ${company.namaPimpinan} )` : ''}
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Diterima Oleh */}
          <div className="p-3 flex flex-col justify-between">
            <div className="font-medium text-neutral-900">Diterima Oleh,</div>

            {/* Space for employee signature */}
            <div className="h-20 my-1 flex items-center justify-start">
              {/* Blank space for physical signing or clean view */}
            </div>

            {/* Titik-titik tanda tangan penerima */}
            <div className="border-b border-dotted border-neutral-600 w-44 pt-1">
              <span className="text-[11px] text-neutral-800 font-semibold uppercase">
                {nama !== '-' ? `( ${nama} )` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
