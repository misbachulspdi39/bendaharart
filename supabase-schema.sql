-- ==============================================================================
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
    month_key TEXT NOT NULL, -- Format 'YYYY-MM', contoh: '2026-10'
    resident_id TEXT NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Lunas', 'Terutang')),
    paid_at TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_month_resident UNIQUE (month_key, resident_id)
);

-- Indexing untuk query cepat
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_dues_month ON public.monthly_dues_records(month_key);
CREATE INDEX IF NOT EXISTS idx_dues_resident ON public.monthly_dues_records(resident_id);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.rt_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_dues_records ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan Akses (Policy) Publik Anonim (Read & Write dengan Anon Key)
CREATE POLICY "Akses Penuh rt_settings" ON public.rt_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh residents" ON public.residents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh monthly_dues_records" ON public.monthly_dues_records FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- DATA AWAL CONTOH (SEED DATA)
-- ==============================================================================

INSERT INTO public.rt_settings (id, rt_number, rw_number, subdistrict, city, treasurer_name, default_monthly_fee)
VALUES ('default', '04', '08', 'Kelurahan Sukamaju', 'Kota Bekasi', 'Bambang Sutrisno', 50000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.residents (id, name, house_number, phone, monthly_fee, created_at)
VALUES 
    ('res-1', 'Bpk. Joko Widodo', 'Blok A1 No. 01', '081234567890', 50000, 1760000000000),
    ('res-2', 'Ibu Hj. Siti Aminah', 'Blok A1 No. 02', '081398765432', 50000, 1760000000000),
    ('res-3', 'Bpk. Hendra Gunawan', 'Blok A2 No. 05', '085711223344', 50000, 1760000000000),
    ('res-4', 'Bpk. Ir. Ahmad Dahlan', 'Blok B1 No. 03', '081900112233', 50000, 1760000000000),
    ('res-5', 'Bpk. Budi Santoso', 'Blok B2 No. 08', '082155667788', 50000, 1760000000000),
    ('res-6', 'Ibu Ratna Sari', 'Blok C1 No. 04', '081544332211', 50000, 1760000000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transactions (id, date, type, category, amount, description, created_at)
VALUES 
    ('tx-1', '2026-10-01', 'pemasukan', 'Kas Awal / Saldo Awal', 3500000, 'Saldo awal kas RT bulan Oktober 2026', 1760000000000),
    ('tx-2', '2026-10-04', 'pemasukan', 'Iuran Warga Bulanan', 200000, 'Penerimaan iuran warga minggu ke-1 (4 warga)', 1760100000000),
    ('tx-3', '2026-10-07', 'pengeluaran', 'Kebersihan & Sampah', 350000, 'Honor petugas kebersihan & pengangkutan sampah RT', 1760200000000),
    ('tx-4', '2026-10-11', 'pengeluaran', 'Perbaikan Lampu & Sarana', 175000, 'Beli 3 set bohlam LED tiang lampu jalan Blok B dan fitting', 1760300000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.monthly_dues_records (id, month_key, resident_id, status, paid_at)
VALUES 
    ('2026-09_res-1', '2026-09', 'res-1', 'Terutang', NULL),
    ('2026-09_res-2', '2026-09', 'res-2', 'Lunas', '2026-09-05'),
    ('2026-10_res-1', '2026-10', 'res-1', 'Terutang', NULL),
    ('2026-10_res-2', '2026-10', 'res-2', 'Lunas', '2026-10-04')
ON CONFLICT (id) DO NOTHING;
