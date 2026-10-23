import React, { useRef, useState } from 'react';
import { AppStateData } from '../types';
import { exportToJsonFile, exportToCsvFile } from '../utils/format';
import { generateStandaloneHtml } from '../utils/standaloneHtml';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileCode2, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppStateData;
  onRestoreState: (state: AppStateData) => void;
  onResetState: () => void;
  onOpenSupabase?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  appState,
  onRestoreState,
  onResetState,
  onOpenSupabase,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleExportJson = () => {
    const filename = `backup-kas-rt-lengkap-${new Date().toISOString().slice(0, 10)}.json`;
    exportToJsonFile(filename, appState);
    showSuccess('File backup JSON berhasil diunduh!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.residents)) {
          alert('Format file JSON tidak sesuai dengan struktur backup Buku Kas RT.');
          return;
        }

        onRestoreState(parsed);
        showSuccess(`Berhasil memulihkan ${parsed.transactions.length} transaksi dan ${parsed.residents.length} warga!`);
      } catch (err) {
        alert('Gagal membaca file JSON. Pastikan file valid.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buku-bendahara-kas-rt-standalone.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('File standalone HTML (Vanilla JS) berhasil diunduh! Dapat dibuka langsung tanpa internet.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manajemen Data & Backup</h3>
              <p className="text-xs text-slate-500">Ekspor, impor, dan cadangkan data Kas RT Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Card 0: Database Supabase Online */}
          {onOpenSupabase && (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-700" />
                    <span>Database Online Supabase</span>
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Hubungkan ke PostgreSQL Supabase untuk sinkronisasi otomatis dan skrip SQL tabel.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSupabase();
                }}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Buka Pengaturan Supabase & Skrip SQL ➔</span>
              </button>
            </div>
          )}

          {/* Card 1: Backup JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Cadangkan Seluruh Data (JSON)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simpan semua kas, daftar warga, riwayat iuran ke dalam satu berkas file JSON.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportJson}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File Cadangan JSON</span>
            </button>
          </div>

          {/* Card 2: Restore JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-teal-600" />
                <span>Pulihkan Data dari File Cadangan</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Unggah file JSON backup sebelumnya untuk mengembalikan catatan kas dan iuran.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-white hover:bg-teal-50 text-teal-700 border border-teal-300 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih & Pulihkan File JSON</span>
            </button>
          </div>

          {/* Card 3: Standalone Single-File HTML Exporter */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white space-y-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-emerald-700" />
                  <span>Unduh Versi Standalone Single-File (.html)</span>
                </h4>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                  Vanilla JS
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                File HTML mandiri lengkap (Tailwind via CDN + Vanilla JS murni) yang dapat dibuka di HP atau laptop mana pun langsung tanpa instalasi!
              </p>
            </div>
            <button
              onClick={handleDownloadStandaloneHtml}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas Standalone HTML</span>
            </button>
          </div>

          {/* Card 4: Reset Data */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
            <div>
              <h4 className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reset ke Data Bawaan / Contoh</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengembalikan aplikasi ke data sampel contoh RT 04 / RW 08.
              </p>
            </div>

            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs transition"
              >
                Reset Data Aplikasi...
              </button>
            ) : (
              <div className="p-3 bg-white rounded-lg border border-rose-300 space-y-2">
                <p className="text-xs font-semibold text-rose-700">
                  ⚠️ Yakin ingin mereset? Pastikan Anda sudah mencadangkan file JSON jika ada data penting.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded bg-slate-100 text-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      onResetState();
                      setResetConfirm(false);
                      showSuccess('Data aplikasi telah direset ke setelan awal.');
                    }}
                    className="flex-1 py-1.5 text-xs font-bold rounded bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Ya, Reset Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
