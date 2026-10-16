'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Trash2, AlertTriangle, FileText } from 'lucide-react';

export default function PenghapusanPage() {
  const disposals = [
    {
      id: 'dsp-1',
      tag: 'AST-IT-0003',
      name: 'Printer HP LaserJet Pro',
      category: 'Perangkat IT',
      date: '15 Agu 2026',
      reason: 'Komponen roller & mainboard rusak berat, biaya perbaikan melebihi nilai aset',
      approval: 'Disetujui Manajemen',
      status: 'Dihapusbukukan'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Penghapusan Aset</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar aset yang telah dihapusbukukan karena rusak permanen, hilang, atau habis masa pakai
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Penghapusan aset memerlukan persetujuan Berita Acara Pemusnahan/Penghapusan Aset oleh Manajemen dan Tim General Affairs.
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Kode Aset</th>
                  <th className="py-3 px-4 font-semibold">Nama Aset</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Tanggal Penghapusan</th>
                  <th className="py-3 px-4 font-semibold">Alasan Penghapusan</th>
                  <th className="py-3 px-4 font-semibold">Status Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {disposals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{item.tag}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.date}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">{item.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.status}
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

