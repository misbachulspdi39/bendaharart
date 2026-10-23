import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-white border border-emerald-400/40 px-3 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95"
        title="Pasang aplikasi di layar utama HP atau desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/25 px-3 py-1.5 text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📱</span> Pasang di iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Langkah 1</p>
                    <p className="text-xs text-slate-500">Tekan tombol <strong>Bagikan / Share</strong> di bilah bawah browser Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Langkah 2</p>
                    <p className="text-xs text-slate-500">Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button for devices where beforeinstallprompt isn't fired yet
  return (
    <button
      onClick={() => alert('Untuk menginstall: Buka menu browser (titik 3 di Chrome atau tombol Bagikan di Safari) lalu pilih "Tambahkan ke Layar Utama" / "Install Aplikasi".')}
      className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/25 px-2.5 py-1.5 text-xs font-semibold shadow-sm transition"
      title="Install PWA ke Home Screen"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install PWA</span>
    </button>
  );
};
