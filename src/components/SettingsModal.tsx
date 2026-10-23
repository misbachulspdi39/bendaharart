import React, { useState } from 'react';
import { RTSettings } from '../types';
import { X, Settings, Check, Banknote } from 'lucide-react';
import { formatRupiah } from '../utils/format';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RTSettings;
  onSaveSettings: (newSettings: RTSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [rtNumber, setRtNumber] = useState(settings.rtNumber);
  const [rwNumber, setRwNumber] = useState(settings.rwNumber);
  const [subdistrict, setSubdistrict] = useState(settings.subdistrict);
  const [city, setCity] = useState(settings.city);
  const [treasurerName, setTreasurerName] = useState(settings.treasurerName);
  const [defaultMonthlyFeeStr, setDefaultMonthlyFeeStr] = useState(String(settings.defaultMonthlyFee));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseInt(defaultMonthlyFeeStr, 10) || 50000;
    onSaveSettings({
      rtNumber: rtNumber.trim() || '01',
      rwNumber: rwNumber.trim() || '01',
      subdistrict: subdistrict.trim() || 'Kelurahan',
      city: city.trim() || 'Kota',
      treasurerName: treasurerName.trim(),
      defaultMonthlyFee: fee,
    });
    onClose();
  };

  const parsedFee = parseInt(defaultMonthlyFeeStr, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pengaturan Kas RT</h3>
              <p className="text-xs text-slate-500">Sesuaikan identitas RT dan besaran iuran baku</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor RT</label>
              <input
                type="text"
                value={rtNumber}
                onChange={(e) => setRtNumber(e.target.value)}
                required
                placeholder="04"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor RW</label>
              <input
                type="text"
                value={rwNumber}
                onChange={(e) => setRwNumber(e.target.value)}
                required
                placeholder="08"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kelurahan / Desa</label>
            <input
              type="text"
              value={subdistrict}
              onChange={(e) => setSubdistrict(e.target.value)}
              required
              placeholder="Kelurahan Sukamaju"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Kota Bekasi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bendahara</label>
            <input
              type="text"
              value={treasurerName}
              onChange={(e) => setTreasurerName(e.target.value)}
              placeholder="Bambang Sutrisno"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-slate-400" />
                <span>Default Iuran Bulanan Baru (Rp)</span>
              </label>
              <span className="text-xs font-bold text-emerald-600">
                {formatRupiah(parsedFee)}
              </span>
            </div>
            <input
              type="number"
              min="5000"
              step="5000"
              value={defaultMonthlyFeeStr}
              onChange={(e) => setDefaultMonthlyFeeStr(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
