'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Wrench,
  AlertCircle,
  Building2,
  X,
  Filter
} from 'lucide-react';
import { MaintenanceLog, Asset } from '@/types';
import { DataService } from '@/lib/dataService';

export default function PemeliharaanPage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1)); // Default to Oct 2026 to match data
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: MaintenanceLog[] } | null>(null);

  // Form states for scheduling new maintenance
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [assetName, setAssetName] = useState('');
  const [type, setType] = useState<'Rutin' | 'Perbaikan'>('Rutin');
  const [scheduleDate, setScheduleDate] = useState('2026-10-25');
  const [vendorName, setVendorName] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  // Table filter
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Terjadwal' | 'Sedang Berjalan' | 'Selesai'>('Semua');

  const STORAGE_KEY = 'sima_maintenance_logs';

  const fetchLogs = () => {
    // Load all assets for device selector
    try {
      const assets = DataService.getAssets();
      setAllAssets(assets);
    } catch (e) {
      console.error(e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLogs(parsed);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    const defaultLogs: MaintenanceLog[] = [
      {
        id: 'mnt-1',
        assetId: 'ast-elk-1',
        assetTag: 'AF70940',
        assetName: 'AC Ruang Meeting (Daikin 2PK)',
        type: 'Rutin',
        scheduleDate: '2026-10-20',
        completionDate: null,
        vendorName: 'PT Sejuk Abadi Mandiri',
        cost: 350000,
        notes: 'Pembersihan filter berkala 3 bulanan dan pengecekan freon',
        status: 'Sedang Berjalan'
      },
      {
        id: 'mnt-2',
        assetId: 'ast-elk-2',
        assetTag: 'AF12040',
        assetName: 'Proyektor Ruang Konferensi 4K',
        type: 'Perbaikan',
        scheduleDate: '2026-10-18',
        completionDate: null,
        vendorName: 'Epson Service Center',
        cost: 1500000,
        notes: 'Penggantian lampu optik proyektor dan kalibrasi sensor fokus',
        status: 'Sedang Berjalan'
      },
      {
        id: 'mnt-3',
        assetId: 'ast-rt-4',
        assetTag: '6FF2940',
        assetName: 'Tabung APAR Powder 6kg',
        type: 'Rutin',
        scheduleDate: '2026-10-26',
        completionDate: null,
        vendorName: 'CV Proteksi Api Nusantara',
        cost: 200000,
        notes: 'Pemeriksaan gauge jarum tekanan dan sertifikasi masa pakai APAR',
        status: 'Terjadwal'
      },
      {
        id: 'mnt-4',
        assetId: 'ast-elk-3',
        assetTag: 'AF90112',
        assetName: 'Sound System Ruang Seminar',
        type: 'Rutin',
        scheduleDate: '2026-10-30',
        completionDate: null,
        vendorName: 'Audio Pro Service',
        cost: 450000,
        notes: 'Tuning amplifier dan pengecekan mic wireless',
        status: 'Terjadwal'
      },
      {
        id: 'mnt-5',
        assetId: 'ast-it-1',
        assetTag: 'AST-IT-1001',
        assetName: 'Server Utama Dell PowerEdge',
        type: 'Rutin',
        scheduleDate: '2026-10-24',
        completionDate: null,
        vendorName: 'Dell Enterprise Support',
        cost: 1200000,
        notes: 'Pembersihan heatsink, thermal paste, dan update BIOS',
        status: 'Terjadwal'
      }
    ];
    setLogs(defaultLogs);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLogs));
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleStatusChange = (id: string, newStatus: 'Terjadwal' | 'Sedang Berjalan' | 'Selesai') => {
    const updated = logs.map(l => l.id === id ? {
      ...l,
      status: newStatus,
      completionDate: newStatus === 'Selesai' ? new Date().toISOString().split('T')[0] : null
    } : l);
    setLogs(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleSelectAsset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const aId = e.target.value;
    setSelectedAssetId(aId);
    if (!aId) {
      setAssetTag('');
      setAssetName('');
      return;
    }
    const found = allAssets.find(a => a.id === aId);
    if (found) {
      setAssetTag(found.assetTag);
      setAssetName(found.name);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTag || !assetName || !scheduleDate) return;

    const newLog: MaintenanceLog = {
      id: `mnt-${Date.now()}`,
      assetId: selectedAssetId || 'ast-custom',
      assetTag,
      assetName,
      type,
      scheduleDate,
      completionDate: null,
      vendorName: vendorName || 'Teknisi / Rekanan',
      cost: Number(cost) || 0,
      notes,
      status: 'Terjadwal'
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setIsAddOpen(false);
    setSelectedAssetId('');
    setAssetTag('');
    setAssetName('');
    setVendorName('');
    setCost('');
    setNotes('');
  };

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  // Convert so Monday is 0
  const startOffset = (firstDayOfWeek + 6) % 7;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  const setMonthToday = () => {
    setCurrentDate(new Date(2026, 9, 1));
    setSelectedDayEvents(null);
  };

  // Map events to date strings
  const eventsByDate = useMemo(() => {
    const map: Record<string, MaintenanceLog[]> = {};
    logs.forEach(l => {
      if (l.scheduleDate) {
        if (!map[l.scheduleDate]) map[l.scheduleDate] = [];
        map[l.scheduleDate].push(l);
      }
    });
    return map;
  }, [logs]);

  // Filtered logs for the table
  const filteredLogs = useMemo(() => {
    if (statusFilter === 'Semua') return logs;
    return logs.filter(l => l.status === statusFilter);
  }, [logs, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-6 h-6 text-blue-600" />
              <span>Pemeliharaan &amp; Jadwal Servis Perangkat</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Monitoring berkala preventive maintenance, riwayat corrective repair, &amp; live kalender servis terintegrasi
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-500/20 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Jadwal Servis</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Servis</span>
              <span className="text-xl font-black text-slate-900">{logs.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Terjadwal</span>
              <span className="text-xl font-black text-slate-800">
                {logs.filter(l => l.status === 'Terjadwal').length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dikerjakan</span>
              <span className="text-xl font-black text-amber-600">
                {logs.filter(l => l.status === 'Sedang Berjalan').length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Selesai</span>
              <span className="text-xl font-black text-emerald-600">
                {logs.filter(l => l.status === 'Selesai').length}
              </span>
            </div>
          </div>
        </div>

        {/* LIVE MONTHLY CALENDAR (Kalender Servis Perbulan) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Calendar Header Navigation */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
                <CalendarIcon className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Live Kalender Servis &bull; {monthNames[month]} {year}
                </h2>
                <p className="text-xs text-blue-200/80 font-medium">
                  Klik tanggal untuk melihat daftar servis terjadwal pada hari tersebut
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={setMonthToday}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Oktober 2026
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Day Labels */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-500 py-2.5">
            <div>Senin</div>
            <div>Selasa</div>
            <div>Rabu</div>
            <div>Kamis</div>
            <div>Jumat</div>
            <div className="text-blue-600">Sabtu</div>
            <div className="text-rose-500">Minggu</div>
          </div>

          {/* Calendar Grid of Days */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[360px]">
            {/* Empty slots before day 1 */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/40 p-2 min-h-[70px] sm:min-h-[90px]" />
            ))}

            {/* Days in current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isSelected = selectedDayEvents?.day === day;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ day, events: dayEvents })}
                  className={`p-1.5 sm:p-2 min-h-[70px] sm:min-h-[90px] flex flex-col justify-between transition-all select-none ${
                    dayEvents.length > 0 ? 'cursor-pointer hover:bg-blue-50/40' : 'bg-white'
                  } ${isSelected ? 'ring-2 ring-blue-600 bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        dayEvents.length > 0 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full hidden sm:inline-block">
                        {dayEvents.length} Jadwal
                      </span>
                    )}
                  </div>

                  {/* Badges for scheduled events */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded truncate border ${
                          ev.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ev.status === 'Sedang Berjalan'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : ev.type === 'Perbaikan'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                        title={`${ev.assetName} (${ev.type}) - ${ev.status}`}
                      >
                        {ev.assetName}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold block">
                        +{dayEvents.length - 2} lainnya
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Events Popup / Detail Card */}
        {selectedDayEvents && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col gap-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-blue-900">
                  Agenda Servis: {selectedDayEvents.day} {monthNames[month]} {year}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDayEvents.events.map((ev) => (
                <div key={ev.id} className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {ev.assetTag}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ev.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                      ev.status === 'Sedang Berjalan' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 leading-tight">{ev.assetName}</p>
                  <p className="text-[11px] text-slate-600">Vendor: <span className="font-semibold">{ev.vendorName}</span></p>
                  {ev.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">{ev.notes}</p>
                  )}
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Biaya:</span>
                    <span className="font-bold text-slate-900">Rp {ev.cost.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Maintenance Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Daftar Riwayat &amp; Jadwal Servis Perangkat
              </h3>
              <p className="text-xs text-slate-500">
                Kelola status pengerjaan, biaya, serta vendor penanggung jawab
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
              {(['Semua', 'Terjadwal', 'Sedang Berjalan', 'Selesai'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === tab 
                      ? 'bg-white text-blue-600 shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-5 font-bold">Perangkat / Aset</th>
                  <th className="py-3.5 px-5 font-bold">Tipe Servis</th>
                  <th className="py-3.5 px-5 font-bold">Vendor / Teknisi</th>
                  <th className="py-3.5 px-5 font-bold">Tanggal Jadwal</th>
                  <th className="py-3.5 px-5 font-bold">Estimasi Biaya</th>
                  <th className="py-3.5 px-5 font-bold text-center">Status Pengerjaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Tidak ada data jadwal servis untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block text-xs">{log.assetName}</span>
                        <span className="font-mono text-[10px] text-blue-600 font-semibold">{log.assetTag}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.type === 'Rutin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          {log.type === 'Rutin' ? 'Preventive (Rutin)' : 'Corrective (Perbaikan)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700">{log.vendorName}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">{log.scheduleDate}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        Rp {log.cost.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <select
                          value={log.status}
                          onChange={(e) => handleStatusChange(log.id, e.target.value as any)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold border-none outline-none cursor-pointer shadow-xs ${
                            log.status === 'Selesai'
                              ? 'bg-emerald-500 text-white'
                              : log.status === 'Sedang Berjalan'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          <option value="Terjadwal" className="bg-white text-slate-900">Terjadwal</option>
                          <option value="Sedang Berjalan" className="bg-white text-slate-900">Sedang Berjalan</option>
                          <option value="Selesai" className="bg-white text-slate-900">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: Tambah Jadwal Servis Baru untuk Perangkat */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Tambah Jadwal Servis Perangkat</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                {/* Pilih Perangkat dari Data Aset */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Pilih Perangkat / Aset Terdaftar <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedAssetId}
                    onChange={handleSelectAsset}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-xs"
                  >
                    <option value="">-- Pilih dari Daftar Aset atau Isi Manual --</option>
                    {allAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        [{asset.category}] {asset.name} ({asset.assetTag}) - {asset.location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nama & Kode Aset (Manual or Auto-filled) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Kode Aset / Tag <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: AST-IT-1002"
                      value={assetTag}
                      onChange={(e) => setAssetTag(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Nama Perangkat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: AC Daikin Lt. 2"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Tanggal Jadwal & Tipe Servis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Tanggal Jadwal Servis <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Tipe Servis <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'Rutin' | 'Perbaikan')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Rutin">Preventive (Servis Rutin Berkala)</option>
                      <option value="Perbaikan">Corrective (Perbaikan Kerusakan)</option>
                    </select>
                  </div>
                </div>

                {/* Vendor & Biaya */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Vendor / Teknisi Penanggung Jawab
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: PT Sejuk Abadi / Pak Joko"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Estimasi Biaya Servis (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 350000"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                  </div>
                </div>

                {/* Catatan / Rincian */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Catatan Khusus / Rincian Tindakan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Cuci filter 3 bulanan, ganti oli, pengecekan freon..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    Simpan &amp; Jadwalkan
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
