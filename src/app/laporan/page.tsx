'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  FileText, 
  Tags, 
  MapPin, 
  Activity, 
  Printer, 
  FileSpreadsheet, 
  TrendingDown
} from 'lucide-react';
import { exportAssetsToExcel, exportAssetsToPDF, exportDepreciationToExcel, exportDepreciationToPDF, exportAssetsGroupedToExcel } from '@/lib/export';
import { DataService } from '@/lib/dataService';
import { calculatePortfolioDepreciation } from '@/lib/depreciation';
import { Asset } from '@/types';

export default function LaporanPage() {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setAssets(DataService.getAssets());
  }, []);

  const portfolio = calculatePortfolioDepreciation(assets);

  const handleExport = (type: string, format: 'excel' | 'pdf', title: string) => {
    setLoading(true);
    try {
      const data = DataService.getAssets();
      const date = new Date().toISOString().split('T')[0];

      if (type === 'penyusutan-aset') {
        if (format === 'excel') {
          exportDepreciationToExcel(data, `Laporan_Depresiasi_Nilai_Buku_SIMA_${date}.csv`);
        } else {
          exportDepreciationToPDF(data, title);
        }
      } else if (type === 'per-kategori') {
        if (format === 'excel') {
          exportAssetsGroupedToExcel(data, 'category', `Laporan_Per_Kategori_SIMA_${date}.csv`);
        } else {
          exportAssetsToPDF([...data].sort((a, b) => a.category.localeCompare(b.category, 'id')), title);
        }
      } else if (type === 'per-lokasi') {
        if (format === 'excel') {
          exportAssetsGroupedToExcel(data, 'location', `Laporan_Per_Lokasi_SIMA_${date}.csv`);
        } else {
          exportAssetsToPDF([...data].sort((a, b) => (a.location || '').localeCompare(b.location || '', 'id')), title);
        }
      } else if (type === 'kondisi-pemeliharaan') {
        if (format === 'excel') {
          exportAssetsGroupedToExcel(data, 'condition', `Laporan_Kondisi_Pemeliharaan_SIMA_${date}.csv`);
        } else {
          exportAssetsToPDF([...data].sort((a, b) => a.condition.localeCompare(b.condition, 'id')), title);
        }
      } else {
        if (format === 'excel') {
          exportAssetsToExcel(data, `Laporan_${type}_SIMA_${date}.csv`);
        } else {
          exportAssetsToPDF(data, title);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      type: 'seluruh-data',
      title: 'Laporan Seluruh Data Aset',
      desc: 'Rekapitulasi komprehensif master data seluruh aset, nilai pengadaan, dan status inventaris aktif',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      tag: 'Laporan Utama'
    },
    {
      type: 'penyusutan-aset',
      title: 'Laporan Depresiasi & Nilai Buku',
      desc: 'Perhitungan penyusutan metode garis lurus, akumulasi depresiasi, beban bulanan, dan nilai buku saat ini',
      icon: TrendingDown,
      color: 'bg-rose-50 text-rose-600',
      tag: 'Valuasi Akuntansi'
    },
    {
      type: 'per-kategori',
      title: 'Laporan Aset per Kategori',
      desc: 'Pengelompokan aset berdasarkan divisi IT, Furniture, Kendaraan, Elektronik, dan Mesin',
      icon: Tags,
      color: 'bg-emerald-50 text-emerald-600',
      tag: 'Klasifikasi Aset'
    },
    {
      type: 'per-lokasi',
      title: 'Laporan Aset per Lokasi Fisik',
      desc: 'Sebaran inventaris aset di Kantor Pusat, Cabang A, Cabang B, Pool Armada, dan Gudang Logistik',
      icon: MapPin,
      color: 'bg-amber-50 text-amber-600',
      tag: 'Sebaran Ruangan'
    },
    {
      type: 'kondisi-pemeliharaan',
      title: 'Laporan Kondisi & Pemeliharaan',
      desc: 'Audit kondisi fisik (Baik, Rusak, Perbaikan) serta jadwal servis berkala peralatan',
      icon: Activity,
      color: 'bg-purple-50 text-purple-600',
      tag: 'Audit & Servis'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 w-full max-w-6xl">
        {/* Header */}
        <div className="pb-3 border-b border-slate-200 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Pusat Unduh Laporan Inventaris
                </h1>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                  Format Excel & PDF
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Ekspor rekapitulasi data kepemilikan aset, valuasi depresiasi akuntansi, audit berkala, dan berita acara resmi
              </p>
            </div>
          </div>
        </div>

        {/* Valuation Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Nilai Perolehan</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">
              Rp {portfolio.totalOriginalCost.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{assets.length} Aset Terdata</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nilai Buku Bersih (Aktif)</span>
            <span className="text-lg font-black text-blue-600 mt-1 block">
              Rp {portfolio.totalCurrentBookValue.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-blue-500 mt-0.5 block">Kekayaan Aset Berjalan</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Akumulasi Penyusutan</span>
            <span className="text-lg font-black text-rose-600 mt-1 block">
              Rp {portfolio.totalAccumulatedDepreciation.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-rose-500 mt-0.5 block">Rasio Depresiasi: {portfolio.depreciationRatio}%</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Beban Depresiasi / Bulan</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">
              Rp {portfolio.totalMonthlyDepreciation.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Metode Garis Lurus (Straight-Line)</span>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.type}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {/* Dual Download Action Buttons (Excel & PDF) */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExport(card.type, 'excel', card.title)}
                    disabled={loading}
                    className="flex-1 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Excel (.csv)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport(card.type, 'pdf', card.title)}
                    disabled={loading}
                    className="flex-1 py-2 px-2.5 bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-200/80 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Cetak PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
