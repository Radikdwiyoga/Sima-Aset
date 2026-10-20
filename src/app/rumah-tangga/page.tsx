'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  QrCode, 
  Coffee, 
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

export default function RumahTanggaPage() {
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
      const data = DataService.getAssets({ category: 'rumah-tangga', search });
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

  // 4 Featured Pantry Items (Matching Top Cards in Mockup 4)
  const topCards = [
    {
      name: 'Dispenser',
      location: 'Pantry Lt. 1',
      tag: '6FF2942',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80',
      status: 'Aktif'
    },
    {
      name: 'Mesin Kopi',
      location: 'Lobby',
      tag: '6FF2943',
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&auto=format&fit=crop&q=80',
      status: 'Aktif'
    },
    {
      name: 'Kulkas',
      location: 'Pantry Lt. 1',
      tag: '6FF2941',
      image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80',
      status: 'Aktif'
    },
    {
      name: 'Tabung APAR',
      location: 'Lobby',
      tag: '6FF2940',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80',
      status: 'Aktif'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Rumah Tangga Kantor</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Office Pantry & Utility, Alat Kebersihan, dan Keselamatan Gedung
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => exportAssetsToCSV(assets, 'laporan-aset-rumah-tangga.xlsx')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Aset Pantry</span>
            </button>
          </div>
        </div>

        {/* Section: Office Pantry & Utility (Matching Mockup 4 Top Grid) */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-emerald-600" />
            <span>Office Pantry & Utility</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topCards.map((card) => (
              <div
                key={card.name}
                className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-center text-center group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  const found = assets.find((a) => a.name.includes(card.name) || a.assetTag === card.tag);
                  if (found) {
                    setSelectedAssetForQR(found);
                    setIsQRModalOpen(true);
                  }
                }}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center mb-3 border border-slate-100 group-hover:scale-105 transition-transform">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-slate-800 text-xs">{card.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{card.location}</p>
                <span className="mt-2 text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {card.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aset rumah tangga atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 text-xs text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500">Total: {assets.length} item</span>
        </div>

        {/* Table View (Matching Mockup 4) */}
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
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Kondisi</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">QR Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Memuat data aset rumah tangga...
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada aset yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  assets.map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
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
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {item.locationName || item.location || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white shadow-xs">
                            {item.condition === 'Baik' ? 'Aktif' : item.condition}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.condition === 'Rusak'
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.condition === 'Rusak' ? 'Rusak' : 'Tersedia'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
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
        defaultCategory="rumah-tangga"
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAssets}
      />
    </DashboardLayout>
  );
}
