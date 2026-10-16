'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RoleGuard } from '@/components/RoleGuard';
import { User, Users, Shield, Plus, Edit2, Trash2, Camera, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleDisplayName } from '@/lib/permissions';

const mockUsers = [
  { no: 1, name: 'Super Admin SIMA', email: 'admin@sima.com', role: 'Super Admin', dept: 'Administrator', status: 'Aktif' },
  { no: 2, name: 'Andi Saputra', email: 'andi@company.com', role: 'Admin IT', dept: 'Divisi IT', status: 'Aktif' },
  { no: 3, name: 'Dewi Lestari', email: 'dewi@company.com', role: 'Admin GA', dept: 'General Affairs', status: 'Aktif' },
  { no: 4, name: 'Rina Kusuma', email: 'rina@company.com', role: 'Manajemen', dept: 'Finance & Audit', status: 'Aktif' },
  { no: 5, name: 'Budi Santoso', email: 'budi@company.com', role: 'Staff Pemohon', dept: 'Staff Operasional', status: 'Aktif' }
];

export default function PengaturanPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Manajemen User' | 'Profil Saya'>('Manajemen User');
  const [name, setName] = useState(user?.name || 'Super Admin');
  const [email, setEmail] = useState(user?.email || 'admin@sima.com');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <RoleGuard
        permission="canManageUsers"
        fallbackTitle="Akses Ditolak: Pengaturan & Manajemen User"
        fallbackDescription="Halaman Pengaturan dan Manajemen Hak Akses User dibatasi hanya untuk Super Admin. Silakan ganti ke peran Super Admin untuk menguji fitur ini."
      >
        <div className="space-y-7 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan Sistem & Hak Akses</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Kelola kredensial pengguna, pembagian peran RBAC, dan profil akun
              </p>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-xl border border-blue-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Mode Super Admin Terverifikasi</span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-3 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('Manajemen User')}
              className={`py-3 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'Manajemen User'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Manajemen User & Role (RBAC)
            </button>
            <button
              onClick={() => setActiveTab('Profil Saya')}
              className={`py-3 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'Profil Saya'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Profil Saya
            </button>
          </div>

          {/* Tab 1: Manajemen User (RBAC Table) */}
          {activeTab === 'Manajemen User' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Daftar Akun Pengguna</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Kontrol hak akses dan departemen pengguna SIMA</p>
                </div>

                <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>Tambah User Baru</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-slate-600 uppercase text-xs tracking-wider border-b border-slate-200/80 font-bold">
                      <tr>
                        <th className="py-3.5 px-5 w-12 text-center">No</th>
                        <th className="py-3.5 px-5">Nama Lengkap</th>
                        <th className="py-3.5 px-5">Email Login</th>
                        <th className="py-3.5 px-5">Hak Akses (Role)</th>
                        <th className="py-3.5 px-5">Departemen</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {mockUsers.map((u) => (
                        <tr key={u.no} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-4 px-5 text-center text-slate-400 font-mono text-xs">
                            {u.no}
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900">
                            {u.name}
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-mono text-xs">
                            {u.email}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                              u.role === 'Super Admin'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : u.role.includes('Admin')
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-medium text-slate-700 text-xs">
                            {u.dept}
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer" title="Hapus">
                                <Trash2 className="w-4 h-4" />
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
          )}

          {/* Tab 2: Profil Saya */}
          {activeTab === 'Profil Saya' && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
                Informasi Akun Pribadi
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-6 text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Peran Sistem Saat Ini
                  </label>
                  <input
                    type="text"
                    value={getRoleDisplayName(user?.role)}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                  />
                </div>

                {saved && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Perubahan profil berhasil disimpan!</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
