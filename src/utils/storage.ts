import { AppStateData, RTSettings, Resident, Transaction, MonthlyDuesRecord } from '../types';
import { getCurrentMonthKey, getPreviousMonthKey } from './format';

const STORAGE_KEY = 'BUKU_KAS_RT_PWA_DATA_V1';

export const DEFAULT_SETTINGS: RTSettings = {
  rtNumber: '04',
  rwNumber: '08',
  subdistrict: 'Kelurahan Sukamaju',
  city: 'Kota Bekasi',
  treasurerName: 'Bambang Sutrisno',
  defaultMonthlyFee: 50000,
};

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'res-1',
    name: 'Bpk. Joko Widodo',
    houseNumber: 'Blok A1 No. 01',
    phone: '081234567890',
    monthlyFee: 50000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'res-2',
    name: 'Ibu Hj. Siti Aminah',
    houseNumber: 'Blok A1 No. 02',
    phone: '081398765432',
    monthlyFee: 50000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'res-3',
    name: 'Bpk. Hendra Gunawan',
    houseNumber: 'Blok A2 No. 05',
    phone: '085711223344',
    monthlyFee: 50000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 55,
  },
  {
    id: 'res-4',
    name: 'Bpk. Ir. Ahmad Dahlan',
    houseNumber: 'Blok B1 No. 03',
    phone: '081900112233',
    monthlyFee: 50000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 50,
  },
  {
    id: 'res-5',
    name: 'Bpk. Budi Santoso',
    houseNumber: 'Blok B2 No. 08',
    phone: '082155667788',
    monthlyFee: 50000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
  },
  {
    id: 'res-6',
    name: 'Ibu Ratna Sari',
    houseNumber: 'Blok C1 No. 04',
    phone: '081544332211',
    monthlyFee: 50000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
  },
  {
    id: 'res-7',
    name: 'Bpk. Dedi Kusnadi',
    houseNumber: 'Blok C2 No. 10',
    phone: '087812349988',
    monthlyFee: 50000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
  },
  {
    id: 'res-8',
    name: 'Bpk. Rudi Hermawan',
    houseNumber: 'Blok D1 No. 02',
    phone: '081377889900',
    monthlyFee: 50000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-10-01',
    type: 'pemasukan',
    category: 'Kas Awal / Saldo Awal',
    amount: 3500000,
    description: 'Saldo awal kas RT bulan Oktober 2026',
    createdAt: 1760000000000,
  },
  {
    id: 'tx-2',
    date: '2026-10-04',
    type: 'pemasukan',
    category: 'Iuran Warga Bulanan',
    amount: 200000,
    description: 'Penerimaan iuran warga minggu ke-1 (4 warga)',
    createdAt: 1760100000000,
  },
  {
    id: 'tx-3',
    date: '2026-10-07',
    type: 'pengeluaran',
    category: 'Kebersihan & Sampah',
    amount: 350000,
    description: 'Honor petugas kebersihan & pengangkutan sampah RT',
    createdAt: 1760200000000,
  },
  {
    id: 'tx-4',
    date: '2026-10-11',
    type: 'pengeluaran',
    category: 'Perbaikan Lampu & Sarana',
    amount: 175000,
    description: 'Beli 3 set bohlam LED tiang lampu jalan Blok B dan fitting',
    createdAt: 1760300000000,
  },
  {
    id: 'tx-5',
    date: '2026-10-15',
    type: 'pemasukan',
    category: 'Sumbangan / Donasi',
    amount: 500000,
    description: 'Donasi sukarela warga untuk kas sosial warga sakit',
    createdAt: 1760400000000,
  },
  {
    id: 'tx-6',
    date: '2026-10-18',
    type: 'pengeluaran',
    category: 'Konsumsi Rapat & Kerja Bakti',
    amount: 120000,
    description: 'Konsumsi snack & kopi kerja bakti pembersihan selokan',
    createdAt: 1760500000000,
  },
];

export function generateInitialMonthlyRecords(): Record<string, Record<string, MonthlyDuesRecord>> {
  const currentMonth = getCurrentMonthKey(); // e.g. "2026-10"
  const prevMonth = getPreviousMonthKey(currentMonth); // e.g. "2026-09"

  const records: Record<string, Record<string, MonthlyDuesRecord>> = {};

  // Previous month records:
  // Res-1 and Res-5 were "Terutang" in previous month (creates initial arrears in current month!)
  // Others were "Lunas"
  records[prevMonth] = {
    'res-1': { residentId: 'res-1', monthKey: prevMonth, status: 'Terutang' },
    'res-2': { residentId: 'res-2', monthKey: prevMonth, status: 'Lunas', paidAt: `${prevMonth}-05` },
    'res-3': { residentId: 'res-3', monthKey: prevMonth, status: 'Lunas', paidAt: `${prevMonth}-08` },
    'res-4': { residentId: 'res-4', monthKey: prevMonth, status: 'Lunas', paidAt: `${prevMonth}-10` },
    'res-5': { residentId: 'res-5', monthKey: prevMonth, status: 'Terutang' },
    'res-6': { residentId: 'res-6', monthKey: prevMonth, status: 'Lunas', paidAt: `${prevMonth}-12` },
    'res-7': { residentId: 'res-7', monthKey: prevMonth, status: 'Lunas', paidAt: `${prevMonth}-15` },
    'res-8': { residentId: 'res-8', monthKey: prevMonth, status: 'Lunas', paidAt: `${prevMonth}-15` },
  };

  // Current month records:
  // Res-2, Res-3, Res-4, Res-6 are "Lunas"
  // Res-1, Res-5, Res-7, Res-8 are "Terutang"
  records[currentMonth] = {
    'res-1': { residentId: 'res-1', monthKey: currentMonth, status: 'Terutang' },
    'res-2': { residentId: 'res-2', monthKey: currentMonth, status: 'Lunas', paidAt: `${currentMonth}-04` },
    'res-3': { residentId: 'res-3', monthKey: currentMonth, status: 'Lunas', paidAt: `${currentMonth}-04` },
    'res-4': { residentId: 'res-4', monthKey: currentMonth, status: 'Lunas', paidAt: `${currentMonth}-04` },
    'res-5': { residentId: 'res-5', monthKey: currentMonth, status: 'Terutang' },
    'res-6': { residentId: 'res-6', monthKey: currentMonth, status: 'Lunas', paidAt: `${currentMonth}-04` },
    'res-7': { residentId: 'res-7', monthKey: currentMonth, status: 'Terutang' },
    'res-8': { residentId: 'res-8', monthKey: currentMonth, status: 'Terutang' },
  };

  return records;
}

export function loadAppState(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.residents)) {
        return {
          version: parsed.version || 1,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          transactions: parsed.transactions,
          residents: parsed.residents,
          monthlyRecords: parsed.monthlyRecords || {},
        };
      }
    }
  } catch (err) {
    console.error('Failed to load local storage state:', err);
  }

  // Fallback to initial seed
  const initialState: AppStateData = {
    version: 1,
    settings: DEFAULT_SETTINGS,
    transactions: INITIAL_TRANSACTIONS,
    residents: INITIAL_RESIDENTS,
    monthlyRecords: generateInitialMonthlyRecords(),
  };

  saveAppState(initialState);
  return initialState;
}

export function saveAppState(state: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to local storage:', err);
  }
}

export function resetAppState(): AppStateData {
  const freshState: AppStateData = {
    version: 1,
    settings: DEFAULT_SETTINGS,
    transactions: INITIAL_TRANSACTIONS,
    residents: INITIAL_RESIDENTS,
    monthlyRecords: generateInitialMonthlyRecords(),
  };
  saveAppState(freshState);
  return freshState;
}
