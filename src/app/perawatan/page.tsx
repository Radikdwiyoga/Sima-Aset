'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Wrench, Calendar, CheckCircle2, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PerawatanPage() {
  const logs = [
    {
      id: 'mnt-1',
      tag: 'AST-EL-0001',
      name: 'Proyektor Epson',
      vendor: 'Epson Service Center',
      schedule: '10 Okt 2026',
      cost: 'Rp 1.500.000',
      status: 'Sedang Berjalan',
      notes: 'Penggantian lampu proyektor dan kalibrasi sensor'
    },
    {
      id: 'mnt-2',
      tag: 'AST-EL-0002',
      name: 'AC Panasonic',
      vendor: 'Tim Maintenance',
      schedule: '28 Agu 2026',
      cost: 'Rp 850.000',
      status: 'Selesai',
      notes: 'Penggantian kompresor dan freon'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Perawatan Aset</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal servis preventif dan riwayat perbaikan aset perusahaan
            </p>
          </div>

          <Link
            href="/aset"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Jadwalkan Perawatan</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Jadwal Servis Rutin</span>
              <span className="text-xl font-black text-slate-900">48 Aset</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Dalam Perbaikan</span>
              <span className="text-xl font-black text-slate-900">12 Aset</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Selesai Bulan Ini</span>
              <span className="text-xl font-black text-slate-900">36 Aset</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Kode Aset</th>
                  <th className="py-3 px-4 font-semibold">Nama Aset</th>
                  <th className="py-3 px-4 font-semibold">Vendor / Teknisi</th>
                  <th className="py-3 px-4 font-semibold">Jadwal</th>
                  <th className="py-3 px-4 font-semibold">Estimasi Biaya</th>
                  <th className="py-3 px-4 font-semibold">Catatan</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{log.tag}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{log.name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{log.vendor}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{log.schedule}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.cost}</td>
                    <td className="py-3.5 px-4 text-slate-600">{log.notes}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

