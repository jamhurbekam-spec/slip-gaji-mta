export interface Employee {
  id: string;
  nama: string;
  nik: string;
  jabatan: string;
  nomorSlipGaji: string;
  gajiPokok?: number;
  createdAt: number;
}

export interface CompanyProfile {
  namaPerusahaan: string;
  alamat: string;
  kecamatan: string;
  kabupatenKota: string;
  noTelepon?: string;
  logoUrl?: string; // base64 or object URL
  ttdUrl?: string; // base64 or object URL
  stempelUrl?: string; // base64 or object URL
  namaPimpinan?: string;
  tarifLemburPerJam?: number; // default Rp 12.000 / jam
}

export interface SlipGaji {
  id: string;
  employeeId?: string;
  // Identitas
  nama: string;
  jabatan: string;
  nik: string;
  nomorSlip: string;
  tanggal: string; // e.g. "18/10/2026" or "-"
  periode: string; // e.g. "Mei", "Oktober 2026"
  
  // Pendapatan
  gajiPokok: number;
  uangMakanPendapatan: number;
  transport: number;
  thr: number;
  bonus: number;
  lemburan: number;
  jamLembur: number; // e.g. 0
  masukKerja: number; // e.g. 24

  // Pemotongan
  pinjaman: number;
  bpjsKetenagakerjaan: number;
  pph21: number;
  lainLain: number;
  uangMakanPotongan: number;

  // Calculated totals
  totalPendapatan: number;
  totalPotongan: number;
  gajiBersih: number;

  createdAt: number;
  updatedAt: number;
}

export type ActiveTab = 'slip' | 'rekap' | 'karyawan' | 'pengaturan';
