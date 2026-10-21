'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Search, 
  Plus, 
  QrCode, 
  Download,
  Eye,
  Printer,
  Monitor
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

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Monitor className="w-6 h-6 text-blue-600" />
              <span>Aset Perangkat IT</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Komputer PC, laptop dinas, workstation, server, dan perangkat jaringan kantor
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => exportAssetsToCSV(assets, 'laporan-aset-it.xlsx')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor Excel</span>
            </button>

            <button
              onClick={() => {
                if (assets.length > 0) {
                  setSelectedAssetForQR(assets[0]);
                  setIsQRModalOpen(true);
                }
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Label QR</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Aset IT</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari perangkat IT, CPU, RAM, atau user pemegang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            Total Perangkat: <span className="text-slate-900 font-bold">{assets.length}</span> Unit
          </span>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80 font-bold">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 font-semibold">Kode Aset</th>
                  <th className="py-3.5 px-4 font-semibold">Nama Perangkat &amp; Merk</th>
                  <th className="py-3.5 px-4 font-semibold">Spesifikasi</th>
                  <th className="py-3.5 px-4 font-semibold">Lokasi / Pemegang</th>
                  <th className="py-3.5 px-4 font-semibold">Kondisi</th>
                  <th className="py-3.5 px-4 font-semibold">Status Operasional</th>
                  <th className="py-3.5 px-4 font-semibold text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-semibold">Memuat data perangkat IT...</span>
                      </div>
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                      Tidak ada aset IT yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  assets.map((item, index) => {
                    const spec = item.specification || (item.specificAttributes?.cpu 
                      ? `${item.specificAttributes.cpu}${item.specificAttributes.ram ? `, ${item.specificAttributes.ram}` : ''}`
                      : item.specificAttributes?.licenseKey || '-');

                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => {
                          setSelectedAssetForDetail(item);
                          setIsDetailModalOpen(true);
                        }}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 group-hover:underline">
                          {item.assetTag}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{item.name}</div>
                          {item.brand && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              {item.brand} {item.model ? `• ${item.model}` : ''}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium max-w-[200px] truncate" title={spec}>
                          {spec}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <div>{item.locationName || item.location || '-'}</div>
                          {item.assignedUserName && (
                            <div className="text-[10px] text-slate-400">{item.assignedUserName}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.condition === 'Baik'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.condition === 'Perbaikan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {item.condition}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Aktif'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAssetForQR(item);
                                setIsQRModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Label QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAssetForDetail(item);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Detail Aset"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
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
