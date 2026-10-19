'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Wrench, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PerawatanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pemeliharaan');
  }, [router]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs">
          <Wrench className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mengalihkan ke Modul Pemeliharaan & Servis...</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            Modul perawatan telah diintegrasikan secara komprehensif ke dalam halaman Pemeliharaan & Perbaikan Aset.
          </p>
        </div>
        <Link
          href="/pemeliharaan"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
        >
          <span>Buka Pemeliharaan & Perbaikan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </DashboardLayout>
  );
}
