'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  QrCode, 
  MoreVertical, 
  Wrench, 
  Download
} from 'lucide-react';
import { Asset } from '@/types';
import { QRModal } from '@/components/QRModal';
import { AddAssetModal } from '@/components/AddAssetModal';
import { AssetDetailModal } from '@/components/AssetDetailModal';
import { exportAssetsToCSV } from '@/lib/export';
import { DataService } from '@/lib/dataService';

export default function ElektronikPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchAssets = () => {
    setLoading(true);
    try {
      const data = DataService.getAssets({ category: 'elektronik', search });
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

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Aset Elektronik</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Air Conditioner (AC), Smart TV, Proyektor, CCTV, dan Sound System
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => exportAssetsToCSV(assets, 'laporan-aset-elektronik.xlsx')}
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
              <span>+ Tambah Elektronik</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aset elektronik, AC, TV, proyektor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 text-xs text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total: <span className="font-bold text-slate-800">{assets.length}</span> unit
          </span>
        </div>

        {/* Table View (Matching Mockup 5) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Aset</th>
                  <th className="py-3 px-4 font-semibold">Nama</th>
                  <th className="py-3 px-4 font-semibold">Spesifikasi & Daya</th>
                  <th className="py-3 px-4 font-semibold">Pemegang & Vendor</th>
                  <th className="py-3 px-4 font-semibold text-center">QR Code</th>
                  <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Memuat data aset elektronik...
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada aset elektronik yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  assets.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80">
                            <img
                              src={item.image || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=80"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span 
                              onClick={() => {
                                setSelectedAssetForDetail(item);
                                setIsDetailModalOpen(true);
                              }}
                              className="font-mono font-bold text-slate-900 block cursor-pointer hover:text-blue-600 transition-colors"
                            >
                              {item.assetTag}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.brand || 'Daikin'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td 
                        onClick={() => {
                          setSelectedAssetForDetail(item);
                          setIsDetailModalOpen(true);
                        }}
                        className="py-3 px-4 font-semibold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-medium text-slate-800 block text-[11px]">
                          {item.specificAttributes?.wattage ? `${item.specificAttributes.wattage} Watt` : (item.specification || 'Daya Standar')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Siklus Servis: Tiap {item.specificAttributes?.maintenanceCycleMonths || 3} Bulan
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"
                            alt="PIC"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-medium text-slate-800 text-[11px] block">
                              {item.assignedUserName || item.assignedTo || 'General Affairs'}
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold">
                              {item.specificAttributes?.vendorStatus || item.specificAttributes?.vendorName || item.brand || 'Vendor Rekanan'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
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
                      <td className="py-3 px-4 text-center">
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
        defaultCategory="elektronik"
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAssets}
      />
    </DashboardLayout>
  );
}
