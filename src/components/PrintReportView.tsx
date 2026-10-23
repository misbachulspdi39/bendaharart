import React from 'react';
import { RTSettings, Transaction, Resident } from '../types';
import { ResidentDuesCalculation } from '../utils/arrears';
import { formatRupiah, formatDateIndo, formatMonthYearIndo, getTodayDateString } from '../utils/format';

interface PrintReportViewProps {
  settings: RTSettings;
  selectedMonthKey: string;
  transactions: Transaction[];
  calculations: ResidentDuesCalculation[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  settings,
  selectedMonthKey,
  transactions,
  calculations,
  totalIncome,
  totalExpense,
  balance,
}) => {
  const monthName = formatMonthYearIndo(selectedMonthKey);

  return (
    <div className="hidden print-only p-8 text-black bg-white space-y-6">
      {/* Official RT Header */}
      <div className="text-center border-b-2 border-black pb-4 space-y-1">
        <h1 className="text-xl font-bold uppercase tracking-wider">
          RUKUN TETANGGA (RT) {settings.rtNumber} / RUKUN WARGA (RW) {settings.rwNumber}
        </h1>
        <p className="text-sm font-semibold">
          {settings.subdistrict}, {settings.city}
        </p>
        <h2 className="text-base font-bold underline uppercase pt-2">
          LAPORAN KAS & REKAP IURAN BULANAN — {monthName.toUpperCase()}
        </h2>
        <p className="text-xs text-gray-600">
          Dicetak pada: {formatDateIndo(getTodayDateString())}
        </p>
      </div>

      {/* Summary Box */}
      <div className="border border-black p-4 rounded grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs font-semibold uppercase">Total Pemasukan Kas</p>
          <p className="text-base font-bold">{formatRupiah(totalIncome)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase">Total Pengeluaran Kas</p>
          <p className="text-base font-bold">{formatRupiah(totalExpense)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase">Saldo Akhir Kas</p>
          <p className="text-base font-bold">{formatRupiah(balance)}</p>
        </div>
      </div>

      {/* Rekap Iuran Warga */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm uppercase">1. Rekapitulasi Iuran Warga ({monthName})</h3>
        <table className="w-full text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border border-black p-1 text-center w-8">No</th>
              <th className="border border-black p-1 text-left">Nama Warga</th>
              <th className="border border-black p-1 text-left">Blok Rumah</th>
              <th className="border border-black p-1 text-right">Iuran Bulan Ini</th>
              <th className="border border-black p-1 text-right">Tunggakan Lalu</th>
              <th className="border border-black p-1 text-right">Total Kewajiban</th>
              <th className="border border-black p-1 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {calculations.map((calc, i) => (
              <tr key={calc.resident.id} className="border-b border-black">
                <td className="border border-black p-1 text-center">{i + 1}</td>
                <td className="border border-black p-1 font-semibold">{calc.resident.name}</td>
                <td className="border border-black p-1">{calc.resident.houseNumber}</td>
                <td className="border border-black p-1 text-right">{formatRupiah(calc.iuranBulanIni)}</td>
                <td className="border border-black p-1 text-right">{formatRupiah(calc.tunggakanBulanLalu)}</td>
                <td className="border border-black p-1 text-right font-bold">{formatRupiah(calc.totalKewajiban)}</td>
                <td className="border border-black p-1 text-center font-bold">
                  {calc.status === 'Lunas' ? 'LUNAS' : 'TERUTANG'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaksi Kas */}
      <div className="space-y-2 pt-4">
        <h3 className="font-bold text-sm uppercase">2. Catatan Transaksi Kas RT</h3>
        <table className="w-full text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border border-black p-1 text-center w-8">No</th>
              <th className="border border-black p-1 text-left">Tanggal</th>
              <th className="border border-black p-1 text-left">Jenis</th>
              <th className="border border-black p-1 text-left">Kategori</th>
              <th className="border border-black p-1 text-left">Keterangan</th>
              <th className="border border-black p-1 text-right">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 20).map((t, i) => (
              <tr key={t.id} className="border-b border-black">
                <td className="border border-black p-1 text-center">{i + 1}</td>
                <td className="border border-black p-1">{t.date}</td>
                <td className="border border-black p-1 uppercase">{t.type}</td>
                <td className="border border-black p-1">{t.category}</td>
                <td className="border border-black p-1">{t.description}</td>
                <td className="border border-black p-1 text-right font-semibold">
                  {t.type === 'pemasukan' ? '+' : '-'} {formatRupiah(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="pt-10 grid grid-cols-2 text-center text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-bold">Ketua RT {settings.rtNumber}</p>
          <div className="h-16"></div>
          <p className="font-bold underline">( ............................................ )</p>
        </div>
        <div>
          <p>{settings.city}, {formatDateIndo(getTodayDateString())}</p>
          <p className="font-bold">Bendahara RT {settings.rtNumber}</p>
          <div className="h-16"></div>
          <p className="font-bold underline">
            ( {settings.treasurerName || '............................................'} )
          </p>
        </div>
      </div>
    </div>
  );
};
