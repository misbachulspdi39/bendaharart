import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, Scale } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

interface KasSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export const KasSummary: React.FC<KasSummaryProps> = ({
  totalIncome,
  totalExpense,
  balance,
  transactionCount,
}) => {
  const isHealthy = balance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
      {/* 1. Total Pemasukan */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-xs hover:shadow-sm transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            Total Pemasukan
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
            {formatRupiah(totalIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Semua dana kas yang masuk</span>
          </p>
        </div>
      </div>

      {/* 2. Total Pengeluaran */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100/80 shadow-xs hover:shadow-sm transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
            Total Pengeluaran
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
            {formatRupiah(totalExpense)}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <Scale className="w-3.5 h-3.5 text-rose-500" />
            <span>Semua pengeluaran & operasional</span>
          </p>
        </div>
      </div>

      {/* 3. Saldo Akhir */}
      <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs hover:shadow-sm transition group ${
        isHealthy
          ? 'bg-gradient-to-br from-white via-white to-teal-50/70 border-teal-200'
          : 'bg-gradient-to-br from-white via-white to-amber-50/70 border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
            isHealthy ? 'text-teal-800 bg-teal-100/70' : 'text-amber-800 bg-amber-100'
          }`}>
            Saldo Akhir Kas RT
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${
            isHealthy ? 'bg-teal-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${
            isHealthy ? 'text-slate-900' : 'text-amber-700'
          }`}>
            {formatRupiah(balance)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {isHealthy ? 'Pemasukan - Pengeluaran' : 'Kas mengalami defisit'} • {transactionCount} transaksi
          </p>
        </div>
      </div>
    </div>
  );
};
