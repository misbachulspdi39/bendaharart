import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppStateData, Transaction, Resident, MonthlyDuesRecord, RTSettings } from '../types';

const SUPABASE_CONFIG_KEY = 'KAS_RT_SUPABASE_CONFIG_V1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Retrieves the current Supabase configuration:
 * Prioritizes user in-app configuration (stored in LocalStorage),
 * falls back to Vite env variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.url && parsed?.anonKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading Supabase config from storage:', err);
  }

  // Fallback to env
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  // Invalidate cached client
  cachedClient = null;
}

export function removeSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSupabaseConfig();
  if (!config || !config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Tests connection to Supabase by querying the rt_settings table.
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; tablesExist: boolean }> {
  try {
    const tempClient = createClient(url, anonKey);
    const { data, error } = await tempClient.from('rt_settings').select('id').limit(1);

    if (error) {
      // Check if error is because table does not exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          tablesExist: false,
          message: 'Terhubung ke Supabase, namun tabel belum dibuat. Silakan jalankan skrip SQL di Supabase SQL Editor.',
        };
      }
      return {
        success: false,
        tablesExist: false,
        message: `Koneksi gagal: ${error.message} (${error.code || 'Error'})`,
      };
    }

    return {
      success: true,
      tablesExist: true,
      message: 'Koneksi ke database Supabase BERHASIL dan tabel siap digunakan!',
    };
  } catch (err: any) {
    return {
      success: false,
      tablesExist: false,
      message: `Gagal menghubungkan: ${err.message || 'URL atau Key tidak valid.'}`,
    };
  }
}

/**
 * Fetches all RT data from online Supabase database.
 */
export async function fetchSupabaseData(): Promise<{ success: boolean; data?: AppStateData; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Klien Supabase belum dikonfigurasi.' };
  }

  try {
    // 1. Fetch settings
    const { data: settingsData, error: settingsErr } = await client
      .from('rt_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (settingsErr) throw settingsErr;

    // 2. Fetch residents
    const { data: residentsData, error: residentsErr } = await client
      .from('residents')
      .select('*')
      .order('house_number', { ascending: true });

    if (residentsErr) throw residentsErr;

    // 3. Fetch transactions
    const { data: txData, error: txErr } = await client
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (txErr) throw txErr;

    // 4. Fetch monthly dues records
    const { data: duesData, error: duesErr } = await client
      .from('monthly_dues_records')
      .select('*');

    if (duesErr) throw duesErr;

    // Map database rows to application types
    const settings: RTSettings = settingsData
      ? {
          rtNumber: settingsData.rt_number,
          rwNumber: settingsData.rw_number,
          subdistrict: settingsData.subdistrict,
          city: settingsData.city,
          treasurerName: settingsData.treasurer_name || '',
          defaultMonthlyFee: Number(settingsData.default_monthly_fee) || 50000,
        }
      : {
          rtNumber: '04',
          rwNumber: '08',
          subdistrict: 'Kelurahan Sukamaju',
          city: 'Kota Bekasi',
          treasurerName: 'Bambang Sutrisno',
          defaultMonthlyFee: 50000,
        };

    const residents: Resident[] = (residentsData || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      houseNumber: r.house_number,
      phone: r.phone || undefined,
      monthlyFee: Number(r.monthly_fee) || 50000,
      notes: r.notes || undefined,
      createdAt: Number(r.created_at) || Date.now(),
    }));

    const transactions: Transaction[] = (txData || []).map((t: any) => ({
      id: t.id,
      date: t.date,
      type: t.type,
      category: t.category,
      amount: Number(t.amount) || 0,
      description: t.description,
      residentId: t.resident_id || undefined,
      createdAt: Number(t.created_at) || Date.now(),
    }));

    const monthlyRecords: Record<string, Record<string, MonthlyDuesRecord>> = {};
    (duesData || []).forEach((d: any) => {
      const monthKey = d.month_key;
      const resId = d.resident_id;
      if (!monthlyRecords[monthKey]) {
        monthlyRecords[monthKey] = {};
      }
      monthlyRecords[monthKey][resId] = {
        residentId: resId,
        monthKey: monthKey,
        status: d.status,
        paidAt: d.paid_at || undefined,
        notes: d.notes || undefined,
      };
    });

    return {
      success: true,
      data: {
        version: 1,
        settings,
        residents,
        transactions,
        monthlyRecords,
      },
    };
  } catch (err: any) {
    console.error('Error fetching data from Supabase:', err);
    return { success: false, error: err.message || 'Gagal mengambil data dari Supabase.' };
  }
}

/**
 * Uploads/Synchronizes local state up to Supabase online.
 */
export async function uploadLocalToSupabase(state: AppStateData): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase belum terhubung.' };
  }

  try {
    // 1. Settings
    await client.from('rt_settings').upsert({
      id: 'default',
      rt_number: state.settings.rtNumber,
      rw_number: state.settings.rwNumber,
      subdistrict: state.settings.subdistrict,
      city: state.settings.city,
      treasurer_name: state.settings.treasurerName,
      default_monthly_fee: state.settings.defaultMonthlyFee,
      updated_at: new Date().toISOString(),
    });

    // 2. Residents
    if (state.residents.length > 0) {
      const resPayload = state.residents.map((r) => ({
        id: r.id,
        name: r.name,
        house_number: r.houseNumber,
        phone: r.phone || null,
        monthly_fee: r.monthlyFee,
        notes: r.notes || null,
        created_at: r.createdAt,
      }));
      await client.from('residents').upsert(resPayload);
    }

    // 3. Transactions
    if (state.transactions.length > 0) {
      const txPayload = state.transactions.map((t) => ({
        id: t.id,
        date: t.date,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        resident_id: t.residentId || null,
        created_at: t.createdAt,
      }));
      await client.from('transactions').upsert(txPayload);
    }

    // 4. Monthly Dues Records
    const duesList: any[] = [];
    Object.entries(state.monthlyRecords).forEach(([monthKey, resMap]) => {
      Object.entries(resMap).forEach(([resId, record]) => {
        duesList.push({
          id: `${monthKey}_${resId}`,
          month_key: monthKey,
          resident_id: resId,
          status: record.status,
          paid_at: record.paidAt || null,
          notes: record.notes || null,
          updated_at: new Date().toISOString(),
        });
      });
    });

    if (duesList.length > 0) {
      await client.from('monthly_dues_records').upsert(duesList);
    }

    return {
      success: true,
      message: `Sinkronisasi berhasil! ${state.residents.length} warga, ${state.transactions.length} transaksi kas, dan ${duesList.length} rekap iuran telah diunggah ke Supabase.`,
    };
  } catch (err: any) {
    console.error('Error uploading to Supabase:', err);
    return {
      success: false,
      message: `Gagal mengunggah ke Supabase: ${err.message || 'Periksa tabel dan izin RLS.'}`,
    };
  }
}

/**
 * Online CRUD helper: Insert or update transaction in Supabase
 */
export async function syncTransactionOnline(tx: Transaction): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('transactions').upsert({
      id: tx.id,
      date: tx.date,
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      description: tx.description,
      resident_id: tx.residentId || null,
      created_at: tx.createdAt,
    });
  } catch (err) {
    console.error('Background Supabase tx sync failed:', err);
  }
}

/**
 * Online CRUD helper: Delete transaction in Supabase
 */
export async function deleteTransactionOnline(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('transactions').delete().eq('id', id);
  } catch (err) {
    console.error('Background Supabase tx delete failed:', err);
  }
}

/**
 * Online CRUD helper: Upsert resident in Supabase
 */
export async function syncResidentOnline(resident: Resident): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('residents').upsert({
      id: resident.id,
      name: resident.name,
      house_number: resident.houseNumber,
      phone: resident.phone || null,
      monthly_fee: resident.monthlyFee,
      notes: resident.notes || null,
      created_at: resident.createdAt,
    });
  } catch (err) {
    console.error('Background Supabase resident sync failed:', err);
  }
}

/**
 * Online CRUD helper: Delete resident in Supabase
 */
export async function deleteResidentOnline(residentId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('residents').delete().eq('id', residentId);
  } catch (err) {
    console.error('Background Supabase resident delete failed:', err);
  }
}

/**
 * Online CRUD helper: Upsert monthly dues status in Supabase
 */
export async function syncMonthlyDuesOnline(record: MonthlyDuesRecord): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('monthly_dues_records').upsert({
      id: `${record.monthKey}_${record.residentId}`,
      month_key: record.monthKey,
      resident_id: record.residentId,
      status: record.status,
      paid_at: record.paidAt || null,
      notes: record.notes || null,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Background Supabase dues sync failed:', err);
  }
}

/**
 * Online CRUD helper: Upsert settings in Supabase
 */
export async function syncSettingsOnline(settings: RTSettings): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('rt_settings').upsert({
      id: 'default',
      rt_number: settings.rtNumber,
      rw_number: settings.rwNumber,
      subdistrict: settings.subdistrict,
      city: settings.city,
      treasurer_name: settings.treasurerName,
      default_monthly_fee: settings.defaultMonthlyFee,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Background Supabase settings sync failed:', err);
  }
}
