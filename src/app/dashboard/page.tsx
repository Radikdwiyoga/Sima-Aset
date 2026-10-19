'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';
import { 
  Boxes, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Calendar, 
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  Layers,
  QrCode
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getRoleDisplayName } from '@/lib/permissions';
import { DashboardQRScannerModal } from '@/components/DashboardQRScannerModal';
import { DataService } from '@/lib/dataService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  useEffect(() => {
    try {
      const stats = DataService.getDashboardStats();
      setData({
        metrics: {
          total: stats.totalAssets,
          active: stats.activeAssets,
          inactive: stats.inactiveAssets,
          repair: stats.maintenanceAssets,
          totalGrowth: '+12% dari bulan lalu',
          activePercent: `${((stats.activeAssets / (stats.totalAssets || 1)) * 100).toFixed(1)}% dari total`,
          inactivePercent: `${((stats.inactiveAssets / (stats.totalAssets || 1)) * 100).toFixed(1)}% dari total`,
          repairPercent: `${((stats.maintenanceAssets / (stats.totalAssets || 1)) * 100).toFixed(1)}% dari total`,
        },
        categoryDistribution: stats.categoryDistribution,
        locationDistribution: stats.locationDistribution,
        categories: stats.categories,
        locations: stats.locations,
        recentActivities: stats.recentActivities,
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const metrics = data?.metrics || {
    total: 0,
    active: 0,
    inactive: 0,
    repair: 0,
    totalGrowth: '0% dari bulan lalu',
    activePercent: '0% dari total',
    inactivePercent: '0% dari total',
    repairPercent: '0% dari total'
  };

  const categoryDistribution = data?.categoryDistribution || [];
  const locationDistribution = data?.locationDistribution || [];

  const recentActivities = [
    {
      id: 'act-1',
      assetTag: 'AST-IT-0001',
      name: 'Laptop Dell Latitude 5520',
      action: 'Peminjaman',
      target: 'Bagas (Divisi Marketing)',
      date: '12 Sep 2026, 14:30 WIB',
      status: 'Sedang Dipinjam',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'act-2',
      assetTag: 'AST-EL-0001',
      name: 'Proyektor Epson EB-X500',
      action: 'Perbaikan',
      target: 'Epson Service Center',
      date: '10 Sep 2026, 09:15 WIB',
      status: 'Dalam Pengerjaan',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'act-3',
      assetTag: 'AST-KD-0001',
      name: 'Toyota Avanza 1.3 G',
      action: 'Pindah Lokasi',
      target: 'Cabang B - Pool Armada',
      date: '05 Sep 2026, 11:00 WIB',
      status: 'Selesai Mutasi',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'act-4',
      assetTag: 'AST-FN-0001',
      name: 'Kursi Kerja Ergonomis',
      action: 'Registrasi Baru',
      target: 'Kantor Pusat - Divisi GA',
      date: '01 Sep 2026, 08:45 WIB',
      status: 'Tersedia',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  ];

  const maintenanceAlerts = [
    {
      id: 'm-1',
      title: 'Jadwal Servis AC Kantor Utama',
      subtitle: '12 Unit AC Ruang Meeting & Kantor Pusat',
      dueDate: '20 Okt 2026',
      badge: 'Jadwal Rutin',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'm-2',
      title: 'Perpanjangan Garansi Server & UPS',
      subtitle: 'Rack Server Dell PowerEdge R740',
      dueDate: '28 Okt 2026',
      badge: 'Segera Habis',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'm-3',
      title: 'Inspeksi Armada Kendaraan Operasional',
      subtitle: 'Uji Emisi & Servis Berkala 8 Kendaraan Cabang',
      dueDate: '05 Nov 2026',
      badge: 'Audit Berkala',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 w-full">
        
        {/* Top Header Banner with Welcome & Date */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/70 w-full">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Dashboard Inventaris
              </h1>
              <span className="px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {getRoleDisplayName(user?.role)}
              </span>
            </div>
            <p className="text-xs sm:text-base text-slate-500 mt-1">
              Ringkasan real-time status kepemilikan, sebaran, dan kondisi aset perusahaan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-xs">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>1 Jan 2026 &ndash; 30 Sep 2026</span>
            </div>
            
            <button
              type="button"
              onClick={() => setIsQRScannerOpen(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>Scan QR Aset</span>
            </button>

            <Link
              href="/aset"
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Layers className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Buka Data Aset</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards - Larger Typography and Modern Contrast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 w-full">
          {/* 1. Total Aset */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-500">Total Aset Terdaftar</span>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                  {metrics.total.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
                <Boxes className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>{metrics.totalGrowth}</span>
              </span>
              <span className="text-slate-400 font-normal">vs bulan lalu</span>
            </div>
          </div>

          {/* 2. Aset Aktif */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-500">Aset Berstatus Aktif</span>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                  {metrics.active.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{metrics.activePercent}</span>
              </span>
              <span className="text-slate-400 font-normal">siap digunakan</span>
            </div>
          </div>

          {/* 3. Aset Tidak Aktif */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-500">Aset Tidak Aktif</span>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                  {metrics.inactive.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 ring-4 ring-rose-50/50">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>{metrics.inactivePercent}</span>
              </span>
              <span className="text-slate-400 font-normal">rusak / usang</span>
            </div>
          </div>

          {/* 4. Dalam Perbaikan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-500">Dalam Perbaikan (Servis)</span>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                  {metrics.repair.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 ring-4 ring-amber-50/50">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{metrics.repairPercent}</span>
              </span>
              <span className="text-slate-400 font-normal">proses vendor</span>
            </div>
          </div>
        </div>

        {/* Charts Row - Increased Height and Legibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-7 w-full">
          {/* Donut Chart: Distribusi Kategori */}
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between w-full min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Distribusi Aset per Kategori
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Komposisi aset berdasarkan jenis barang dan perangkat
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                {categoryDistribution.length} Kategori
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-2">
              {/* Donut with Center Text */}
              <div className="relative w-56 h-56 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {categoryDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {metrics.total.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold mt-1">
                    Total Unit
                  </span>
                </div>
              </div>

              {/* Legend with exact percentages */}
              <div className="flex-1 space-y-3 text-sm w-full">
                {categoryDistribution.map((cat: any) => (
                  <div key={cat.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      <span className="text-slate-700 font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono font-medium">{cat.count} unit</span>
                      <span className="font-bold text-slate-900 text-sm w-12 text-right">{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart: Jumlah Aset per Lokasi */}
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between w-full min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Jumlah Aset per Lokasi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sebaran fisik inventaris di kantor pusat, cabang, & gudang
                </p>
              </div>
              <Link
                href="/lokasi"
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Kelola Lokasi</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationDistribution} margin={{ top: 25, right: 10, left: -10, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748B" 
                    fontSize={12} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[8, 8, 0, 0]} 
                    maxBarSize={56}
                    label={{ position: 'top', fill: '#1E293B', fontSize: 12, fontWeight: 'bold' }}
                  >
                    {locationDistribution.map((entry: any, index: number) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lower Section (Eliminating Empty Void with Real Enterprise Modules) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-7 w-full">
          
          {/* Left 2 Cols: Mutasi & Aktivitas Aset Terkini */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-7 border border-slate-200/80 shadow-xs w-full min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Aktivitas & Log Mutasi Terkini
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pencatatan real-time peminjaman, mutasi, perbaikan, dan registrasi aset
                </p>
              </div>
              <Link
                href="/peminjaman"
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Lihat Semua Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-xs tracking-wider border-y border-slate-200/80 font-bold">
                  <tr>
                    <th className="py-3 px-4">Kode & Nama Aset</th>
                    <th className="py-3 px-4">Jenis Aksi</th>
                    <th className="py-3 px-4">Penerima / Lokasi</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link href={`/aset`} className="font-mono font-bold text-blue-600 hover:underline block text-xs">
                          {act.assetTag}
                        </Link>
                        <span className="font-semibold text-slate-900 text-sm block mt-0.5">
                          {act.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                        {act.action}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                        {act.target}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {act.date}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${act.statusColor}`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 1 Col: Pengingat Servis & Aset Kritis */}
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between w-full min-w-0">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Jadwal Pemeliharaan
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  3 Prioritas
                </span>
              </div>

              <div className="space-y-4">
                {maintenanceAlerts.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${m.badgeColor}`}>
                        {m.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {m.dueDate}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {m.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/perawatan"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Wrench className="w-4 h-4 text-slate-600" />
                <span>Buka Modul Perawatan</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Dashboard QR Scanner Modal */}
      <DashboardQRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </DashboardLayout>
  );
}
