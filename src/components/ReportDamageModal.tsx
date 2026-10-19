'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Check, Wrench } from 'lucide-react';
import { DataService } from '@/lib/dataService';
import { Asset, MaintenanceLog } from '@/types';

interface ReportDamageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReportDamageModal({ isOpen, onClose, onSuccess }: ReportDamageModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [urgency, setUrgency] = useState<'Normal' | 'Mendesak'>('Normal');
  const [locationDetail, setLocationDetail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAssets(DataService.getAssets().filter(a => a.status !== 'Dihapusbukukan'));
      setIsSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !issueDescription.trim()) return;

    const targetAsset = assets.find(a => a.id === selectedAssetId || a.assetTag === selectedAssetId);
    if (!targetAsset) return;

    // Create maintenance log
    const STORAGE_KEY = 'sima_maintenance_logs';
    let logs: MaintenanceLog[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) logs = JSON.parse(stored);
      } catch {}
    }

    const newLog: MaintenanceLog = {
      id: `mnt-${Date.now()}`,
      assetId: targetAsset.id,
      assetTag: targetAsset.assetTag,
      assetName: targetAsset.name,
      type: 'Perbaikan',
      scheduleDate: new Date().toISOString().split('T')[0],
      completionDate: null,
      vendorName: 'Tim Teknisi Internal / Vendor',
      cost: 0,
      notes: `[Laporan Karyawan: ${reporterName || 'Staff'} - ${urgency}] ${issueDescription} (Lokasi: ${locationDetail || targetAsset.location})`,
      status: 'Sedang Berjalan'
    };

    logs = [newLog, ...logs];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }

    // Update asset condition to 'Perbaikan'
    DataService.updateAsset(targetAsset.id, {
      condition: 'Perbaikan',
      status: 'Dalam Perbaikan'
    });

    setIsSubmitted(true);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lapor Kerusakan / Kendala Aset</h3>
              <p className="text-[11px] text-slate-500">Tiket perbaikan langsung diteruskan ke tim Admin IT / GA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Laporan Berhasil Dibuat!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tiket servis perbaikan telah terdaftar di jadwal pemeliharaan dan teknisi terkait akan segera menindaklanjuti.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pilih Aset yang Bermasalah <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Pilih Kode atau Nama Aset --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} - {a.name} ({a.category} &bull; {a.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pelapor / Karyawan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkat Urgensi
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as 'Normal' | 'Mendesak')}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Normal">Normal (Bisa Dijadwalkan)</option>
                  <option value="Mendesak">Mendesak (Mengganggu Kerja)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lokasi Spesifik / Ruangan
              </label>
              <input
                type="text"
                placeholder="Contoh: Meja Tim Finance Lantai 2, Ruang Rapat Utama"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Deskripsi Kendala & Gejala Kerusakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jelaskan secara ringkas kendala yang dialami, misalnya layar berkedip, AC tidak dingin, kabel putus..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-amber-500/20 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Kirim Laporan Kerusakan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
