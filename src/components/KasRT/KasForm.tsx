import React, { useState } from 'react';
import { Transaction, TransactionType } from '../../types';
import { getTodayDateString, formatRupiah } from '../../utils/format';
import { PlusCircle, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface KasFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const CATEGORIES_INCOME = [
  'Iuran Warga Bulanan',
  'Sumbangan Sukarela / Donasi',
  'Kas Awal / Saldo Awal',
  'Dana Operasional RW / Kelurahan',
  'Pendapatan Sewa Tenda & Sarana',
  'Bunga Bank',
  'Lain-lain',
];

export const CATEGORIES_EXPENSE = [
  'Kebersihan & Sampah',
  'Keamanan & Ronda Malam',
  'Perbaikan Lampu & Sarana',
  'Konsumsi Rapat & Kerja Bakti',
  'Santunan & Sosial Warga',
  'Operasional & ATK RT',
  'Kas RT ke RW',
  'Lain-lain',
];

export const KasForm: React.FC<KasFormProps> = ({ onAddTransaction }) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [type, setType] = useState<TransactionType>('pemasukan');
  const [category, setCategory] = useState<string>(CATEGORIES_INCOME[0]);
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  const currentCategories = type === 'pemasukan' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCats = newType === 'pemasukan' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;
    setCategory(newCats[0]);
  };

  const handleQuickAmount = (val: number) => {
    const current = parseInt(amountStr, 10) || 0;
    setAmountStr(String(current + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr, 10);
    if (!amount || amount <= 0) {
      alert('Mohon masukkan nominal transaksi yang valid.');
      return;
    }
    if (!description.trim()) {
      alert('Mohon tuliskan keterangan transaksi.');
      return;
    }

    const finalCategory = category === 'Lain-lain' && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    onAddTransaction({
      date,
      type,
      category: finalCategory,
      amount,
      description: description.trim(),
    });

    // Reset input with smooth success feedback
    setDescription('');
    setAmountStr('');
    setCustomCategory('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);
  };

  const numericAmount = parseInt(amountStr, 10) || 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Catat Transaksi Baru</h2>
            <p className="text-xs text-slate-500">Form input pencatatan kas RT masuk & keluar</p>
          </div>
        </div>

        {isSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Berhasil Disimpan!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Jenis Transaksi (Radio / Pill Toggle) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Jenis Transaksi *
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md">
            <button
              type="button"
              onClick={() => handleTypeChange('pemasukan')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                type === 'pemasukan'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pemasukan (+)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('pengeluaran')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                type === 'pengeluaran'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-600/30 ring-2 ring-rose-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pengeluaran (-)</span>
            </button>
          </div>
        </div>

        {/* Row 2: Tanggal, Kategori, Jumlah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tanggal Transaksi *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Transaksi *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition font-medium"
            >
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah (Rp) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Jumlah Nominal (Rp) *
              </label>
              {numericAmount > 0 && (
                <span className="text-xs font-bold text-emerald-600">
                  {formatRupiah(numericAmount)}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                min="1000"
                step="500"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Custom Category input if Lain-lain is chosen */}
        {category === 'Lain-lain' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Kategori Lainnya *
            </label>
            <input
              type="text"
              placeholder="Sebutkan kategori..."
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
            />
          </div>
        )}

        {/* Quick Amount Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">
            Pilihan Nominal Cepat (+):
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[25000, 50000, 100000, 200000, 500000, 1000000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 transition"
              >
                +{val >= 1000000 ? `${val / 1000000} Jt` : `${val / 1000} rb`}
              </button>
            ))}
            {amountStr && (
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-400 hover:text-rose-600 transition"
              >
                Reset Rp
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Keterangan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Keterangan Transaksi *
          </label>
          <input
            type="text"
            placeholder="Contoh: Honor petugas angkut sampah, Pembelian kabel lampu RT, Donasi Bpk Hendra..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm shadow-emerald-700/20 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simpan Transaksi Kas</span>
          </button>
        </div>
      </form>
    </div>
  );
};
