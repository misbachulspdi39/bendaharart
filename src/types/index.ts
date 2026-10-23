export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  residentId?: string; // Optional link if generated from iuran
  createdAt: number;
}

export interface Resident {
  id: string;
  name: string;
  houseNumber: string;
  phone?: string;
  monthlyFee: number;
  notes?: string;
  createdAt: number;
}

export type IuranStatus = 'Lunas' | 'Terutang';

export interface MonthlyDuesRecord {
  residentId: string;
  monthKey: string; // Format "YYYY-MM", e.g. "2026-10"
  status: IuranStatus;
  paidAt?: string;
  notes?: string;
}

export interface RTSettings {
  rtNumber: string;
  rwNumber: string;
  subdistrict: string; // Kelurahan/Desa
  city: string;
  treasurerName: string;
  defaultMonthlyFee: number;
}

export interface AppStateData {
  version: number;
  settings: RTSettings;
  transactions: Transaction[];
  residents: Resident[];
  monthlyRecords: Record<string, Record<string, MonthlyDuesRecord>>; // monthKey -> { residentId: record }
}
