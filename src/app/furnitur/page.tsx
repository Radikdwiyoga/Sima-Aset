'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  QrCode, 
  Printer, 
  MoreVertical, 
  Minus, 
  Download
} from 'lucide-react';
import { Asset } from '@/types';
import { QRModal } from '@/components/QRModal';
import { AddAssetModal } from '@/components/AddAssetModal';
import { AssetDetailModal } from '@/components/AssetDetailModal';
import { exportAssetsToCSV } from '@/lib/export';
import { DataService } from '@/lib/dataService';

export default function FurniturPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('Gedung A');
  const [floorFilter, setFloorFilter] = useState('Lantai 2');
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchAssets = () => {
    setLoading(true);
    try {
      const data = DataService.getAssets({ category: 'furniture', search });
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

  // Handle live +/- quantity update
  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = assets.find((a) => a.id === id);
    if (!item) return;
    const newQty = Math.max(0, (item.quantity || 1) + delta);
    DataService.updateAsset(id, { quantity: newQty });
    fetchAssets();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Aset Furnitur</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Meja Kerja, Kursi Ergonomis, Lemari Arsip, Sofa, dan Partisi Ruangan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => exportAssetsToCSV(assets, 'laporan-aset-furnitur.xlsx')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={() => {
                if (assets.length > 0) {
                  setSelectedAssetForQR(assets[0]);
                  setIsQRModalOpen(true);
                }
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Label QR</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Furnitur</span>
            </button>
          </div>
        </div>

        {/* Location Dropdown Filter Bar (Matching Mockup 6) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
              Filter Lokasi:
            </span>

            {/* Gedung Filter */}
            <div className="relative">
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Gedung A">Gedung A</option>
                <option value="Gedung B">Gedung B</option>
              </select>
            </div>

            {/* Lantai Filter */}
            <div className="relative">
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Lantai 1">Lantai 1</option>
                <option value="Lantai 2">Lantai 2</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama furnitur / material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Table View (Matching Mockup 6) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-5 font-semibold w-24">Produk</th>
                  <th className="py-3 px-5 font-semibold">Name / Spesifikasi</th>
                  <th className="py-3 px-5 font-semibold text-center w-36">Quantity</th>
                  <th className="py-3 px-5 font-semibold text-center w-28">Kondisi</th>
                  <th className="py-3 px-5 font-semibold text-center w-20">QR Label</th>
                  <th className="py-3 px-5 font-semibold text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Memuat data inventaris furnitur...
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada furnitur yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  assets.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=120&auto=format&fit=crop&q=80"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span 
                          onClick={() => {
                            setSelectedAssetForDetail(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="font-bold text-slate-900 block text-xs cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-medium text-slate-500">
                            {item.locationName || item.location || '-'}
                          </span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.assetTag}
                          </span>
                        </div>
                        {(item.specificAttributes?.material || item.specification) && (
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Bahan: {item.specificAttributes?.material || item.specification}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {/* Stepper Counter (- 1 +) Matching Mockup 6 */}
                        <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50/80">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Kurangi Kuantitas"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-mono font-bold text-xs text-slate-800">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Tambah Kuantitas"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                            item.condition === 'Baik'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {item.condition === 'Baik' ? 'Aktif' : 'Perbaikan'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => {
                            setSelectedAssetForQR(item);
                            setIsQRModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
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
        defaultCategory="furniture"
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAssets}
      />
    </DashboardLayout>
  );
}
