import React, { useState, useEffect } from 'react';
import { Resident } from '../../types';
import { X, UserPlus, UserCheck, Phone, Home, Banknote } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

interface ResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (residentData: Omit<Resident, 'id' | 'createdAt'>, existingId?: string) => void;
  editingResident?: Resident | null;
  defaultFee: number;
}

export const ResidentModal: React.FC<ResidentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingResident,
  defaultFee,
}) => {
  const [name, setName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyFeeStr, setMonthlyFeeStr] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingResident) {
      setName(editingResident.name);
      setHouseNumber(editingResident.houseNumber);
      setPhone(editingResident.phone || '');
      setMonthlyFeeStr(String(editingResident.monthlyFee || defaultFee));
      setNotes(editingResident.notes || '');
    } else {
      setName('');
      setHouseNumber('');
      setPhone('');
      setMonthlyFeeStr(String(defaultFee || 50000));
      setNotes('');
    }
  }, [editingResident, defaultFee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Mohon masukkan nama warga.');
      return;
    }
    if (!houseNumber.trim()) {
      alert('Mohon masukkan blok/nomor rumah.');
      return;
    }
    const fee = parseInt(monthlyFeeStr, 10);
    if (!fee || fee <= 0) {
      alert('Nominal iuran per bulan harus lebih besar dari 0.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        houseNumber: houseNumber.trim(),
        phone: phone.trim() || undefined,
        monthlyFee: fee,
        notes: notes.trim() || undefined,
      },
      editingResident?.id
    );
    onClose();
  };

  const parsedFee = parseInt(monthlyFeeStr, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-800 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              {editingResident ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingResident ? 'Edit Data Warga' : 'Tambah Warga Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Informasi kepala keluarga / penghuni untuk iuran RT
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nama Warga */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Warga (Kepala Keluarga) *
            </label>
            <input
              type="text"
              placeholder="Contoh: Bpk. Joko Widodo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Blok / Nomor Rumah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Blok / Nomor Rumah *</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Blok A1 No. 05"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Nominal Iuran Per Bulan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-slate-400" />
                <span>Nominal Iuran Per Bulan (Rp) *</span>
              </label>
              {parsedFee > 0 && (
                <span className="text-xs font-bold text-emerald-600">
                  {formatRupiah(parsedFee)}
                </span>
              )}
            </div>
            <input
              type="number"
              min="5000"
              step="5000"
              placeholder="50000"
              value={monthlyFeeStr}
              onChange={(e) => setMonthlyFeeStr(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Standar iuran umum RT: {formatRupiah(defaultFee)} / bulan.
            </p>
          </div>

          {/* No WhatsApp / HP */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Nomor WhatsApp / HP (Opsional)</span>
            </label>
            <input
              type="tel"
              placeholder="Contoh: 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Digunakan untuk mengirim bukti bayar atau pengingat iuran via WhatsApp.
            </p>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Status Rumah (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Rumah sewa / pemilik sendiri / kosong"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Actions */}
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
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              {editingResident ? 'Simpan Perubahan' : 'Tambahkan Warga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
