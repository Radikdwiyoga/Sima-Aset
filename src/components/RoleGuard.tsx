'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRolePermissions, getRoleDisplayName, RolePermissions } from '@/lib/permissions';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  permission?: keyof RolePermissions;
  allowedRoles?: string[];
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function RoleGuard({
  children,
  permission,
  allowedRoles,
  fallbackTitle = 'Akses Ditolak',
  fallbackDescription = 'Anda tidak memiliki hak akses untuk membuka halaman atau fitur ini.'
}: RoleGuardProps) {
  const { user } = useAuth();
  const permissions = getRolePermissions(user?.role);

  let isAllowed = true;

  if (permission && !permissions[permission]) {
    isAllowed = false;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    isAllowed = false;
  }

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 max-w-lg w-full text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {fallbackTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {fallbackDescription}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Pengguna Aktif:</span>
              <span className="font-bold text-slate-800">{user?.name || 'Tamu'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Peran Akun:</span>
              <span className="font-bold text-rose-600">{getRoleDisplayName(user?.role)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Izin Dibutuhkan:</span>
              <span className="font-mono font-semibold text-slate-700">
                {permission || allowedRoles?.join(', ') || 'Administrator'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

