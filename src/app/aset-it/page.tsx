'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  QrCode, 
  Printer, 
  CheckSquare, 
  Square,
  Download
} from 'lucide-react';
import { Asset } from '@/types';
import { QRModal } from '@/components/QRModal';
import { AddAssetModal } from '@/components/AddAssetModal';
import { AssetDetailModal } from '@/components/AssetDetailModal';
import { exportAssetsToCSV } from '@/lib/export';
import { DataService } from '@/lib/dataService';

export default function AsetITPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchAssets = () => {
    setLoading(true);
    try {
      const data = DataService.getAssets({ category: 'it', search });
      setAssets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [search]);

  const toggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenQR = (asset: Asset) => {
    setSelectedAssetForQR(asset);
    setIsQRModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Aset IT</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Komputer, Laptop, Server, Perangkat Jaringan, dan Lisensi Software
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => exportAssetsToCSV(assets, 'laporan-aset-it.xlsx')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  const target = assets.find((a) => selectedIds.includes(a.id));
                  if (target) handleOpenQR(target);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Label ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Aset IT</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar (Matching Mockup 3) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 text-xs text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium self-end sm:self-auto">
            Menampilkan <span className="font-bold text-slate-800">{assets.length}</span> unit perangkat IT
          </div>
        </div>

        {/* Table View (Matching Mockup 3) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                      {selectedIds.length === assets.length && assets.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 font-semibold">Kode Aset</th>
                  <th className="py-3 px-4 font-semibold">Nama Perangkat</th>
                  <th className="py-3 px-4 font-semibold">Spesifikasi</th>
                  <th className="py-3 px-4 font-semibold">Pemegang</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">QR Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Memuat data inventaris IT...
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada aset IT yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  assets.map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    const spec = item.specification || (item.specificAttributes?.cpu 
                      ? `${item.specificAttributes.cpu}${item.specificAttributes.ram ? `, ${item.specificAttributes.ram}` : ''}`
                      : item.specificAttributes?.licenseKey || '-');

                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isChecked ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleSelect(item.id)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td 
                          onClick={() => {
                            setSelectedAssetForDetail(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="py-3.5 px-4 font-mono font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {item.assetTag}
                        </td>
                        <td 
                          onClick={() => {
                            setSelectedAssetForDetail(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="py-3.5 px-4 font-semibold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                          {spec}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {item.assignedUserName || item.assignedTo || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white shadow-xs">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenQR(item)}
                            title="Lihat & Cetak QR Code"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <QRModal
        asset={selectedAssetForQR}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      <AssetDetailModal
        asset={selectedAssetForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdated={fetchAssets}
      />

      <AddAssetModal
        isOpen={isAddModalOpen}
        defaultCategory="it"
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAssets}
      />
    </DashboardLayout>
  );
}
