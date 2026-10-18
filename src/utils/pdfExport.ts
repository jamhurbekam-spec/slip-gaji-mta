import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Extracts year and builds filename with format:
 * Slip_Gaji_[NamaKaryawan]_[Periode]_[Tahun].pdf
 */
export function getSlipPdfFilename(nama?: string, periode?: string, tanggal?: string): string {
  const cleanNama = (nama && nama !== '-' ? nama : 'Karyawan')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');

  const cleanPeriode = (periode && periode !== '-' ? periode : 'Periode')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');

  let tahun = String(new Date().getFullYear());
  if (tanggal && tanggal !== '-') {
    const matchYear = tanggal.match(/\b(20\d{2})\b/);
    if (matchYear) {
      tahun = matchYear[1];
    }
  }

  return `Slip_Gaji_${cleanNama}_${cleanPeriode}_${tahun}`;
}

/**
 * Exports the element with the given ID as a high-quality PDF.
 * Uses html-to-image (SVG foreignObject) to fully support modern CSS / Tailwind v4
 * without failing on oklch/lab color parsing.
 */
export async function exportSlipToPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element slip tidak ditemukan.');
  }

  // Wait for all images inside element to be fully loaded
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  // Convert DOM to high-res PNG data URL using native browser rendering
  // skipFonts: true prevents reading cross-origin Google Fonts stylesheets which throws security errors
  const imgData = await toPng(element, {
    quality: 0.98,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    cacheBust: false,
    skipFonts: true,
    fontEmbedCSS: '',
  });

  // Calculate dimensions from image
  const img = new Image();
  img.src = imgData;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(new Error('Gagal memproses gambar slip: ' + e));
  });

  const imgWidth = img.naturalWidth || img.width || 680;
  const imgHeight = img.naturalHeight || img.height || 800;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 12; // 12mm margin
  const targetWidth = pdfWidth - margin * 2;
  const targetHeight = (imgHeight * targetWidth) / imgWidth;

  // Add captured image to PDF
  pdf.addImage(imgData, 'PNG', margin, margin, targetWidth, targetHeight, undefined, 'FAST');

  const fullFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Create Blob and trigger direct browser download
  try {
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = fullFilename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    setTimeout(() => {
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (blobErr) {
    console.warn('Fallback to pdf.save():', blobErr);
    pdf.save(fullFilename);
  }
}

/**
 * Formats a clean WhatsApp message text for direct sharing without asking for phone numbers.
 */
export function formatSlipWhatsAppText(slip: any, companyName: string): string {
  const formatRp = (num: number) => `Rp ${(num || 0).toLocaleString('id-ID')}`;

  const lines = [
    `*SLIP GAJI KARYAWAN*`,
    companyName ? `*${companyName.toUpperCase()}*` : '',
    `--------------------------------`,
    `Nama: *${slip.nama || '-'}*`,
    `Jabatan: ${slip.jabatan || '-'}`,
    `NIK: ${slip.nik || '-'}`,
    `No. Slip: ${slip.nomorSlip || '-'}`,
    `Tanggal: ${slip.tanggal || '-'}`,
    `Periode: *${slip.periode || '-'}*`,
    `--------------------------------`,
    `*PENDAPATAN:*`,
    `• Gaji Pokok: ${formatRp(slip.gajiPokok)}`,
    slip.uangMakanPendapatan ? `• Uang Makan: ${formatRp(slip.uangMakanPendapatan)}` : '',
    slip.transport ? `• Transport: ${formatRp(slip.transport)}` : '',
    slip.thr ? `• THR: ${formatRp(slip.thr)}` : '',
    slip.bonus ? `• Bonus: ${formatRp(slip.bonus)}` : '',
    slip.lemburan ? `• Lemburan: ${formatRp(slip.lemburan)}` : '',
    slip.jamLembur ? `• Jam Lembur: ${slip.jamLembur} Jam` : '',
    slip.masukKerja ? `• Masuk Kerja: ${slip.masukKerja} Hari` : '',
    `*TOTAL PENDAPATAN: ${formatRp(slip.totalPendapatan)}*`,
    `--------------------------------`,
    `*PEMOTONGAN:*`,
    slip.pinjaman ? `• Pinjaman: ${formatRp(slip.pinjaman)}` : '',
    slip.bpjsKetenagakerjaan ? `• BPJS Ketenagakerjaan: ${formatRp(slip.bpjsKetenagakerjaan)}` : '',
    slip.pph21 ? `• PPh21: ${formatRp(slip.pph21)}` : '',
    slip.lainLain ? `• Lain-lain: ${formatRp(slip.lainLain)}` : '',
    slip.uangMakanPotongan ? `• Uang Makan: ${formatRp(slip.uangMakanPotongan)}` : '',
    `*TOTAL POTONGAN: ${formatRp(slip.totalPotongan)}*`,
    `================================`,
    `*GAJI BERSIH: ${formatRp(slip.gajiBersih)}*`,
    `================================`,
    `_Terima kasih atas dedikasi dan kerja keras Anda._`,
  ];

  return lines.filter(Boolean).join('\n');
}
