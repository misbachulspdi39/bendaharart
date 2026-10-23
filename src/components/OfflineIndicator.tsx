import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 rounded-xl bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-xl animate-in slide-in-from-bottom-2">
      <div className="p-1.5 rounded-lg bg-amber-700/80 shrink-0">
        <WifiOff className="w-4 h-4 animate-pulse" />
      </div>
      <div className="flex-1">
        <p className="font-bold">Mode Offline Aktif</p>
        <p className="text-amber-100 text-xs">
          Semua perubahan tetap tersimpan aman di LocalStorage HP / Laptop Anda.
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-1 text-[11px] bg-amber-700/50 px-2 py-1 rounded">
        <Database className="w-3 h-3" />
        <span>Tersimpan</span>
      </div>
    </div>
  );
};
