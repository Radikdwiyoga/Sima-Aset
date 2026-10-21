'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronDown, LogOut, Menu, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { getRoleDisplayName } from '@/lib/permissions';
import { DataService } from '@/lib/dataService';
import { ReportDamageModal } from '@/components/ReportDamageModal';

export function Navbar({ onToggleMobileMenu }: { onToggleMobileMenu?: () => void }) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportDamage, setShowReportDamage] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; subtitle: string; href: string; type: string }[]>([]);

  const reloadNotifications = () => {
    const notifs: { id: string; title: string; subtitle: string; href: string; type: string }[] = [];

    // 1. Maintenance schedules & progress
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sima_maintenance_logs');
        if (stored) {
          const logs = JSON.parse(stored);
          if (Array.isArray(logs)) {
            logs.filter(l => l.status === 'Sedang Berjalan' || l.status === 'Terjadwal').slice(0, 4).forEach(l => {
              notifs.push({
                id: l.id,
                title: `${l.type === 'Perbaikan' ? '🛠️ Perbaikan' : '📅 Jadwal Servis'}: ${l.assetName}`,
                subtitle: `${l.assetTag} • ${l.vendorName || 'Teknisi'} (${l.scheduleDate}) - Status: ${l.status}`,
                href: '/pemeliharaan',
                type: 'maintenance'
              });
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Assets requiring attention
    try {
      const assets = DataService.getAssets();
      const problemAssets = assets.filter(a => a.condition === 'Rusak' || a.condition === 'Perbaikan');
      problemAssets.slice(0, 3).forEach(a => {
        notifs.push({
          id: `ast-cond-${a.id}`,
          title: `⚠️ Kendala Fisik: ${a.name}`,
          subtitle: `${a.assetTag} • Kondisi: ${a.condition} (${a.location || 'Lokasi umum'})`,
          href: '/aset',
          type: 'asset'
        });
      });
    } catch (e) {
      console.error(e);
    }

    setNotifications(notifs);
  };

  useEffect(() => {
    reloadNotifications();
  }, [showNotifications]);

  return (
    <header className="h-16 sm:h-18 bg-white border-b border-slate-200/90 px-3.5 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs w-full">
      {/* Left: Mobile Hamburger & Search Input */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 max-w-xs sm:max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 sm:p-2.5 md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aset, serial number, atau ruangan..."
            className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium truncate"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        {/* Lapor Kerusakan Quick Button (Self-Service) */}
        <button
          onClick={() => setShowReportDamage(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/90 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="Lapor Kerusakan Aset"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden sm:inline">Lapor Kerusakan</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
            title="Pemberitahuan Servis & Kondisi Aset"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2.5 right-2.5 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-88 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex justify-between items-center">
                <span>Pengingat & Servis Aset</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold">
                  {notifications.length} Info
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Tidak ada jadwal servis atau kendala aset saat ini.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setShowNotifications(false)}
                      className="block py-3 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                    >
                      <p className="font-semibold text-slate-900 text-xs">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.subtitle}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"}
              alt={user?.name || "User"}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="text-left hidden lg:block leading-tight">
              <p className="text-sm font-bold text-slate-900">{user?.name || "Admin"}</p>
              <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">
                {getRoleDisplayName(user?.role)}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                <div className="mt-2 inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {getRoleDisplayName(user?.role)}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-semibold text-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Self-Service Damage Report Modal */}
      <ReportDamageModal
        isOpen={showReportDamage}
        onClose={() => setShowReportDamage(false)}
        onSuccess={() => reloadNotifications()}
      />
    </header>
  );
}
