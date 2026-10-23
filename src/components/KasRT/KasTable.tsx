import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';
import { formatRupiah, formatDateIndo, exportToCsvFile } from '../../utils/format';
import { 
  Search, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Download, 
  Filter, 
  AlertTriangle,
  FileSpreadsheet,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface KasTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export const KasTable: React.FC<KasTableProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  // Filter & sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (selectedType !== 'semua' && t.type !== selectedType) return false;
        if (selectedCategory !== 'semua' && t.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchDate = t.date.includes(q);
          if (!matchDesc && !matchCat && !matchDate) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, selectedType, selectedCategory, searchQuery, sortBy]);

  // Totals for filtered transactions
  const filteredIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const filteredExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const handleExportCsv = () => {
    const headers = ['No', 'Tanggal', 'Jenis Transaksi', 'Kategori', 'Keterangan', 'Pemasukan (Rp)', 'Pengeluaran (Rp)'];
    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      t.date,
      t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.description,
      t.type === 'pemasukan' ? t.amount : 0,
      t.type === 'pengeluaran' ? t.amount : 0,
    ]);
    exportToCsvFile(`laporan-kas-rt-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-3.5 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>📋</span> Riwayat Transaksi Kas RT
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredTransactions.length} dari {transactions.length} total transaksi
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* View mode toggle (HP / Desktop) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Tampilan Kartu (Nyaman di HP)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px]">Kartu</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="text-[11px]">Tabel</span>
              </button>
              {viewMode !== 'auto' && (
                <button
                  onClick={() => setViewMode('auto')}
                  className="text-[10px] text-slate-400 hover:text-slate-700 px-1.5"
                  title="Kembalikan ke mode otomatis"
                >
                  Auto
                </button>
              )}
            </div>

            <button
              onClick={handleExportCsv}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95"
              title="Ekspor tabel ini ke file Excel/CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari keterangan / kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Filter Jenis */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition font-medium"
            >
              <option value="semua">Semua Jenis (Masuk & Keluar)</option>
              <option value="pemasukan">📥 Hanya Pemasukan</option>
              <option value="pengeluaran">📤 Hanya Pengeluaran</option>
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition font-medium text-slate-700"
            >
              <option value="semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition font-medium text-slate-700"
            >
              <option value="date-desc">Tanggal Terkini</option>
              <option value="date-asc">Tanggal Terlama</option>
              <option value="amount-desc">Nominal Terbesar</option>
              <option value="amount-asc">Nominal Terkecil</option>
            </select>
          </div>
        </div>

        {/* Filter stats pill if active */}
        {(selectedType !== 'semua' || selectedCategory !== 'semua' || searchQuery) && (
          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-600 font-medium">
              Hasil Filter: <strong>{filteredTransactions.length}</strong> data • Masuk:{' '}
              <span className="text-emerald-600 font-bold">{formatRupiah(filteredIncome)}</span> • Keluar:{' '}
              <span className="text-rose-600 font-bold">{formatRupiah(filteredExpense)}</span>
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('semua');
                setSelectedCategory('semua');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. TAMPILAN KARTU HP (RESPONSIVE MOBILE VIEW - TIDAK TERPOTONG SAMA SEKALI) */}
      {/* ========================================================================= */}
      <div className={`p-3 space-y-2.5 ${viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block sm:hidden'}`}>
        {filteredTransactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 space-y-1">
            <p className="text-2xl">🔍</p>
            <p className="font-semibold text-slate-600 text-sm">Tidak ada transaksi ditemukan</p>
            <p className="text-xs">Coba ganti kata kunci pencarian atau reset filter.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'pemasukan';
            return (
              <div
                key={`tx-card-${tx.id}`}
                className={`p-3.5 rounded-2xl border transition-all shadow-xs bg-white ${
                  isIncome ? 'border-emerald-200/70 hover:border-emerald-300' : 'border-rose-200/70 hover:border-rose-300'
                }`}
              >
                {/* Top: Date + Type Badge + Nominal Amount */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                      )}
                      <span>{isIncome ? 'Masuk' : 'Keluar'}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {formatDateIndo(tx.date)}
                    </span>
                  </div>

                  {/* Large Nominal (Right-aligned, never cut off) */}
                  <div
                    className={`text-sm sm:text-base font-black ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                  </div>
                </div>

                {/* Middle: Category & Description */}
                <div className="py-2 space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {tx.category}
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {tx.description}
                  </p>
                </div>

                {/* Bottom: Action bar */}
                <div className="flex justify-end pt-1 border-t border-slate-100/80 no-print">
                  <button
                    onClick={() => setDeleteId(tx.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1"
                    title="Hapus transaksi ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. TAMPILAN TABEL DESKTOP / TABLET (TETAP RAPI PADA LAYAR LEBAR) */}
      {/* ========================================================================= */}
      <div className={`overflow-x-auto ${viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden sm:block'}`}>
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Jenis</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 min-w-[200px]">Keterangan</th>
              <th className="py-3 px-4 text-right">Jumlah (Rp)</th>
              <th className="py-3 px-4 text-center w-16 no-print">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-2xl">🔍</p>
                    <p className="font-semibold text-slate-600">Tidak ada transaksi ditemukan</p>
                    <p className="text-xs text-slate-400">
                      Coba ganti kata kunci pencarian atau reset filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => {
                const isIncome = tx.type === 'pemasukan';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-medium text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {formatDateIndo(tx.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isIncome
                            ? 'bg-emerald-100/80 text-emerald-800'
                            : 'bg-rose-100/80 text-rose-800'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{isIncome ? 'Pemasukan' : 'Pengeluaran'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium leading-relaxed">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-black whitespace-nowrap text-sm ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-center no-print">
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                        title="Hapus transaksi ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hapus Transaksi?</h4>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Transaksi kas ini akan dihapus dari buku kas RT dan saldo akan dihitung ulang secara otomatis.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
