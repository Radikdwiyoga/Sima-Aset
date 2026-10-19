'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  FileSpreadsheet, 
  Lock, 
  Printer, 
  ChevronDown, 
  Upload
} from 'lucide-react';
import { Asset } from '@/types';
import { exportAssetsToExcel, exportAssetsToPDF } from '@/lib/export';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/lib/dataService';
import { ImportExcelModal } from '@/components/ImportExcelModal';

export default function AsetPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importAlert, setImportAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Aktif' | 'Tidak Aktif' | 'Dalam Perbaikan'>('Semua');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedLocation, setSelectedLocation] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string }[]>([]);
  const [locationOptions, setLocationOptions] = useState<{ name: string }[]>([]);

  const fetchAssets = () => {
    setLoading(true);
    try {
      setAllAssets(DataService.getAssets());
      const data = DataService.getAssets({
        status: activeTab !== 'Semua' ? activeTab : selectedStatus,
        category: selectedCategory,
        location: selectedLocation,
        search
      });
      setAssets(data);
      setTotalCount(data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load master data for filter dropdowns + full list for tab counts
  useEffect(() => {
    setAllAssets(DataService.getAssets());
    setCategoryOptions(DataService.getCategories().map((c) => ({ label: c.name })));
    setLocationOptions(DataService.getLocations().map((l) => ({ name: l.name })));
  }, []);

  // Support deep links like /aset?category=Kendaraan (from kategori page)
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat) setSelectedCategory(cat);
  }, []);

  useEffect(() => {
    setPage(1);
    fetchAssets();
  }, [activeTab, selectedCategory, selectedLocation, selectedStatus, search]);

  const handleExportExcel = () => {
    exportAssetsToExcel(assets, `SIMA_Data_Aset_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const tabs: { label: 'Semua' | 'Aktif' | 'Tidak Aktif' | 'Dalam Perbaikan'; count: number }[] = [
    { label: 'Semua', count: allAssets.length },
    { label: 'Aktif', count: allAssets.filter((a) => a.status === 'Aktif').length },
    { label: 'Tidak Aktif', count: allAssets.filter((a) => a.status === 'Tidak Aktif').length },
    { label: 'Dalam Perbaikan', count: allAssets.filter((a) => a.status === 'Dalam Perbaikan').length }
  ];

  const totalPages = Math.max(1, Math.ceil(assets.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = assets.slice((safePage - 1) * pageSize, safePage * pageSize);
  const rangeStart = assets.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, assets.length);

  const canCreate = hasPermission('canCreateAsset');

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 w-full">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Data Aset</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola dan pantau seluruh daftar aset perusahaan terintegrasi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Export Dropdown (Excel & PDF) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Unduh Data</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      handleExportExcel();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Download Excel (.csv)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      exportAssetsToPDF(assets, `Laporan Data Aset - Kategori ${activeTab}`);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Cetak / Download PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Import Excel Button */}
            {canCreate && (
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                title="Migrasi data aset massal dari file Excel / CSV"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Import Excel</span>
              </button>
            )}

            {canCreate ? (
              <Link
                href="/aset/tambah"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Aset</span>
              </Link>
            ) : (
              <div 
                className="px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-not-allowed"
                title="Peran Anda (Staff) hanya memiliki akses melihat. Hubungi Admin untuk menambah aset."
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>+ Tambah Aset (Admin)</span>
              </div>
            )}
          </div>
        </div>

        {/* Alert Notification */}
        {importAlert && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm font-medium animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{importAlert}</span>
            </div>
            <button
              onClick={() => setImportAlert(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline ml-4 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Status Tabs (Matching Screen 2) */}
        <div className="flex items-center gap-3 border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`py-3 px-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar (Matching Screen 2) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Kategori Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold text-xs uppercase">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Semua">Semua Kategori</option>
                {categoryOptions.map((c) => (
                  <option key={c.label} value={c.label}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Lokasi Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold text-xs uppercase">Lokasi:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Semua">Semua Lokasi</option>
                {locationOptions.map((l) => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold text-xs uppercase">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
                <option value="Dalam Perbaikan">Dalam Perbaikan</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari aset, tag, nomor seri..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
              />
            </div>
            <button
              onClick={fetchAssets}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Terapkan Filter"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table (Matching Screen 2) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-xs tracking-wider border-b border-slate-200/80 font-bold">
                <tr>
                  <th className="py-4 px-5 w-14 text-center">No</th>
                  <th className="py-4 px-5">Kode Aset</th>
                  <th className="py-4 px-5">Nama Aset</th>
                  <th className="py-4 px-5">Kategori</th>
                  <th className="py-4 px-5">Lokasi</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Tanggal Perolehan</th>
                  <th className="py-4 px-5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-semibold">Memuat data inventaris...</span>
                      </div>
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ada aset yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item, index) => (
                    <tr 
                      key={item.id} 
                      onClick={() => router.push(`/aset/${item.id}`)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-5 text-center text-slate-400 font-mono text-xs">
                        {(safePage - 1) * pageSize + index + 1}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-blue-600 group-hover:underline text-sm">
                        {item.assetTag}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {item.category}
                      </td>
                      <td className="py-4 px-5 text-slate-700 font-medium text-xs">
                        {item.location}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                          item.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'Dalam Perbaikan'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Aktif' ? 'bg-emerald-500' : item.status === 'Dalam Perbaikan' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-500 text-xs font-medium">
                        {item.purchaseDate}
                      </td>
                      <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/aset/${item.id}`}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Lihat Detail & Spesifikasi"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (Matching Screen 2) */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div>
              Menampilkan <span className="font-bold text-slate-900">{rangeStart}</span> sampai{' '}
              <span className="font-bold text-slate-900">{rangeEnd}</span> dari{' '}
              <span className="font-bold text-slate-900">{totalCount}</span> total data aset
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={safePage === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs">
                {safePage} / {totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(count) => {
          fetchAssets();
          setImportAlert(`Berhasil mengimpor ${count} aset baru dari file Excel / CSV!`);
        }}
      />
    </DashboardLayout>
  );
}
