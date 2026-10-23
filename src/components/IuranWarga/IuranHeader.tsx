import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  FileSpreadsheet,
  CheckCheck
} from 'lucide-react';
import { formatMonthYearIndo, formatRupiah, getPreviousMonthKey, getNextMonthKey, getCurrentMonthKey } from '../../utils/format';

interface IuranHeaderProps {
  selectedMonthKey: string;
  onSelectMonthKey: (key: string) => void;
  residentCount: number;
  totalTarget: number;
  totalCollected: number;
  totalArrears: number;
  paidCount: number;
  unpaidCount: number;
  onOpenAddResident: () => void;
  onMarkAllPaid?: () => void;
  onExportCsv?: () => void;
}

export const IuranHeader: React.FC<IuranHeaderProps> = ({
  selectedMonthKey,
  onSelectMonthKey,
  residentCount,
  totalTarget,
  totalCollected,
  totalArrears,
  paidCount,
  unpaidCount,
  onOpenAddResident,
  onMarkAllPaid,
  onExportCsv,
}) => {
  const currentMonthKey = getCurrentMonthKey();
  const isCurrentMonth = selectedMonthKey === currentMonthKey;
  const progressPercent = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  const handlePrev = () => onSelectMonthKey(getPreviousMonthKey(selectedMonthKey));
  const handleNext = () => onSelectMonthKey(getNextMonthKey(selectedMonthKey));
  const handleResetCurrent = () => onSelectMonthKey(currentMonthKey);

  return (
    <div className="space-y-4">
      {/* Month/Year Filter & Action Row */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition active:scale-95"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <input
                type="month"
                value={selectedMonthKey}
                onChange={(e) => e.target.value && onSelectMonthKey(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 font-extrabold text-sm sm:text-base text-slate-800 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition cursor-pointer"
              />
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition active:scale-95"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={handleResetCurrent}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 transition"
            >
              Kembali ke Bulan Ini
            </button>
          )}

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Periode: <strong className="text-slate-700">{formatMonthYearIndo(selectedMonthKey)}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="no-print flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95"
              title="Ekspor rekap iuran bulan ini ke CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>
          )}

          {onMarkAllPaid && unpaidCount > 0 && (
            <button
              onClick={onMarkAllPaid}
              className="no-print flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition active:scale-95"
              title="Tandai semua warga sebagai Lunas untuk bulan ini"
            >
              <CheckCheck className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">Tandai Semua Lunas</span>
              <span className="sm:hidden">Semua Lunas</span>
            </button>
          )}

          <button
            onClick={onOpenAddResident}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Data Warga</span>
          </button>
        </div>
      </div>

      {/* Summary Cards of Current Month */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Warga */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total Warga</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-base sm:text-2xl font-black text-slate-800 mt-1 sm:mt-2 truncate">
            {residentCount} <span className="text-xs font-semibold text-slate-500">KK</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Terdaftar dalam kas RT</p>
        </div>

        {/* Target Kewajiban */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Target Kewajiban</span>
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
          </div>
          <div className="text-base sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2 truncate">
            {formatRupiah(totalTarget)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Iuran + Tunggakan</p>
        </div>

        {/* Terkumpul (Lunas) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Terkumpul (Lunas)</span>
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-base sm:text-2xl font-black text-emerald-600 mt-1 sm:mt-2 truncate">
            {formatRupiah(totalCollected)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium mt-0.5 truncate">
            {paidCount} warga ({progressPercent}%)
          </p>
        </div>

        {/* Sisa Terutang */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-rose-100 shadow-xs bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Sisa Terutang</span>
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
          </div>
          <div className="text-base sm:text-2xl font-black text-rose-600 mt-1 sm:mt-2 truncate">
            {formatRupiah(totalArrears)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-rose-700 font-medium mt-0.5 truncate">
            {unpaidCount} warga belum lunas
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span>Progres Pembayaran Bulan {formatMonthYearIndo(selectedMonthKey)}</span>
          <span className="text-emerald-700 font-bold">{progressPercent}% Terkumpul</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
