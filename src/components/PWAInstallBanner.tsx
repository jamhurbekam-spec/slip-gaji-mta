import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Smartphone, ArrowRight, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismiss } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or dismissed, do not show banner
  if (isInstalled || isDismissed) {
    return null;
  }

  // If neither installable via Chromium prompt nor iOS, still provide manual guide option if on mobile
  const canShow = isInstallable || isIOS;
  if (!canShow) {
    return null;
  }

  return (
    <>
      {/* Floating or Top Install Notification Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-2.5 shadow-md border-b border-blue-600/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate text-white leading-tight">
                Pasang Aplikasi Slip Gaji MTA
              </p>
              <p className="text-[11px] text-blue-100 hidden sm:block truncate">
                Akses cepat langsung dari layar utama HP / Laptop tanpa buka browser!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstallable ? (
              <button
                type="button"
                onClick={install}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-800 hover:bg-blue-50 active:bg-blue-100 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Sekarang</span>
              </button>
            ) : isIOS ? (
              <button
                type="button"
                onClick={() => setShowIOSModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-800 hover:bg-blue-50 active:bg-blue-100 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cara Install (iOS)</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={dismiss}
              aria-label="Tutup notifikasi install"
              className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Install di iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Ketuk tombol Bagikan (Share)</p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    Ikon kotak bertanda panah ke atas <Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> di bilah Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Pilih Tambah ke Layar Utama</p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    Pilih opsi <strong className="text-slate-700">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>Aplikasi akan terpasang di layar depan HP Anda dan bisa dibuka secara instan!</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAHeaderButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-500/30 border border-blue-400/30 transition-colors"
        title="Install Aplikasi ke Layar Utama"
      >
        <Download className="w-3 h-3" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSModal(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-500/30 border border-blue-400/30 transition-colors"
          title="Petunjuk Install di iPhone"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">Install App</span>
        </button>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-800">
              <h3 className="font-bold text-slate-900 text-sm mb-2">Install di iPhone / iPad</h3>
              <p className="text-xs text-slate-600 mb-4">
                Buka menu Share di Safari, lalu pilih <strong>Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
