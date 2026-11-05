import React, { useState, useEffect } from 'react';
import { ResidentDuesCalculation } from '../../utils/arrears';
import { formatRupiah, formatMonthYearIndo, parseRupiahInput } from '../../utils/format';
import { X, Edit3, RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ManualArrearsModalProps {
  isOpen: boolean;
  onClose: () => void;
  calc: ResidentDuesCalculation | null;
  onSave: (residentId: string, monthKey: string, manualArrears: number | undefined, notes?: string) => void;
}

export const ManualArrearsModal: React.FC<ManualArrearsModalProps> = ({
  isOpen,
  onClose,
  calc,
  onSave,
}) => {
  const [useManual, setUseManual] = useState<boolean>(false);
  const [amountStr, setAmountStr] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (calc) {
      if (calc.isManualArrears) {
        setUseManual(true);
        setAmountStr(String(calc.tunggakanBulanLalu));
      } else {
        setUseManual(false);
        setAmountStr(String(calc.autoCalculatedArrears));
      }
      setNotes(calc.record?.notes || '');
    }
  }, [calc]);

  if (!isOpen || !calc) return null;

  const currentManualVal = parseRupiahInput(amountStr);
  const activeArrears = useManual ? currentManualVal : calc.autoCalculatedArrears;
  const simulatedTotal = (calc.resident.monthlyFee || 0) + activeArrears;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!useManual) {
      // Revert to automatic calculation (remove manual intervention)
      onSave(calc.resident.id, calc.monthKey, undefined, notes.trim() || undefined);
    } else {
      // Save manual intervention
      onSave(calc.resident.id, calc.monthKey, Math.max(0, currentManualVal), notes.trim() || undefined);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Intervensi Tunggakan Bulan Lalu</h3>
              <p className="text-xs text-slate-500">Sesuaikan atau koreksi tunggakan warga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warga info badge */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">{calc.resident.name}</h4>
            <p className="text-xs text-slate-500">{calc.resident.houseNumber}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
            {formatMonthYearIndo(calc.monthKey)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Radio selection: Otomatis vs Intervensi Manual */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Metode Perhitungan Tunggakan:
            </label>

            {/* Option 1: Otomatis dari sistem */}
            <div
              onClick={() => setUseManual(false)}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                !useManual
                  ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="arrearsMode"
                checked={!useManual}
                onChange={() => setUseManual(false)}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Otomatis Rekap Bulan Sebelumnya
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {formatRupiah(calc.autoCalculatedArrears)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dihitung otomatis dari akumulasi kewajiban bulan-bulan sebelumnya yang belum lunas.
                </p>
              </div>
            </div>

            {/* Option 2: Intervensi Manual */}
            <div
              onClick={() => setUseManual(true)}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                useManual
                  ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="arrearsMode"
                checked={useManual}
                onChange={() => setUseManual(true)}
                className="mt-0.5 text-amber-600 focus:ring-amber-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span>✏️</span> Intervensi Manual (Koreksi Bendahara)
                  </span>
                  {useManual && (
                    <span className="text-xs font-black text-amber-700">
                      {formatRupiah(currentManualVal)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tentukan nominal tunggakan khusus (misal: ada dispensasi RT, cicilan, atau data awal sebelum aplikasi).
                </p>
              </div>
            </div>
          </div>

          {/* If manual selected, show input */}
          {useManual && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-amber-900 block">
                Nominal Tunggakan Bulan Lalu (Rp):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  autoFocus
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => setAmountStr('0')}
                  className="text-[11px] px-2 py-1 rounded bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold"
                >
                  Set Rp 0 (Bebas Tunggakan)
                </button>
                <button
                  type="button"
                  onClick={() => setAmountStr(String(calc.resident.monthlyFee || 50000))}
                  className="text-[11px] px-2 py-1 rounded bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold"
                >
                  Set 1 Bulan ({formatRupiah(calc.resident.monthlyFee || 50000)})
                </button>
                <button
                  type="button"
                  onClick={() => setAmountStr(String(calc.autoCalculatedArrears))}
                  className="text-[11px] px-2 py-1 rounded bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Ambil Nilai Otomatis
                </button>
              </div>

              {/* Catatan / Keterangan intervensi */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Catatan / Alasan Penyesuaian (Opsional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Dispensasi RT / Cicilan / Koreksi saldo awal"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Simulation Box */}
          <div className="p-3 rounded-xl bg-slate-100/90 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Iuran Bulan Ini:</span>
              <span className="font-semibold">{formatRupiah(calc.resident.monthlyFee)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tunggakan Bulan Lalu ({useManual ? 'Intervensi Manual' : 'Otomatis'}):</span>
              <span className={`font-semibold ${useManual ? 'text-amber-700' : 'text-slate-800'}`}>
                {formatRupiah(activeArrears)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-sm text-slate-900">
              <span>Total Kewajiban Periode Ini:</span>
              <span className="text-emerald-700">{formatRupiah(simulatedTotal)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95"
            >
              Simpan Penyesuaian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
