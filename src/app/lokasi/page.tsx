'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

const mockLocations = [
  { no: 1, name: 'Kantor Pusat', desc: 'Lokasi utama perusahaan', count: 420 },
  { no: 2, name: 'Cabang A', desc: 'Kantor cabang wilayah A', count: 280 },
  { no: 3, name: 'Cabang B', desc: 'Kantor cabang wilayah B', count: 210 },
  { no: 4, name: 'Gudang', desc: 'Gudang penyimpanan aset', count: 180 },
  { no: 5, name: 'Ruang Rapat', desc: 'Ruang rapat lantai 2', count: 120 }
];

export default function LokasiPage() {
  const [locations, setLocations] = useState(mockLocations);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Lokasi</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data lokasi aset perusahaan
            </p>
          </div>

          <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20">
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Lokasi</span>
          </button>
        </div>

        {/* Table (Matching Screen 7) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 w-12 text-center font-semibold">No</th>
                  <th className="py-3 px-4 font-semibold">Nama Lokasi</th>
                  <th className="py-3 px-4 font-semibold">Deskripsi</th>
                  <th className="py-3 px-4 font-semibold">Jumlah Aset</th>
                  <th className="py-3 px-4 font-semibold text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {locations.map((loc) => (
                  <tr key={loc.no} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {loc.no}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {loc.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {loc.desc}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {loc.count} Unit
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

