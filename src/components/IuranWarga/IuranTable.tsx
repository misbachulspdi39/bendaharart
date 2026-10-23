import React, { useState, useMemo } from 'react';
import { Resident, IuranStatus, RTSettings } from '../../types';
import { ResidentDuesCalculation } from '../../utils/arrears';
import { formatRupiah, formatMonthYearIndo } from '../../utils/format';
import { 
  Search, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  Phone
} from 'lucide-react';

interface IuranTableProps {
  calculations: ResidentDuesCalculation[];
  selectedMonthKey: string;
  settings: RTSettings;
  onToggleStatus: (residentId: string, currentStatus: IuranStatus, dues: ResidentDuesCalculation) => void;
  onEditResident: (resident: Resident) => void;
  onDeleteResident: (residentId: string) => void;
}

export const IuranTable: React.FC<IuranTableProps> = ({
  calculations,
  selectedMonthKey,
  settings,
  onToggleStatus,
  onEditResident,
  onDeleteResident,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'Lunas' | 'Terutang'>('semua');
  const [sortBy, setSortBy] = useState<'house' | 'name' | 'total-desc'>('house');
  const [deleteResidentId, setDeleteResidentId] = useState<string | null>(null);
  // View mode toggle: 'cards' is default on mobile, 'table' default on desktop
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

  const filteredCalculations = useMemo(() => {
    return calculations
      .filter((calc) => {
        if (statusFilter !== 'semua' && calc.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = calc.resident.name.toLowerCase().includes(q);
          const matchHouse = calc.resident.houseNumber.toLowerCase().includes(q);
          if (!matchName && !matchHouse) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.resident.name.localeCompare(b.resident.name);
        if (sortBy === 'house') return a.resident.houseNumber.localeCompare(b.resident.houseNumber);
        if (sortBy === 'total-desc') return b.totalKewajiban - a.totalKewajiban;
        return 0;
      });
  }, [calculations, statusFilter, searchQuery, sortBy]);

  const openWhatsApp = (calc: ResidentDuesCalculation) => {
    const phone = calc.resident.phone?.replace(/[^0-9]/g, '') || '';
    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    const monthName = formatMonthYearIndo(selectedMonthKey);
    let message = '';

    if (calc.status === 'Lunas') {
      message = `*BUKTI PEMBAYARAN IURAN RT ${settings.rtNumber} / RW ${settings.rwNumber}*\n\n` +
        `Yth. *${calc.resident.name}* (${calc.resident.houseNumber})\n` +
        `Terima kasih! Iuran kas RT untuk periode *${monthName}* sebesar *${formatRupiah(calc.totalKewajiban)}* telah kami terima dengan status *LUNAS* ✅.\n\n` +
        `Rincian:\n` +
        `- Iuran Bulan Ini: ${formatRupiah(calc.iuranBulanIni)}\n` +
        (calc.tunggakanBulanLalu > 0 ? `- Tunggakan Lalu: ${formatRupiah(calc.tunggakanBulanLalu)}\n` : '') +
        `- Total Dibayar: ${formatRupiah(calc.totalKewajiban)}\n\n` +
        `Salam,\nBendahara RT ${settings.rtNumber} (${settings.treasurerName || 'Pengurus RT'})`;
    } else {
      message = `*PEMBERITAHUAN IURAN RT ${settings.rtNumber} / RW ${settings.rwNumber}*\n\n` +
        `Yth. *${calc.resident.name}* (${calc.resident.houseNumber})\n` +
        `Kami informasikan rincian iuran kas RT untuk periode *${monthName}*:\n` +
        `- Iuran Bulan Ini: ${formatRupiah(calc.iuranBulanIni)}\n` +
        (calc.tunggakanBulanLalu > 0 ? `- Tunggakan Bulan Lalu: ${formatRupiah(calc.tunggakanBulanLalu)}\n` : '') +
        `*Total Kewajiban: ${formatRupiah(calc.totalKewajiban)}*\n` +
        `Status saat ini: *TERUTANG* ⏳\n\n` +
        `Mohon konfirmasi jika telah melakukan pembayaran. Terima kasih atas partisipasi dan kerjasamanya.\n\n` +
        `Salam hormat,\nBendahara RT ${settings.rtNumber} (${settings.treasurerName || 'Pengurus RT'})`;
    }

    const url = formattedPhone
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  const confirmDelete = () => {
    if (deleteResidentId) {
      onDeleteResident(deleteResidentId);
      setDeleteResidentId(null);
    }
  };

  const showCards = viewMode === 'cards' || (viewMode === 'auto');
  const showTable = viewMode === 'table' || (viewMode === 'auto');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Header & Search Filter */}
      <div className="p-3.5 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>👥</span> Rekap Iuran Bulan {formatMonthYearIndo(selectedMonthKey)}
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredCalculations.length} dari {calculations.length} warga
            </p>
          </div>

          {/* View mode toggle (HP / Desktop) */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
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
                title="Tampilan Tabel Lengkap"
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
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama warga / blok rumah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition font-medium text-slate-700"
            >
              <option value="semua">Semua Status (Lunas & Terutang)</option>
              <option value="Lunas">✅ Hanya Lunas</option>
              <option value="Terutang">⏳ Hanya Terutang</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition font-medium text-slate-700"
            >
              <option value="house">Urutkan Blok Rumah</option>
              <option value="name">Urutkan Nama (A-Z)</option>
              <option value="total-desc">Kewajiban Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAMPILAN KARTU HP (RESPONSIVE MOBILE VIEW - TIDAK TERPOTONG SAMA SEKALI) */}
      {/* ========================================================================= */}
      <div className={`p-3 space-y-3 ${viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block sm:hidden'}`}>
        {filteredCalculations.length === 0 ? (
          <div className="py-10 text-center text-slate-400 space-y-1">
            <p className="text-2xl">🔍</p>
            <p className="font-semibold text-slate-600 text-sm">Tidak ada warga ditemukan</p>
            <p className="text-xs">Coba ganti kata kunci pencarian atau filter.</p>
          </div>
        ) : (
          filteredCalculations.map((calc) => {
            const isPaid = calc.status === 'Lunas';
            const hasArrears = calc.tunggakanBulanLalu > 0;

            return (
              <div
                key={`card-${calc.resident.id}`}
                className={`p-3.5 rounded-2xl border transition-all shadow-xs ${
                  isPaid
                    ? 'bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200/80'
                    : 'bg-white border-slate-200/90'
                }`}
              >
                {/* Card Top: Warga Info + Large Status Toggle */}
                <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">
                        {calc.resident.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/60">
                        {calc.resident.houseNumber}
                      </span>
                    </div>

                    {calc.resident.phone && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{calc.resident.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Status Toggle Button (Prominent & Touch-Friendly) */}
                  <button
                    onClick={() => onToggleStatus(calc.resident.id, calc.status, calc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-xs border flex items-center gap-1.5 shrink-0 ${
                      isPaid
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/20'
                        : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    {isPaid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>LUNAS</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>TERUTANG</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Card Breakdown (3 Kolom Pas di HP) */}
                <div className="grid grid-cols-3 gap-2 py-2.5 text-center text-xs border-b border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Iuran Bln Ini</p>
                    <p className="font-bold text-slate-700 mt-0.5">{formatRupiah(calc.iuranBulanIni)}</p>
                  </div>

                  <div className={`p-2 rounded-xl ${hasArrears ? 'bg-amber-50 text-amber-900' : 'bg-slate-50'}`}>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Tunggakan Lalu</p>
                    <p className={`font-bold mt-0.5 ${hasArrears ? 'text-amber-700' : 'text-slate-400'}`}>
                      {formatRupiah(calc.tunggakanBulanLalu)}
                    </p>
                  </div>

                  <div className={`p-2 rounded-xl ${isPaid ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Total Wajib</p>
                    <p className="font-black text-slate-900 mt-0.5 text-xs sm:text-sm">
                      {formatRupiah(calc.totalKewajiban)}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Sisa Kewajiban & Quick Action Tools */}
                <div className="flex items-center justify-between pt-2.5 text-xs">
                  <div>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Kewajiban Lunas (Rp 0)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-rose-600" />
                        <span>Sisa: {formatRupiah(calc.sisaKewajiban)}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Kirim WA */}
                    <button
                      onClick={() => openWhatsApp(calc)}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition flex items-center gap-1"
                      title="Kirim pesan WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px]">WA</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditResident(calc.resident)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="Edit warga"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Hapus */}
                    <button
                      onClick={() => setDeleteResidentId(calc.resident.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      title="Hapus warga"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
              <th className="py-3.5 px-4">1. Nama Warga</th>
              <th className="py-3.5 px-4">2. Blok Rumah</th>
              <th className="py-3.5 px-4 text-right">3. Iuran Bulan Ini</th>
              <th className="py-3.5 px-4 text-right">4. Tunggakan Bulan Lalu</th>
              <th className="py-3.5 px-4 text-right">5. Total Kewajiban</th>
              <th className="py-3.5 px-4 text-center">6. Keterangan / Status</th>
              <th className="py-3.5 px-4 text-center w-28 no-print">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCalculations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-2xl">👥</p>
                    <p className="font-semibold text-slate-600">Tidak ada data warga yang cocok</p>
                    <p className="text-xs text-slate-400">
                      Coba ganti filter atau tambahkan warga baru ke dalam daftar.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCalculations.map((calc) => {
                const isPaid = calc.status === 'Lunas';
                const hasArrears = calc.tunggakanBulanLalu > 0;

                return (
                  <tr
                    key={calc.resident.id}
                    className={`hover:bg-slate-50/70 transition ${
                      isPaid ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* 1. Nama Warga */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-sm">{calc.resident.name}</div>
                      {calc.resident.phone && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>WA: {calc.resident.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* 2. Blok Rumah */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/60">
                        {calc.resident.houseNumber}
                      </span>
                    </td>

                    {/* 3. Iuran Bulan Ini */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                      {formatRupiah(calc.iuranBulanIni)}
                    </td>

                    {/* 4. Tunggakan Bulan Lalu */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {hasArrears ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80 text-xs">
                          <span>⚠️</span> {formatRupiah(calc.tunggakanBulanLalu)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Rp 0</span>
                      )}
                    </td>

                    {/* 5. Total Kewajiban */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-black text-slate-900 text-sm sm:text-base">
                        {formatRupiah(calc.totalKewajiban)}
                      </div>
                      {isPaid ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Sisa: Rp 0
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          Sisa: {formatRupiah(calc.sisaKewajiban)}
                        </span>
                      )}
                    </td>

                    {/* 6. Keterangan / Status (Interactive Button) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(calc.resident.id, calc.status, calc)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 active:scale-95 shadow-xs border ${
                          isPaid
                            ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-emerald-500/20'
                            : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 hover:text-rose-800'
                        }`}
                        title={
                          isPaid
                            ? 'Klik untuk mengubah status menjadi Terutang'
                            : 'Klik untuk menandai LUNAS'
                        }
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lunas</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Terutang</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: WA, Edit, Delete */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openWhatsApp(calc)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition active:scale-95"
                          title="Kirim WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditResident(calc.resident)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition active:scale-95"
                          title="Edit warga"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteResidentId(calc.resident.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition active:scale-95"
                          title="Hapus warga"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Resident Modal */}
      {deleteResidentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hapus Data Warga?</h4>
                <p className="text-xs text-slate-500">Warga akan dihapus dari daftar iuran RT.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Data pembayaran iuran warga ini untuk bulan-bulan lainnya akan tetap tersimpan dalam arsip kas.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setDeleteResidentId(null)}
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
