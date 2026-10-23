import React from 'react';
import { ResidentDuesCalculation } from '../utils/arrears';
import { formatRupiah, formatMonthYearIndo, getTodayDateString } from '../utils/format';
import { Wallet, CheckCircle, ArrowRight, X } from 'lucide-react';

interface RecordToCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  dues: ResidentDuesCalculation | null;
  onConfirm: (recordToCash: boolean) => void;
}

export const RecordToCashModal: React.FC<RecordToCashModalProps> = ({
  isOpen,
  onClose,
  dues,
  onConfirm,
}) => {
  if (!isOpen || !dues) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 text-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Konfirmasi Pelunasan Iuran</h3>
              <p className="text-xs text-slate-500">{dues.resident.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Warga:</span>
            <span className="font-bold text-slate-800">{dues.resident.name} ({dues.resident.houseNumber})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Periode:</span>
            <span className="font-bold text-slate-800">{formatMonthYearIndo(dues.monthKey)}</span>
          </div>
          {dues.tunggakanBulanLalu > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Termasuk Tunggakan:</span>
              <span className="font-bold">{formatRupiah(dues.tunggakanBulanLalu)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-slate-200/80 text-sm font-extrabold text-emerald-700">
            <span>Total Dibayar:</span>
            <span>{formatRupiah(dues.totalKewajiban)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Apakah Anda ingin langsung mencatat pembayaran sebesar <strong>{formatRupiah(dues.totalKewajiban)}</strong> ini ke dalam <strong>Buku Kas RT</strong> sebagai transaksi pemasukan?
        </p>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => onConfirm(true)}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Ya, Catat Otomatis ke Kas RT</span>
          </button>

          <button
            onClick={() => onConfirm(false)}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Hanya Ubah Status Iuran (Jangan Catat Kas)
          </button>
        </div>
      </div>
    </div>
  );
};
