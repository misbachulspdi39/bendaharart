import React, { useState, useEffect } from 'react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  removeSupabaseConfig, 
  testSupabaseConnection, 
  fetchSupabaseData, 
  uploadLocalToSupabase 
} from '../lib/supabase';
import { AppStateData } from '../types';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Upload, 
  Download, 
  Key, 
  Globe, 
  Code2, 
  ShieldCheck,
  Check
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppStateData;
  onApplySupabaseData: (data: AppStateData) => void;
  isOnlineConnected: boolean;
  setIsOnlineConnected: (connected: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  appState,
  onApplySupabaseData,
  isOnlineConnected,
  setIsOnlineConnected,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'sql'>('config');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tablesExist: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      if (cfg) {
        setUrl(cfg.url);
        setAnonKey(cfg.anonKey);
      }
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const SQL_SCRIPT = `-- ==============================================================================
-- SKRIP PEMBUATAN TABEL UNTUK SUPABASE: BUKU BENDAHARA KAS RT
-- Jalankan skrip ini di menu SQL Editor pada Dashboard Supabase Anda
-- ==============================================================================

-- 1. TABEL PENGATURAN RT (rt_settings)
CREATE TABLE IF NOT EXISTS public.rt_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    rt_number TEXT NOT NULL DEFAULT '04',
    rw_number TEXT NOT NULL DEFAULT '08',
    subdistrict TEXT NOT NULL DEFAULT 'Kelurahan Sukamaju',
    city TEXT NOT NULL DEFAULT 'Kota Bekasi',
    treasurer_name TEXT DEFAULT 'Bambang Sutrisno',
    default_monthly_fee BIGINT NOT NULL DEFAULT 50000,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. TABEL DATA WARGA (residents)
CREATE TABLE IF NOT EXISTS public.residents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    house_number TEXT NOT NULL,
    phone TEXT,
    monthly_fee BIGINT NOT NULL DEFAULT 50000,
    notes TEXT,
    created_at BIGINT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. TABEL TRANSAKSI KAS RT (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pemasukan', 'pengeluaran')),
    category TEXT NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    resident_id TEXT REFERENCES public.residents(id) ON DELETE SET NULL,
    created_at BIGINT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. TABEL REKAP IURAN BULANAN (monthly_dues_records)
CREATE TABLE IF NOT EXISTS public.monthly_dues_records (
    id TEXT PRIMARY KEY,
    month_key TEXT NOT NULL,
    resident_id TEXT NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Lunas', 'Terutang')),
    paid_at TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_month_resident UNIQUE (month_key, resident_id)
);

-- Indexing untuk kecepatan pencarian
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_dues_month ON public.monthly_dues_records(month_key);
CREATE INDEX IF NOT EXISTS idx_dues_resident ON public.monthly_dues_records(resident_id);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.rt_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_dues_records ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Publik (Read & Write Anonim)
CREATE POLICY "Akses Penuh rt_settings" ON public.rt_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh residents" ON public.residents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh monthly_dues_records" ON public.monthly_dues_records FOR ALL USING (true) WITH CHECK (true);

-- DATA CONTOH AWAL
INSERT INTO public.rt_settings (id, rt_number, rw_number, subdistrict, city, treasurer_name, default_monthly_fee)
VALUES ('default', '04', '08', 'Kelurahan Sukamaju', 'Kota Bekasi', 'Bambang Sutrisno', 50000)
ON CONFLICT (id) DO NOTHING;`;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      alert('Mohon masukkan Project URL dan Anon Public Key Supabase.');
      return;
    }
    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(res);

    if (res.success && res.tablesExist) {
      saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
      setIsOnlineConnected(true);
      onShowToast('Database Supabase berhasil terhubung secara online!');
    }
  };

  const handleSaveAndConnect = async () => {
    await handleTestConnection();
  };

  const handleDisconnect = () => {
    removeSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setIsOnlineConnected(false);
    setTestResult(null);
    onShowToast('Koneksi Supabase diputuskan. Beralih ke LocalStorage.');
  };

  const handleUploadLocalToCloud = async () => {
    setSyncing(true);
    const res = await uploadLocalToSupabase(appState);
    setSyncing(false);
    if (res.success) {
      onShowToast(res.message);
    } else {
      alert(res.message);
    }
  };

  const handleDownloadFromCloud = async () => {
    setSyncing(true);
    const res = await fetchSupabaseData();
    setSyncing(false);
    if (res.success && res.data) {
      onApplySupabaseData(res.data);
      onShowToast('Data dari Supabase berhasil disinkronkan ke aplikasi!');
      onClose();
    } else {
      alert(res.error || 'Gagal mengunduh data dari Supabase.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    onShowToast('Skrip SQL berhasil disalin ke clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-800 space-y-4 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Database Online Supabase</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isOnlineConnected 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isOnlineConnected ? '🟢 Full Online' : '🟠 Belum Terhubung'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Hubungkan kas RT ke PostgreSQL Supabase untuk akses online antar perangkat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveSubTab('config')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Koneksi Database</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>2. Skrip SQL Tabel Supabase</span>
          </button>
        </div>

        {/* Sub-tab 1: Configuration & Sync */}
        {activeSubTab === 'config' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Guide Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cara Menghubungkan Supabase Anda:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>Buka dashboard proyek Anda di <strong>https://supabase.com/dashboard</strong>.</li>
                <li>Jalankan skrip tabel pada tab <strong>"2. Skrip SQL Tabel Supabase"</strong> di menu SQL Editor Supabase.</li>
                <li>Salin <strong>Project URL</strong> dan <strong>anon public key</strong> dari menu <em>Project Settings &gt; API</em>.</li>
              </ol>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Supabase Project URL *</span>
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Supabase Anon Public API Key *</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono resize-none"
                />
              </div>
            </div>

            {/* Test result message */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                  testResult.success
                    ? testResult.tablesExist
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.message}</p>
                  {!testResult.tablesExist && testResult.success && (
                    <button
                      onClick={() => setActiveSubTab('sql')}
                      className="mt-1 text-xs text-amber-900 underline font-bold"
                    >
                      Buka tab Skrip SQL untuk membuat tabel sekarang ➔
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={handleSaveAndConnect}
                disabled={testing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menguji Koneksi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hubungkan Database Supabase</span>
                  </>
                )}
              </button>

              {isOnlineConnected && (
                <button
                  onClick={handleDisconnect}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition"
                >
                  Putuskan
                </button>
              )}
            </div>

            {/* Online Sync Box (when connected) */}
            {isOnlineConnected && (
              <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Sinkronisasi Data Kas & Iuran</h4>
                    <p className="text-[11px] text-emerald-700">
                      Unggah data lokal ke Supabase atau ambil data terbaru dari cloud
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleUploadLocalToCloud}
                    disabled={syncing}
                    className="py-2 px-3 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unggah ke Supabase</span>
                  </button>

                  <button
                    onClick={handleDownloadFromCloud}
                    disabled={syncing}
                    className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Ambil dari Supabase</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 2: SQL DDL Script */}
        {activeSubTab === 'sql' && (
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                Salin skrip di bawah ini lalu jalankan di <strong>Supabase SQL Editor</strong>:
              </p>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin Seluruh SQL'}</span>
              </button>
            </div>

            <div className="relative rounded-xl border border-slate-800 bg-slate-900 text-slate-100 p-3.5 font-mono text-xs overflow-x-auto max-h-[350px]">
              <pre>{SQL_SCRIPT}</pre>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <strong>Tabel yang akan dibuat:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-500">
                <li><code>public.rt_settings</code>: Pengaturan identitas RT & iuran default</li>
                <li><code>public.residents</code>: Data nama, blok rumah, kontak warga</li>
                <li><code>public.transactions</code>: Riwayat transaksi kas masuk & keluar</li>
                <li><code>public.monthly_dues_records</code>: Rekap status iuran bulanan (Lunas / Terutang)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
