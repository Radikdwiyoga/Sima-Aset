'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Menu, 
  AlertTriangle,
  Layers,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { getRoleDisplayName } from '@/lib/permissions';
import { DataService } from '@/lib/dataService';
import { ReportDamageModal } from '@/components/ReportDamageModal';
import { Asset } from '@/types';

export function Navbar({ onToggleMobileMenu }: { onToggleMobileMenu?: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportDamage, setShowReportDamage] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; subtitle: string; href: string; type: string }[]>([]);

  // Top Global Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  // Live real-time search execution
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const matches = DataService.getAssets({ search: searchQuery.trim() });
    setSearchResults(matches);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    router.push(`/aset?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-16 sm:h-18 bg-white border-b border-slate-200/90 px-3.5 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs w-full">
      {/* Left: Mobile Hamburger & Interactive Search Bar */}
      <div 
        ref={searchContainerRef}
        className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 max-w-xs sm:max-w-md relative"
      >
        <button
          onClick={onToggleMobileMenu}
          className="p-2 sm:p-2.5 md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            placeholder="Cari aset, serial number, atau ruangan..."
            className="w-full pl-9 sm:pl-11 pr-8 py-2 sm:py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium truncate"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Real-time Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 top-full mt-2 w-full sm:w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-500">
              <span>Hasil Pencarian ({searchResults.length})</span>
              <span className="text-[10px] text-slate-400">Tekan Enter untuk cari semua</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-slate-50">
              {searchResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Tidak ditemukan aset dengan kata kunci &quot;{searchQuery}&quot;.
                </div>
              ) : (
                searchResults.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      router.push(`/aset/${item.id}`);
                    }}
                    className="w-full text-left p-2.5 hover:bg-blue-50/60 rounded-xl transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                          {item.assetTag}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.category} &bull; {item.location || item.locationName || 'Lokasi umum'}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.status === 'Aktif' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </button>
                ))
              )}
            </div>

            {searchResults.length > 0 && (
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full mt-2 pt-2 border-t border-slate-100 text-center text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 py-1.5 cursor-pointer"
              >
                <span>Lihat semua {searchResults.length} hasil di Data Aset</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
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
                <span>Pengingat &amp; Servis Aset</span>
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
            <UserAvatar name={user?.name || "Admin"} size="md" className="ring-2 ring-slate-200" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {getRoleDisplayName(user?.role)}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-in fade-in duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                <UserAvatar name={user?.name || "Admin"} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                </div>
              </div>

              <Link
                href="/pengaturan"
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
              >
                <span>Pengaturan Profil &amp; Akun</span>
              </Link>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium border-t border-slate-100 mt-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ReportDamageModal
        isOpen={showReportDamage}
        onClose={() => setShowReportDamage(false)}
        onSuccess={() => reloadNotifications()}
      />
    </header>
  );
}
