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
  Lock,
  FileCheck2,
  Monitor,
  Cpu,
  Armchair,
  Home
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRolePermissions, getRoleDisplayName } from '@/lib/permissions';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: 'canManageUsers' | 'canViewReports' | 'canDeleteAsset' | 'canCreateAsset';
  allowedRoles?: string[];
}

interface NavGroup {
  label?: string;
  items: MenuItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard
      }
    ]
  },
  {
    label: 'INVENTARIS ASET',
    items: [
      {
        name: 'Semua Aset',
        href: '/aset',
        icon: Layers
      },
      {
        name: 'Perangkat IT',
        href: '/aset-it',
        icon: Monitor
      },
      {
        name: 'Elektronik',
        href: '/elektronik',
        icon: Cpu
      },
      {
        name: 'Furnitur',
        href: '/furnitur',
        icon: Armchair
      },
      {
        name: 'Fasilitas RT',
        href: '/rumah-tangga',
        icon: Home
      }
    ]
  },
  {
    label: 'OPERASIONAL',
    items: [
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
        name: 'Pemeliharaan',
        href: '/pemeliharaan',
        icon: Wrench
      },
      {
        name: 'Penghapusan',
        href: '/penghapusan',
        icon: Trash2,
        allowedRoles: ['super_admin', 'admin_it', 'management']
      }
    ]
  },
  {
    label: 'MASTER & LAPORAN',
    items: [
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
    ]
  }
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const permissions = getRolePermissions(user?.role);

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 h-full flex flex-col shrink-0 border-r border-slate-800 transition-all select-none overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-800/80 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 overflow-hidden">
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
          <h1 className="text-white font-black text-sm tracking-tight leading-tight">
            SIM Aset
          </h1>
          <span className="text-[11px] text-blue-300/80 font-medium">
            Enterprise Asset Management
          </span>
        </div>
      </div>

      {/* Nav Menu - Independent Scrollable */}
      <nav className="flex-1 py-3 px-2.5 space-y-3.5 overflow-y-auto overflow-x-hidden">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.label && (
              <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-slate-400 tracking-wider">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
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
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 opacity-60 cursor-not-allowed select-none bg-slate-900/30"
                    title={`Fitur ${item.name} dibatasi untuk role ${getRoleDisplayName(user?.role)}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-600 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Role Card & System Status */}
      <div className="p-3 border-t border-slate-800/80 space-y-1.5 shrink-0 bg-[#0F172A]">
        <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peran Aktif</span>
            <span className={`w-2 h-2 rounded-full ${user?.role === 'super_admin' ? 'bg-blue-400 ring-2 ring-blue-500/20' : 'bg-emerald-400'}`}></span>
          </div>
          <p className="text-xs font-bold text-white mt-0.5 truncate">
            {user?.name || 'Administrator'}
          </p>
          <span className="inline-block text-[10px] text-blue-400 font-semibold truncate max-w-full">
            {getRoleDisplayName(user?.role)}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-slate-500 font-medium">SIM Aset v2.0 &bull; Ready</span>
        </div>
      </div>
    </aside>
  );
}
