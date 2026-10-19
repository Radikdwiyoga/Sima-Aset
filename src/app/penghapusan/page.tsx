'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AlertTriangle, Plus, X, Check, ShieldAlert } from 'lucide-react';
import { DataService, AssetDisposal } from '@/lib/dataService';
import { Asset } from '@/types';

export default function PenghapusanPage() {
  const [disposals, setDisposals] = useState<AssetDisposal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [reason, setReason] = useState('');

  const reloadData = () => {
    const dList = DataService.getDisposals();
    setDisposals(dList);
    const aList = DataService.getAssets();
    setAssets(aList.filter(a => a.status !== 'Dihapusbukukan'));
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !reason.trim()) return;

    const targetAsset = assets.find(a => a.id === selectedAssetId || a.assetTag === selectedAssetId);
    if (!targetAsset) return;

    DataService.createDisposal({
      assetId: targetAsset.id,
      tag: targetAsset.assetTag,
      name: targetAsset.name,
      category: targetAsset.category,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      reason: reason.trim(),
      approval: 'Disetujui Manajemen',
      status: 'Dihapusbukukan'
    });

    setIsModalOpen(false);
    setSelectedAssetId('');
    setReason('');
    reloadData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Penghapusan Aset (Disposal)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar aset yang telah dihapusbukukan karena rusak permanen, hilang, atau habis masa pakai
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-rose-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Berita Acara Penghapusan</span>
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Penghapusan aset memerlukan persetujuan Berita Acara Pemusnahan/Penghapusan Aset oleh Manajemen dan Tim General Affairs. Aset yang dihapusbukukan tidak lagi dihitung dalam total nilai buku aktif.
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Kode Aset</th>
                  <th className="py-3 px-4 font-semibold">Nama Aset</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Tanggal Penghapusan</th>
                  <th className="py-3 px-4 font-semibold">Alasan Penghapusan</th>
                  <th className="py-3 px-4 font-semibold">Status Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {disposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada riwayat aset yang dihapusbukukan.
                    </td>
                  </tr>
                ) : (
                  disposals.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{item.tag}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{item.date}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">{item.reason}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {item.approval || item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Disposal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Form Berita Acara Penghapusan Aset
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilih Aset yang Dihapusbukukan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Pilih Aset --</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetTag} - {a.name} ({a.category} - {a.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alasan Penghapusan & Kondisi Kerusakan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Jelaskan kondisi fisik aset, estimasi biaya perbaikan yang melebihi nilai aset, atau rekomendasi teknisi..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                  <p className="font-semibold text-slate-800">Ketentuan Penghapusan:</p>
                  <p>&bull; Status aset akan diubah secara permanen menjadi <strong>Dihapusbukukan</strong>.</p>
                  <p>&bull; Aset tidak akan muncul di daftar peminjaman atau audit stok berjalan.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-rose-500/20 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Hapusbukukan Aset</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
