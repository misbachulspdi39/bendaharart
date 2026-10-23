import React, { useState, useEffect, useMemo } from 'react';
import { 
  AppStateData, 
  Transaction, 
  Resident, 
  IuranStatus, 
  RTSettings,
  MonthlyDuesRecord
} from './types';
import { 
  loadAppState, 
  saveAppState, 
  resetAppState 
} from './utils/storage';
import { 
  getCurrentMonthKey, 
  getTodayDateString, 
  exportToCsvFile, 
  formatMonthYearIndo,
  formatRupiah 
} from './utils/format';
import { 
  calculateAllResidentsDues, 
  ResidentDuesCalculation 
} from './utils/arrears';
import { Navbar } from './components/Navbar';
import { KasSummary } from './components/KasRT/KasSummary';
import { KasForm } from './components/KasRT/KasForm';
import { KasTable } from './components/KasRT/KasTable';
import { IuranHeader } from './components/IuranWarga/IuranHeader';
import { IuranTable } from './components/IuranWarga/IuranTable';
import { ResidentModal } from './components/IuranWarga/ResidentModal';
import { SettingsModal } from './components/SettingsModal';
import { BackupModal } from './components/BackupModal';
import { RecordToCashModal } from './components/RecordToCashModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PrintReportView } from './components/PrintReportView';
import { SupabaseModal } from './components/SupabaseModal';
import { 
  getSupabaseConfig, 
  testSupabaseConnection, 
  fetchSupabaseData,
  syncTransactionOnline,
  deleteTransactionOnline,
  syncResidentOnline,
  deleteResidentOnline,
  syncMonthlyDuesOnline,
  syncSettingsOnline
} from './lib/supabase';
import { CheckCircle2, Info } from 'lucide-react';

export default function App() {
  // Main app state persisted in LocalStorage
  const [appState, setAppState] = useState<AppStateData>(() => loadAppState());

  // Active Menu Tab: 'kas' (Menu 1) | 'iuran' (Menu 2)
  const [activeTab, setActiveTab] = useState<'kas' | 'iuran'>('kas');

  // Selected Month Key for Iuran (defaults to current month, e.g. "2026-10")
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey());

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isOnlineConnected, setIsOnlineConnected] = useState(false);
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Cash ledger prompt modal when marking resident Lunas
  const [pendingCashRecord, setPendingCashRecord] = useState<ResidentDuesCalculation | null>(null);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Test and auto-connect to Supabase on mount if config exists
  useEffect(() => {
    const cfg = getSupabaseConfig();
    if (cfg) {
      testSupabaseConnection(cfg.url, cfg.anonKey).then(async (res) => {
        if (res.success && res.tablesExist) {
          setIsOnlineConnected(true);
          // Try fetching latest online data from Supabase
          const cloud = await fetchSupabaseData();
          if (cloud.success && cloud.data) {
            setAppState(cloud.data);
          }
        }
      });
    }
  }, []);

  // Persist to LocalStorage whenever appState changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Derived Kas Calculations
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    appState.transactions.forEach((t) => {
      if (t.type === 'pemasukan') inc += t.amount;
      else exp += t.amount;
    });
    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp,
    };
  }, [appState.transactions]);

  // Derived Iuran Calculations for the selected month
  const calculations = useMemo(() => {
    return calculateAllResidentsDues(
      appState.residents,
      selectedMonthKey,
      appState.monthlyRecords
    );
  }, [appState.residents, selectedMonthKey, appState.monthlyRecords]);

  // Dues Summary Stats
  const { totalTarget, totalCollected, totalArrears, paidCount, unpaidCount } = useMemo(() => {
    let target = 0;
    let collected = 0;
    let arrears = 0;
    let paid = 0;
    let unpaid = 0;

    calculations.forEach((c) => {
      target += c.totalKewajiban;
      if (c.status === 'Lunas') {
        collected += c.totalKewajiban;
        paid += 1;
      } else {
        arrears += c.totalKewajiban;
        unpaid += 1;
      }
    });

    return {
      totalTarget: target,
      totalCollected: collected,
      totalArrears: arrears,
      paidCount: paid,
      unpaidCount: unpaid,
    };
  }, [calculations]);

  // ==================== HANDLERS: KAS RT ====================

  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = {
      ...newTx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: Date.now(),
    };
    setAppState((prev) => ({
      ...prev,
      transactions: [tx, ...prev.transactions],
    }));

    if (isOnlineConnected) {
      syncTransactionOnline(tx);
    }

    showToast(`Transaksi ${tx.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} berhasil dicatat.`);
  };

  const handleDeleteTransaction = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));

    if (isOnlineConnected) {
      deleteTransactionOnline(id);
    }

    showToast('Transaksi kas telah dihapus.');
  };

  // ==================== HANDLERS: IURAN WARGA ====================

  const handleToggleStatus = (
    residentId: string,
    currentStatus: IuranStatus,
    dues: ResidentDuesCalculation
  ) => {
    if (currentStatus === 'Terutang') {
      // Warga is being marked as "Lunas". Show prompt to optionally sync with Kas RT
      setPendingCashRecord(dues);
    } else {
      // Switching back to "Terutang"
      setAppState((prev) => {
        const monthRecs = { ...(prev.monthlyRecords[selectedMonthKey] || {}) };
        monthRecs[residentId] = {
          residentId,
          monthKey: selectedMonthKey,
          status: 'Terutang',
        };
        return {
          ...prev,
          monthlyRecords: {
            ...prev.monthlyRecords,
            [selectedMonthKey]: monthRecs,
          },
        };
      });

      if (isOnlineConnected) {
        syncMonthlyDuesOnline({
          residentId,
          monthKey: selectedMonthKey,
          status: 'Terutang',
        });
      }

      showToast(`Status ${dues.resident.name} diubah menjadi Terutang.`);
    }
  };

  const handleConfirmLunas = (recordToCash: boolean) => {
    if (!pendingCashRecord) return;
    const { resident, monthKey, totalKewajiban } = pendingCashRecord;

    const duesRecord: MonthlyDuesRecord = {
      residentId: resident.id,
      monthKey,
      status: 'Lunas',
      paidAt: getTodayDateString(),
    };

    let cashTx: Transaction | null = null;
    if (recordToCash) {
      cashTx = {
        id: 'tx-' + Date.now(),
        date: getTodayDateString(),
        type: 'pemasukan',
        category: 'Iuran Warga Bulanan',
        amount: totalKewajiban,
        description: `Iuran Kas RT: ${resident.name} (${resident.houseNumber}) periode ${formatMonthYearIndo(monthKey)}`,
        residentId: resident.id,
        createdAt: Date.now(),
      };
    }

    setAppState((prev) => {
      // 1. Update Monthly Record to Lunas
      const monthRecs = { ...(prev.monthlyRecords[monthKey] || {}) };
      monthRecs[resident.id] = duesRecord;

      let newTransactions = [...prev.transactions];

      // 2. If user chose to record to Kas RT as income
      if (cashTx) {
        newTransactions = [cashTx, ...newTransactions];
      }

      return {
        ...prev,
        transactions: newTransactions,
        monthlyRecords: {
          ...prev.monthlyRecords,
          [monthKey]: monthRecs,
        },
      };
    });

    if (isOnlineConnected) {
      syncMonthlyDuesOnline(duesRecord);
      if (cashTx) {
        syncTransactionOnline(cashTx);
      }
    }

    showToast(
      recordToCash
        ? `Iuran ${resident.name} lunas dan otomatis dicatat ke Kas RT!`
        : `Status iuran ${resident.name} berhasil ditandai Lunas.`
    );
    setPendingCashRecord(null);
  };

  const handleMarkAllPaid = () => {
    if (unpaidCount === 0) return;
    if (confirm(`Tandai seluruh ${unpaidCount} warga yang terutang di bulan ${formatMonthYearIndo(selectedMonthKey)} sebagai Lunas?`)) {
      setAppState((prev) => {
        const monthRecs = { ...(prev.monthlyRecords[selectedMonthKey] || {}) };
        prev.residents.forEach((res) => {
          monthRecs[res.id] = {
            residentId: res.id,
            monthKey: selectedMonthKey,
            status: 'Lunas',
            paidAt: getTodayDateString(),
          };
        });
        return {
          ...prev,
          monthlyRecords: {
            ...prev.monthlyRecords,
            [selectedMonthKey]: monthRecs,
          },
        };
      });
      showToast(`Semua warga pada bulan ${formatMonthYearIndo(selectedMonthKey)} ditandai Lunas.`);
    }
  };

  const handleSaveResident = (
    data: Omit<Resident, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let savedResident: Resident;

    setAppState((prev) => {
      if (existingId) {
        // Edit
        const updated = prev.residents.map((r) => {
          if (r.id === existingId) {
            savedResident = { ...r, ...data };
            return savedResident;
          }
          return r;
        });
        return {
          ...prev,
          residents: updated,
        };
      } else {
        // Add
        savedResident = {
          ...data,
          id: 'res-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          createdAt: Date.now(),
        };
        return {
          ...prev,
          residents: [...prev.residents, savedResident],
        };
      }
    });

    if (isOnlineConnected && savedResident!) {
      syncResidentOnline(savedResident);
    }

    showToast(existingId ? 'Data warga berhasil diperbarui.' : 'Warga baru berhasil ditambahkan.');
  };

  const handleDeleteResident = (residentId: string) => {
    setAppState((prev) => ({
      ...prev,
      residents: prev.residents.filter((r) => r.id !== residentId),
    }));

    if (isOnlineConnected) {
      deleteResidentOnline(residentId);
    }

    showToast('Data warga telah dihapus dari daftar.');
  };

  const handleExportIuranCsv = () => {
    const headers = [
      '1. Nama Warga',
      '2. Blok Rumah',
      '3. Iuran Bulan Ini (Rp)',
      '4. Tunggakan Bulan Lalu (Rp)',
      '5. Total Kewajiban (Rp)',
      '6. Keterangan / Status',
      'No. Telepon / WA',
    ];

    const rows = calculations.map((calc) => [
      calc.resident.name,
      calc.resident.houseNumber,
      calc.iuranBulanIni,
      calc.tunggakanBulanLalu,
      calc.totalKewajiban,
      calc.status,
      calc.resident.phone || '-',
    ]);

    exportToCsvFile(
      `rekap-iuran-warga-${selectedMonthKey}.csv`,
      headers,
      rows
    );
    showToast('Rekap iuran bulanan berhasil diekspor ke CSV.');
  };

  // ==================== SETTINGS & BACKUP ====================

  const handleSaveSettings = (newSettings: RTSettings) => {
    setAppState((prev) => ({ ...prev, settings: newSettings }));
    if (isOnlineConnected) {
      syncSettingsOnline(newSettings);
    }
    showToast('Pengaturan RT berhasil disimpan.');
  };

  const handleRestoreState = (restored: AppStateData) => {
    setAppState(restored);
    saveAppState(restored);
    setIsBackupOpen(false);
    showToast('Data berhasil dipulihkan dari cadangan!');
  };

  const handleResetState = () => {
    const fresh = resetAppState();
    setAppState(fresh);
    setIsBackupOpen(false);
    showToast('Aplikasi telah diatur ulang ke data awal.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-emerald-500 selection:text-white pb-16">
      {/* Navbar with tabs and quick tools */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={appState.settings}
        balance={balance}
        unpaidCount={unpaidCount}
        selectedMonthKey={selectedMonthKey}
        isOnlineConnected={isOnlineConnected}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex-1 w-full space-y-6">
        {/* Toast alert banner */}
        {toastMessage && (
          <div className="fixed top-16 right-4 z-50 flex items-center gap-2 bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-emerald-600 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ================= MENU 1: KAS RT ================= */}
        {activeTab === 'kas' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Ringkasan di atas tabel */}
            <KasSummary
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              transactionCount={appState.transactions.length}
            />

            {/* Form Input Transaksi */}
            <KasForm onAddTransaction={handleAddTransaction} />

            {/* Tabel Riwayat Transaksi */}
            <KasTable
              transactions={appState.transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {/* ================= MENU 2: IURAN WARGA ================= */}
        {activeTab === 'iuran' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header: Filter Bulan & Tahun, Rekap Status, Aksi Tambah Warga */}
            <IuranHeader
              selectedMonthKey={selectedMonthKey}
              onSelectMonthKey={setSelectedMonthKey}
              residentCount={appState.residents.length}
              totalTarget={totalTarget}
              totalCollected={totalCollected}
              totalArrears={totalArrears}
              paidCount={paidCount}
              unpaidCount={unpaidCount}
              onOpenAddResident={() => {
                setEditingResident(null);
                setIsResidentModalOpen(true);
              }}
              onMarkAllPaid={handleMarkAllPaid}
              onExportCsv={handleExportIuranCsv}
            />

            {/* Tabel Iuran Warga (6 Kolom Sesuai Ketentuan) */}
            <IuranTable
              calculations={calculations}
              selectedMonthKey={selectedMonthKey}
              settings={appState.settings}
              onToggleStatus={handleToggleStatus}
              onEditResident={(resident) => {
                setEditingResident(resident);
                setIsResidentModalOpen(true);
              }}
              onDeleteResident={handleDeleteResident}
            />
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="no-print mt-auto py-5 px-4 border-t border-slate-200 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-700">
          Buku Bendahara Kas RT {appState.settings.rtNumber} / RW {appState.settings.rwNumber} — {appState.settings.subdistrict}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-1.5 flex-wrap">
          <span>{isOnlineConnected ? '🟢 Terhubung Online (Supabase Database)' : '💾 Penyimpanan Aman Aktif'}</span>
          <span>•</span>
          <span>Sistem Keuangan Kas & Iuran Warga Digital</span>
        </p>
      </footer>

      {/* Printable Report Component for Cetak / PDF */}
      <PrintReportView
        settings={appState.settings}
        selectedMonthKey={selectedMonthKey}
        transactions={appState.transactions}
        calculations={calculations}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
      />

      {/* Modals */}
      <ResidentModal
        isOpen={isResidentModalOpen}
        onClose={() => {
          setIsResidentModalOpen(false);
          setEditingResident(null);
        }}
        onSave={handleSaveResident}
        editingResident={editingResident}
        defaultFee={appState.settings.defaultMonthlyFee}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appState.settings}
        onSaveSettings={handleSaveSettings}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        appState={appState}
        onRestoreState={handleRestoreState}
        onResetState={handleResetState}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        appState={appState}
        onApplySupabaseData={(data) => setAppState(data)}
        isOnlineConnected={isOnlineConnected}
        setIsOnlineConnected={setIsOnlineConnected}
        onShowToast={showToast}
      />

      <RecordToCashModal
        isOpen={!!pendingCashRecord}
        onClose={() => setPendingCashRecord(null)}
        dues={pendingCashRecord}
        onConfirm={handleConfirmLunas}
      />

      {/* Non-intrusive offline status banner */}
      <OfflineIndicator />
    </div>
  );
}
