import React from 'react';
import { ActiveTab } from '../types';
import { FileText, Users, Settings2, Receipt, FileSpreadsheet } from 'lucide-react';
import { PWAHeaderButton } from './PWAInstallBanner';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  slipCount: number;
  employeeCount: number;
  isOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  slipCount,
  employeeCount,
  isOnline = true,
}) => {
  return (
    <>
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo MTA CV. Mulia Tekhnik Abadi */}
            <div className="h-9 px-2 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-300 shrink-0">
              <img
                src="/logo_mta.png"
                alt="Logo MTA"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-wider leading-none text-white uppercase">
                  SLIP GAJI MTA
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/90 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{isOnline ? 'Cloud Online' : 'Lokal'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAHeaderButton />
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('slip')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'slip'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Slip Gaji {slipCount > 0 ? `(${slipCount})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('rekap')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'rekap'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Rekap Gaji</span>
            </button>
            <button
              onClick={() => setActiveTab('karyawan')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'karyawan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Data Karyawan {employeeCount > 0 ? `(${employeeCount})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('pengaturan')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'pengaturan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Pengaturan
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Bottom Navigation Bar for Mobile (Android Native feel - 4 Menus) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Menu 1: Slip Gaji */}
          <button
            onClick={() => setActiveTab('slip')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
              activeTab === 'slip'
                ? 'text-blue-600 font-bold bg-blue-50/70'
                : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <FileText className="w-5 h-5" />
              {slipCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {slipCount > 9 ? '9+' : slipCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-semibold">Slip Gaji</span>
          </button>

          {/* Menu 2: Rekap Gaji */}
          <button
            onClick={() => setActiveTab('rekap')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
              activeTab === 'rekap'
                ? 'text-emerald-600 font-bold bg-emerald-50/70'
                : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">Rekap Gaji</span>
          </button>

          {/* Menu 3: Data Karyawan */}
          <button
            onClick={() => setActiveTab('karyawan')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
              activeTab === 'karyawan'
                ? 'text-blue-600 font-bold bg-blue-50/70'
                : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Users className="w-5 h-5" />
              {employeeCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-slate-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {employeeCount > 9 ? '9+' : employeeCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-semibold">Karyawan</span>
          </button>

          {/* Menu 4: Pengaturan */}
          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
              activeTab === 'pengaturan'
                ? 'text-blue-600 font-bold bg-blue-50/70'
                : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <Settings2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">Pengaturan</span>
          </button>
        </div>
      </nav>
    </>
  );
};
