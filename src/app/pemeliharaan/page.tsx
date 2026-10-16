'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  DollarSign, 
  UserCheck 
} from 'lucide-react';
import { MaintenanceLog } from '@/types';

export default function PemeliharaanPage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for scheduling new maintenance
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [assetTag, setAssetTag] = useState('');
  const [assetName, setAssetName] = useState('');
  const [type, setType] = useState<'Rutin' | 'Perbaikan'>('Rutin');
  const [vendorName, setVendorName] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const fetchLogs = () => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        // Fetch from database API
        fetch('/api/assets')
          .then(() => {
            // Initial sample logs
            setLogs([
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
                scheduleDate: '2026-11-15',
                completionDate: null,
                vendorName: 'CV Proteksi Api Nusantara',
                cost: 200000,
                notes: 'Pemeriksaan gauge jarum tekanan dan sertifikasi masa pakai APAR',
                status: 'Terjadwal'
              }
            ]);
          });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTag || !assetName) return;

    const newLog: MaintenanceLog = {
      id: `mnt-${Date.now()}`,
      assetId: 'ast-custom',
      assetTag,
      assetName,
      type,
      scheduleDate: new Date().toISOString().split('T')[0],
      completionDate: null,
      vendorName: vendorName || 'Vendor Rekanan',
      cost: Number(cost) || 0,
      notes,
      status: 'Terjadwal'
    };

    setLogs((prev) => [newLog, ...prev]);
    setIsAddOpen(false);
    setAssetTag('');
    setAssetName('');
    setVendorName('');
    setCost('');
    setNotes('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pemeliharaan & Perbaikan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Penjadwalan perawatan berkala (Preventive) & riwayat servis perbaikan (Corrective)
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Jadwalkan Servis Baru</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Terjadwal Bulan Ini</span>
              <span className="text-xl font-black text-slate-900">4 Servis</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Sedang Dikerjakan</span>
              <span className="text-xl font-black text-slate-900">2 Aset</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Estimasi Biaya Berjalan</span>
              <span className="text-xl font-black text-slate-900">Rp 2.050.000</span>
            </div>
          </div>
        </div>

        {/* Maintenance Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-5 font-semibold">Aset</th>
                  <th className="py-3 px-5 font-semibold">Tipe Perawatan</th>
                  <th className="py-3 px-5 font-semibold">Vendor Rekanan</th>
                  <th className="py-3 px-5 font-semibold">Tanggal Jadwal</th>
                  <th className="py-3 px-5 font-semibold">Biaya Servis</th>
                  <th className="py-3 px-5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
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
                    <td className="py-3.5 px-5 font-mono text-slate-600">{log.scheduleDate}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      Rp {log.cost.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'Selesai'
                            ? 'bg-emerald-500 text-white'
                            : log.status === 'Sedang Berjalan'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Schedule Maintenance */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Jadwalkan Servis Baru</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Aset</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AF70940"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Aset</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AC Daikin Ruang Meeting"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipe Servis</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'Rutin' | 'Perbaikan')}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Rutin">Rutin (Preventive)</option>
                      <option value="Perbaikan">Perbaikan (Corrective)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Biaya (Rp)</label>
                    <input
                      type="number"
                      placeholder="350000"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Servis</label>
                  <input
                    type="text"
                    placeholder="Nama Vendor / Teknisi"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catatan Tindakan</label>
                  <textarea
                    rows={2}
                    placeholder="Rincian perbaikan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Simpan Jadwal
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
