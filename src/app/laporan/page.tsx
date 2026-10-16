'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  FileText, 
  Tags, 
  MapPin, 
  Activity, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { exportAssetsToExcel, exportAssetsToPDF } from '@/lib/export';

export default function LaporanPage() {
  const [loading, setLoading] = useState(false);

  const handleExport = async (type: string, format: 'excel' | 'pdf', title: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets');
      const json = await res.json();
      if (json.success && json.data) {
        if (format === 'excel') {
          exportAssetsToExcel(json.data, `Laporan_${type}_SIMA_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
          exportAssetsToPDF(json.data, title);
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
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pusat Unduh Laporan Inventaris
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Format Excel & PDF
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ekspor rekapitulasi data kepemilikan aset, audit berkala, dan berita acara resmi
          </p>
        </div>

        {/* 4 Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.type}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3.5 rounded-2xl ${card.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {/* Dual Download Action Buttons (Excel & PDF) */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleExport(card.type, 'excel', card.title)}
                    disabled={loading}
                    className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Unduh Excel (.csv)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport(card.type, 'pdf', card.title)}
                    disabled={loading}
                    className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Cetak / PDF</span>
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
