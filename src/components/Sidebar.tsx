'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  Tags, 
  MapPin, 
  ArrowLeftRight, 
  Wrench, 
  Trash2, 
  FileText, 
  Settings,
  Boxes,
  Lock,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRolePermissions, getRoleDisplayName } from '@/lib/permissions';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  requiredPermission?: 'canManageUsers' | 'canViewReports' | 'canDeleteAsset' | 'canCreateAsset';
  allowedRoles?: string[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Data Aset',
    href: '/aset',
    icon: Layers
  },
  {
    name: 'Kategori',
    href: '/kategori',
    icon: Tags
  },
  {
    name: 'Lokasi',
    href: '/lokasi',
    icon: MapPin
  },
  {
    name: 'Peminjaman',
    href: '/peminjaman',
    icon: ArrowLeftRight
  },
  {
    name: 'Stock Opname',
    href: '/stock-opname',
    icon: FileCheck2
  },
  {
    name: 'Perawatan',
    href: '/perawatan',
    icon: Wrench
  },
  {
    name: 'Penghapusan',
    href: '/penghapusan',
    icon: Trash2,
    allowedRoles: ['super_admin', 'admin_it', 'management']
  },
  {
    name: 'Laporan',
    href: '/laporan',
    icon: FileText,
    requiredPermission: 'canViewReports'
  },
  {
    name: 'Pengaturan',
    href: '/pengaturan',
    icon: Settings,
    requiredPermission: 'canManageUsers'
  }
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const permissions = getRolePermissions(user?.role);

  return (
    <aside className="w-68 bg-[#0F172A] text-slate-300 min-h-screen flex flex-col shrink-0 border-r border-slate-800 transition-all select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3.5 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 overflow-hidden">
          <img 
            src="/logo-icon.png" 
            alt="SIM ASET Logo" 
            className="w-full h-full object-contain p-0.5"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <h1 className="text-white font-black text-base tracking-tight leading-tight">
            SIM Aset
          </h1>
          <span className="text-xs text-blue-300/80 font-medium">
            Enterprise Asset Management
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-5 px-3.5 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          // Check RBAC permission for this item
          let isLocked = false;
          if (item.requiredPermission && !permissions[item.requiredPermission]) {
            isLocked = true;
          }
          if (item.allowedRoles && user && !item.allowedRoles.includes(user.role)) {
            isLocked = true;
          }

          if (isLocked) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 opacity-60 cursor-not-allowed select-none bg-slate-900/30"
                title={`Fitur ${item.name} dibatasi untuk role ${getRoleDisplayName(user?.role)}`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 text-slate-600" />
                  <span>{item.name}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Role Card & System Status */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Peran Aktif</span>
            <span className={`w-2 h-2 rounded-full ${user?.role === 'super_admin' ? 'bg-blue-400 ring-2 ring-blue-500/20' : 'bg-emerald-400'}`}></span>
          </div>
          <p className="text-xs font-bold text-white mt-1 truncate">
            {user?.name || 'Administrator'}
          </p>
          <span className="inline-block mt-0.5 text-[11px] text-blue-400 font-semibold truncate max-w-full">
            {getRoleDisplayName(user?.role)}
          </span>
        </div>

        <div className="text-center pt-1">
          <span className="text-[11px] text-slate-500 font-medium">SIM Aset v2.0 &bull; Ready</span>
        </div>
      </div>
    </aside>
  );
}
