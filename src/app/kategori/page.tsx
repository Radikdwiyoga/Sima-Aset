'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tags, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { name: 'Perangkat IT', code: 'AST-IT', count: 436, percent: 35, color: 'bg-blue-500' },
  { name: 'Furniture', code: 'AST-FN', count: 250, percent: 20, color: 'bg-emerald-500' },
  { name: 'Kendaraan', code: 'AST-KD', count: 187, percent: 15, color: 'bg-cyan-500' },
  { name: 'Elektronik', code: 'AST-EL', count: 150, percent: 12, color: 'bg-amber-500' },
  { name: 'Mesin & Peralatan', code: 'AST-MS', count: 125, percent: 10, color: 'bg-pink-500' },
  { name: 'Lainnya', code: 'AST-LN', count: 100, percent: 8, color: 'bg-purple-500' }
];

export default function KategoriPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kategori Aset</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Klasifikasi dan pembagian kelompok aset perusahaan
            </p>
          </div>

          <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20">
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Kategori</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/aset?category=${encodeURIComponent(cat.name)}`}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {cat.code}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {cat.percent}%
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xl font-black text-slate-900 mt-2 font-mono">
                  {cat.count} <span className="text-xs font-medium text-slate-400">Unit</span>
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Lihat Data Aset</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

