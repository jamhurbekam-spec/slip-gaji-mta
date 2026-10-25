import React, { useState, useRef, useEffect } from 'react';
import { CompanyProfile, SlipGaji } from '../types';
import { SlipPreview } from './SlipPreview';
import { exportSlipToPdf, formatSlipWhatsAppText, getSlipPdfFilename } from '../utils/pdfExport';
import {
  Printer,
  Download,
  Share2,
  X,
  Copy,
  Check,
  Loader2,
  FileText,
  Trash2,
  AlertTriangle,
  Smartphone,
  ZoomIn,
} from 'lucide-react';

interface SlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  slip: Partial<SlipGaji> | null;
  company: CompanyProfile;
  onDelete?: (id: string) => void;
}

export const SlipModal: React.FC<SlipModalProps> = ({
  isOpen,
  onClose,
  slip,
  company,
  onDelete,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Responsive scale state for Android / mobile screen preview without horizontal slide
  const [scale, setScale] = useState<number>(1);
  const [isFitScreen, setIsFitScreen] = useState<boolean>(true);
  const [docHeight, setDocHeight] = useState<number>(850);
  const containerRef = useRef<HTMLDivElement>(null);
  const slipWrapperRef = useRef<HTMLDivElement>(null);

  // Measure container and calculate fit scale factor
  useEffect(() => {
    if (!isOpen) return;

    const calculateScale = () => {
      if (!containerRef.current) return;
      const clientWidth = containerRef.current.clientWidth;
      // Account for 16px horizontal padding inside container
      const availableWidth = Math.max(200, clientWidth - 16);
      const targetWidth = 680; // Standard document width

      if (availableWidth < targetWidth && isFitScreen) {
        const calculatedScale = Math.min(1, availableWidth / targetWidth);
        setScale(calculatedScale);
      } else {
        setScale(1);
      }

      // Update document height for proportional wrapper to ensure full visibility from header to footer
      if (slipWrapperRef.current) {
        const h = Math.max(
          slipWrapperRef.current.scrollHeight,
          slipWrapperRef.current.offsetHeight,
          slipWrapperRef.current.clientHeight,
          800
        );
        if (h > 0) setDocHeight(h);
      }
    };

    calculateScale();
    const t1 = setTimeout(calculateScale, 50);
    const t2 = setTimeout(calculateScale, 200);
    const t3 = setTimeout(calculateScale, 600);

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (slipWrapperRef.current) {
      resizeObserver.observe(slipWrapperRef.current);
    }

    window.addEventListener('resize', calculateScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, [isOpen, isFitScreen, slip, company]);

  if (!isOpen || !slip) return null;

  // Filename: Slip_Gaji_[NamaKaryawan]_[Periode]_[Tahun]
  const filename = getSlipPdfFilename(slip.nama, slip.periode, slip.tanggal);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      // Capture from dedicated unscaled 680px element to ensure pristine resolution without mobile distortion
      await exportSlipToPdf('pdf-export-slip-target', filename);
    } catch (err) {
      console.error('Gagal membuat PDF, beralih ke dialog cetak:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    const text = formatSlipWhatsAppText(slip, company.namaPerusahaan);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct WhatsApp sharing without phone prompt
  const handleShareWaDirect = () => {
    const text = formatSlipWhatsAppText(slip, company.namaPerusahaan);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleConfirmDelete = () => {
    if (slip.id && onDelete) {
      onDelete(slip.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[96vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-base font-bold leading-tight truncate max-w-[200px] sm:max-w-none">
                Preview Slip Gaji
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                {slip.nama || 'Tanpa Nama'} - {slip.periode || 'Periode'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mobile scale toggle: Pas Layar vs Zoom 100% */}
            <button
              onClick={() => setIsFitScreen(!isFitScreen)}
              className="inline-flex sm:hidden items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 hover:text-white text-[11px] font-medium border border-slate-700"
              title={isFitScreen ? 'Perbesar ke ukuran 100%' : 'Sesuaikan ke layar HP'}
            >
              {isFitScreen ? (
                <>
                  <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>Zoom 100%</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pas Layar</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Action Buttons Bar */}
        <div className="bg-slate-50 px-3 sm:px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all disabled:opacity-60"
              title={`Simpan sebagai ${filename}.pdf`}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Simpan PDF</span>
                </>
              )}
            </button>

            {/* Bagikan Langsung ke WA */}
            <button
              onClick={handleShareWaDirect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all"
              title="Bagikan rincian slip langsung ke WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan WA</span>
            </button>

            {/* Hapus Slip jika ada onDelete */}
            {slip.id && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 text-xs sm:text-sm font-semibold rounded-lg transition-colors"
                title="Hapus slip ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Hapus Slip</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salin Teks</span>
                  <span className="sm:hidden">Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body - Slip Document Preview */}
        {/* On Android/mobile, scales to 100% of available viewport width so user sees EVERYTHING WITHOUT SLIDING! */}
        <div
          ref={containerRef}
          className={`p-2 sm:p-5 overflow-y-auto ${
            isFitScreen ? 'overflow-x-hidden' : 'overflow-x-auto'
          } bg-slate-200/90 flex justify-center items-start flex-1`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div
            className="flex justify-center items-start my-auto sm:my-2"
            style={{
              width: scale < 1 && isFitScreen ? `${Math.ceil(680 * scale)}px` : '680px',
              minWidth: scale < 1 && isFitScreen ? `${Math.ceil(680 * scale)}px` : '680px',
              height: scale < 1 && isFitScreen ? `${Math.ceil(docHeight * scale) + 24}px` : `${docHeight + 24}px`,
              position: 'relative',
              transition: 'width 0.15s ease, height 0.15s ease',
            }}
          >
            <div
              ref={slipWrapperRef}
              className="shadow-2xl bg-white"
              style={{
                width: '680px',
                minWidth: '680px',
                maxWidth: '680px',
                position: scale < 1 && isFitScreen ? 'absolute' : 'relative',
                top: 0,
                left: 0,
                transform: scale < 1 && isFitScreen ? `scale(${scale})` : 'none',
                transformOrigin: 'top left',
                transition: 'transform 0.15s ease',
              }}
            >
              <SlipPreview
                slip={slip}
                company={company}
                printableId="modal-slip-preview"
              />
            </div>
          </div>
        </div>

        {/* Dedicated unscaled 680px export element: Guarantees high-resolution PDF download with no mobile scaling glitches */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '680px',
            minWidth: '680px',
            maxWidth: '680px',
            opacity: 0.001,
            pointerEvents: 'none',
            zIndex: -999,
            backgroundColor: '#ffffff',
          }}
          aria-hidden="true"
        >
          <SlipPreview
            slip={slip}
            company={company}
            printableId="pdf-export-slip-target"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 shrink-0">
          <span className="truncate mr-2 font-mono">{filename}.pdf</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 text-xs shrink-0"
          >
            Tutup
          </button>
        </div>

        {/* Delete Confirmation Popup in SlipModal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Apakah Anda Yakin Ingin Menghapus?
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Slip gaji untuk <strong className="text-slate-800">{slip.nama}</strong> ({slip.periode}) akan dihapus secara permanen dari perangkat dan cloud online.
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
                >
                  Ya, Hapus Slip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
