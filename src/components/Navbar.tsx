import React from 'react';
import { RTSettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  BookOpen, 
  Wallet, 
  Users, 
  Printer, 
  Settings as SettingsIcon, 
  Database,
  Calendar
} from 'lucide-react';
import { formatRupiah, formatMonthYearIndo } from '../utils/format';

interface NavbarProps {
  activeTab: 'kas' | 'iuran';
  setActiveTab: (tab: 'kas' | 'iuran') => void;
  settings: RTSettings;
  balance: number;
  unpaidCount: number;
  selectedMonthKey: string;
  isOnlineConnected: boolean;
  onOpenSupabase: () => void;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  balance,
  unpaidCount,
  selectedMonthKey,
  isOnlineConnected,
  onOpenSupabase,
  onOpenSettings,
  onOpenBackup,
}) => {
  return (
    <header className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-md sticky top-0 z-40 border-b border-emerald-600/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar with branding & quick tools */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
              <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-lg tracking-tight leading-none text-white truncate">
                  Buku Kas RT
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 uppercase tracking-wider">
                  PWA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-0.5 truncate">
                <span>RT {settings.rtNumber}/RW {settings.rwNumber}</span>
                <span className="mx-1">•</span>
                <span className="text-emerald-200/90">{settings.subdistrict}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Supabase Online Status Button */}
            <button
              onClick={onOpenSupabase}
              className={`no-print flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition border active:scale-95 ${
                isOnlineConnected
                  ? 'bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 border-emerald-400/50 shadow-xs'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
              }`}
              title="Hubungkan ke Database PostgreSQL Supabase"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isOnlineConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isOnlineConnected ? 'Online Supabase' : 'Hubungkan Cloud'}
              </span>
            </button>

            <PWAInstallButton />

            <button
              onClick={() => window.print()}
              className="no-print hidden md:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/20 font-medium transition active:scale-95"
              title="Cetak Laporan / Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            <button
              onClick={onOpenBackup}
              className="no-print p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 font-medium transition flex items-center gap-1 active:scale-95"
              title="Backup, Ekspor CSV, Impor & Standalone HTML"
            >
              <span className="hidden sm:inline">Data & Backup</span>
              <span className="sm:hidden text-[11px] font-bold">Data</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="no-print p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 font-medium transition flex items-center gap-1 active:scale-95"
              title="Pengaturan RT"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-2 border-t border-emerald-600/50 mt-3 pt-2.5">
          <nav className="flex items-center gap-2 sm:gap-3 flex-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('kas')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'kas'
                  ? 'bg-white text-emerald-800 shadow-md shadow-emerald-950/20 translate-y-[-1px]'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1. KAS RT</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold hidden md:inline ${
                activeTab === 'kas' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-900/40 text-emerald-200'
              }`}>
                {formatRupiah(balance)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('iuran')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'iuran'
                  ? 'bg-white text-emerald-800 shadow-md shadow-emerald-950/20 translate-y-[-1px]'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 text-teal-600 shrink-0" />
              <span>2. IURAN WARGA</span>
              {unpaidCount > 0 ? (
                <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 ${
                  activeTab === 'iuran' ? 'bg-amber-100 text-amber-900' : 'bg-amber-500/80 text-white'
                }`}>
                  {unpaidCount} Terutang
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/30 text-emerald-200 hidden sm:inline whitespace-nowrap shrink-0">
                  Lunas
                </span>
              )}
            </button>
          </nav>

          {/* Active Period Quick Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-100 bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-medium">Periode: {formatMonthYearIndo(selectedMonthKey)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
