'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut, UserCheck, Menu, Shield, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { getRoleDisplayName } from '@/lib/permissions';

export function Navbar({ onToggleMobileMenu }: { onToggleMobileMenu?: () => void }) {
  const { user, logout, switchRole } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: '👑 Super Admin (Akses Penuh)' },
    { role: 'admin_it', label: '🛠️ Admin IT (Hardware/Software)' },
    { role: 'admin_ga', label: '🏢 Admin GA (Fasilitas & Umum)' },
    { role: 'management', label: '📊 Manajemen (Laporan & Audit)' },
    { role: 'staff', label: '👤 Staff / Pemohon (Akses Terbatas)' }
  ];

  return (
    <header className="h-18 bg-white border-b border-slate-200/90 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Hamburger & Search Input */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="p-2.5 md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-60 sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aset, serial number, atau ruangan..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Role Quick Switcher Pill (Convenient for Pair Review & Demo) */}
        <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200/80 px-3.5 py-1.5 rounded-xl shadow-xs">
          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-slate-600">Peran:</span>
          <select
            value={user?.role || 'super_admin'}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-bold text-blue-900 border-none outline-none cursor-pointer pr-1"
          >
            {rolesList.map(r => (
              <option key={r.role} value={r.role} className="text-slate-800 bg-white font-medium py-1">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors"
            title="Pemberitahuan Servis"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2.5 right-2.5 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-88 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex justify-between items-center">
                <span>Pengingat & Servis Aset</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold">2 Baru</span>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="py-3">
                  <p className="font-semibold text-slate-900 text-xs">Jadwal Cuci AC Ruang Meeting</p>
                  <p className="text-xs text-slate-500 mt-0.5">AF70940 - PT Sejuk Abadi Mandiri (20 Okt 2026)</p>
                </div>
                <div className="py-3">
                  <p className="font-semibold text-slate-900 text-xs">Servis Lampu Proyektor</p>
                  <p className="text-xs text-slate-500 mt-0.5">AF12040 - Epson Service Center (18 Okt 2026)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
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
    </header>
  );
}
