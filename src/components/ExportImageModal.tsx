import React, { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { RTSettings, Transaction } from '../types';
import { ResidentDuesCalculation } from '../utils/arrears';
import { 
  formatRupiah, 
  formatDateIndo, 
  formatMonthYearIndo, 
  getTodayDateString 
} from '../utils/format';
import { 
  X, 
  Download, 
  Copy, 
  Share2, 
  Check, 
  Image as ImageIcon, 
  AlertCircle,
  MessageCircle,
  TrendingUp,
  Scale,
  Wallet,
  Calendar,
  Users
} from 'lucide-react';

interface ExportImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'kas' | 'iuran';
  settings: RTSettings;
  // Kas RT props
  transactions?: Transaction[];
  totalIncome?: number;
  totalExpense?: number;
  balance?: number;
  // Iuran Warga props
  selectedMonthKey?: string;
  calculations?: ResidentDuesCalculation[];
  totalTarget?: number;
  totalCollected?: number;
  totalArrears?: number;
  paidCount?: number;
  unpaidCount?: number;
}

export const ExportImageModal: React.FC<ExportImageModalProps> = ({
  isOpen,
  onClose,
  type,
  settings,
  transactions = [],
  totalIncome = 0,
  totalExpense = 0,
  balance = 0,
  selectedMonthKey = '',
  calculations = [],
  totalTarget = 0,
  totalCollected = 0,
  totalArrears = 0,
  paidCount = 0,
  unpaidCount = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterMode, setFilterMode] = useState<'semua' | 'terutang' | 'lunas'>('semua');

  if (!isOpen) return null;

  // Filter calculations for the image table
  const displayedCalculations = calculations.filter((c) => {
    if (filterMode === 'terutang') return c.status === 'Terutang';
    if (filterMode === 'lunas') return c.status === 'Lunas';
    return true;
  });

  // Recent 12 transactions for Kas image preview
  const displayedTransactions = transactions.slice(0, 15);

  const todayStr = formatDateIndo(getTodayDateString());
  const monthTitle = selectedMonthKey ? formatMonthYearIndo(selectedMonthKey) : '';

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8fafc',
      });
      const link = document.createElement('a');
      link.download = type === 'kas'
        ? `rekap-kas-rt-${settings.rtNumber}-rw-${settings.rwNumber}-${getTodayDateString()}.png`
        : `rekap-iuran-rt-${settings.rtNumber}-rw-${settings.rwNumber}-${selectedMonthKey}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('Gagal membuat gambar rekap. Silakan coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8fafc',
      });
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        // Fallback to downloading
        handleDownloadImage();
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      // Fallback
      handleDownloadImage();
    } finally {
      setGenerating(false);
    }
  };

  const openWhatsAppText = () => {
    let text = '';
    if (type === 'kas') {
      text = `*LAPORAN KEUANGAN KAS RT ${settings.rtNumber} / RW ${settings.rwNumber}*\n` +
        `*${settings.subdistrict}*\n` +
        `Per Tanggal: ${todayStr}\n\n` +
        `💵 *Total Pemasukan:* ${formatRupiah(totalIncome)}\n` +
        `💸 *Total Pengeluaran:* ${formatRupiah(totalExpense)}\n` +
        `💰 *SALDO AKHIR KAS:* ${formatRupiah(balance)}\n\n` +
        `Rekap gambar terlampir telah digenerate dari Aplikasi Buku Kas RT.\n` +
        `_Salam hormat, Bendahara RT ${settings.rtNumber}_`;
    } else {
      const percent = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;
      text = `*REKAP IURAN WARGA RT ${settings.rtNumber} / RW ${settings.rwNumber}*\n` +
        `*${settings.subdistrict}*\n` +
        `Periode: *${monthTitle}*\n\n` +
        `📊 *Ringkasan:* \n` +
        `- Target Kewajiban: ${formatRupiah(totalTarget)}\n` +
        `- Terkumpul (Lunas): ${formatRupiah(totalCollected)} (${paidCount} KK - ${percent}%)\n` +
        `- Sisa Terutang: ${formatRupiah(totalArrears)} (${unpaidCount} KK)\n\n` +
        `Detail daftar warga dapat dilihat pada gambar terlampir.\n` +
        `Bagi warga yang berstatus Terutang, pembayaran dapat ditransfer / diserahkan ke Bendahara RT.\n\n` +
        `_Terima kasih atas partisipasi seluruh warga._`;
    }
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Ekspor Gambar Rekap WhatsApp
              </h3>
              <p className="text-[11px] text-slate-300">
                {type === 'kas' ? 'Rekap Keuangan Kas RT' : `Rekap Iuran Periode ${monthTitle}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 sm:p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* If Iuran, option to filter list in image */}
          {type === 'iuran' ? (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setFilterMode('semua')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  filterMode === 'semua' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({calculations.length})
              </button>
              <button
                onClick={() => setFilterMode('terutang')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  filterMode === 'terutang' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Terutang ({unpaidCount})
              </button>
              <button
                onClick={() => setFilterMode('lunas')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  filterMode === 'lunas' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Lunas ({paidCount})
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-600">
              Format infografis siap kirim ke WhatsApp Group
            </span>
          )}

          {/* Export action buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleCopyImage}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition active:scale-95 shadow-xs disabled:opacity-50"
              title="Salin gambar untuk langsung di-Paste (Ctrl+V) di WA Web"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Salin Gambar</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={generating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{generating ? 'Membuat...' : 'Unduh PNG'}</span>
            </button>

            <button
              onClick={openWhatsAppText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition active:scale-95 shadow-xs"
              title="Buka WhatsApp dengan pengantar teks"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim ke WA</span>
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-3 sm:p-5 overflow-y-auto bg-slate-200/70 flex justify-center">
          {/* THE CARD TO EXPORT (Rendered cleanly with explicit width for standard smartphone view) */}
          <div
            ref={cardRef}
            className="w-full max-w-[540px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 text-slate-800"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
          >
            {/* 1. Header Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 relative">
              <div className="flex items-center gap-3">
                <img
                  src="/app-logo.png"
                  alt="Logo Kas RT"
                  className="w-12 h-12 rounded-xl object-contain bg-sky-500/30 p-1 border border-white/20 shadow-md shrink-0"
                />
                <div className="min-w-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 uppercase tracking-wider inline-block">
                    Laporan Resmi RT
                  </span>
                  <h2 className="font-black text-base sm:text-lg tracking-tight leading-tight mt-0.5">
                    RT {settings.rtNumber} / RW {settings.rwNumber} — {settings.subdistrict}
                  </h2>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    {type === 'kas'
                      ? `Laporan Keuangan Kas RT • Per ${todayStr}`
                      : `Rekap Iuran Bulanan Warga • Periode ${monthTitle}`}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Body Section: Kas RT vs Iuran Warga */}
            <div className="p-4 sm:p-5 space-y-4">
              {type === 'kas' ? (
                <>
                  {/* KPI Summary 3 Boxes */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pemasukan</p>
                      <p className="font-extrabold text-xs sm:text-sm text-emerald-800 mt-0.5">
                        {formatRupiah(totalIncome)}
                      </p>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Pengeluaran</p>
                      <p className="font-extrabold text-xs sm:text-sm text-rose-800 mt-0.5">
                        {formatRupiah(totalExpense)}
                      </p>
                    </div>

                    <div className="bg-teal-700 text-white rounded-xl p-2.5 shadow-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100">Saldo Akhir</p>
                      <p className="font-black text-xs sm:text-sm text-white mt-0.5">
                        {formatRupiah(balance)}
                      </p>
                    </div>
                  </div>

                  {/* Riwayat Transaksi Singkat */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                      <span>Riwayat Transaksi Terbaru</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        {displayedTransactions.length} dari {transactions.length} catatan
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {displayedTransactions.map((tx, idx) => {
                        const isIncome = tx.type === 'pemasukan';
                        return (
                          <div key={tx.id || idx} className="py-2 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate leading-tight">
                                {tx.description}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                <span>{tx.date}</span> • <span className="font-medium text-slate-500">{tx.category}</span>
                              </p>
                            </div>
                            <span
                              className={`font-extrabold text-xs shrink-0 whitespace-nowrap ${
                                isIncome ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isIncome ? '+ ' : '- '}
                              {formatRupiah(tx.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Iuran Summary Boxes */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Total Target</p>
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5">
                        {formatRupiah(totalTarget)}
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Terkumpul</p>
                      <p className="font-extrabold text-xs sm:text-sm text-emerald-800 mt-0.5">
                        {formatRupiah(totalCollected)}
                      </p>
                      <p className="text-[9px] text-emerald-600 font-bold mt-0.5">{paidCount} KK Lunas</p>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Sisa Terutang</p>
                      <p className="font-extrabold text-xs sm:text-sm text-rose-800 mt-0.5">
                        {formatRupiah(totalArrears)}
                      </p>
                      <p className="text-[9px] text-rose-600 font-bold mt-0.5">{unpaidCount} KK Belum</p>
                    </div>
                  </div>

                  {/* List Warga Rekap Table */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                      <span>Daftar Status Iuran Warga</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Menampilkan {displayedCalculations.length} warga
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-2.5">Warga & Blok</th>
                            <th className="py-2 px-2 text-right">Iuran</th>
                            <th className="py-2 px-2 text-right">Tunggakan</th>
                            <th className="py-2 px-2 text-right">Total</th>
                            <th className="py-2 px-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedCalculations.map((calc, idx) => {
                            const isPaid = calc.status === 'Lunas';
                            return (
                              <tr
                                key={calc.resident.id}
                                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                              >
                                <td className="py-1.5 px-2.5">
                                  <div className="font-bold text-slate-800 leading-tight">
                                    {calc.resident.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {calc.resident.houseNumber}
                                  </div>
                                </td>
                                <td className="py-1.5 px-2 text-right text-slate-600 whitespace-nowrap">
                                  {formatRupiah(calc.iuranBulanIni)}
                                </td>
                                <td className="py-1.5 px-2 text-right whitespace-nowrap">
                                  {calc.tunggakanBulanLalu > 0 ? (
                                    <span className="text-amber-700 font-bold">
                                      {formatRupiah(calc.tunggakanBulanLalu)}
                                      {calc.isManualArrears && (
                                        <span className="text-[9px] text-amber-600 ml-0.5">*</span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="py-1.5 px-2 text-right font-extrabold text-slate-900 whitespace-nowrap">
                                  {formatRupiah(calc.totalKewajiban)}
                                </td>
                                <td className="py-1.5 px-2 text-center whitespace-nowrap">
                                  {isPaid ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                                      LUNAS ✅
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300/60">
                                      TERUTANG ⏳
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* 3. Footer Signature & Note */}
              <div className="pt-3 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">
                    Buku Bendahara Kas RT 19 / RW 44 - Perum Jatisawit Asri
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Dicetak otomatis via Aplikasi Kas RT • {todayStr}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Bendahara RT 19</p>
                  <p className="font-bold text-slate-800 text-xs mt-3 underline decoration-slate-300 underline-offset-2">
                    {settings.treasurerName || 'Pengurus RT 19'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
