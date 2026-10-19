'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RoleGuard } from '@/components/RoleGuard';
import { Plus, Edit2, Trash2, Check, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleDisplayName } from '@/lib/permissions';
import { DataService } from '@/lib/dataService';
import { User, UserRole } from '@/types';

export default function PengaturanPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Manajemen User' | 'Profil Saya'>('Manajemen User');
  const [name, setName] = useState(user?.name || 'Super Admin');
  const [email, setEmail] = useState(user?.email || 'admin@sima.com');
  const [saved, setSaved] = useState(false);

  // User management state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('staff');
  const [formDept, setFormDept] = useState('Divisi Operasional');

  const reloadUsers = () => {
    const list = DataService.getUsers();
    setUsersList(list);
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormUsername('');
    setFormRole('staff');
    setFormDept('Divisi Operasional');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormUsername(u.username);
    setFormRole(u.role);
    setFormDept(u.department || 'Divisi Operasional');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string, userName: string) => {
    if (confirm(`Yakin ingin menghapus user "${userName}"?`)) {
      DataService.deleteUser(id);
      reloadUsers();
    }
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingUser) {
      DataService.updateUser(editingUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        username: formUsername.trim() || formEmail.split('@')[0],
        role: formRole,
        department: formDept.trim()
      });
    } else {
      DataService.createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        username: formUsername.trim() || formEmail.split('@')[0],
        role: formRole,
        department: formDept.trim()
      });
    }

    setIsModalOpen(false);
    reloadUsers();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      // Persist to the users master + refresh the active session copy
      DataService.updateUser(user.id, { name: name.trim() || user.name, email: email.trim() || user.email });
      const updated = { ...user, name: name.trim() || user.name, email: email.trim() || user.email };
      localStorage.setItem('sima_user', JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Gagal menyimpan profil:', err);
    }
  };

  const availableRoles: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Admin' },
    { role: 'admin_it', label: 'Admin IT' },
    { role: 'admin_ga', label: 'Admin General Affairs' },
    { role: 'management', label: 'Manajemen / Direksi' },
    { role: 'staff', label: 'Staff Pemohon' },
    { role: 'auditor', label: 'Auditor Internal' }
  ];

  return (
    <DashboardLayout>
      <RoleGuard
        permission="canManageUsers"
        fallbackTitle="Akses Ditolak: Pengaturan & Manajemen User"
        fallbackDescription="Halaman Pengaturan dan Manajemen Hak Akses User dibatasi hanya untuk Super Admin. Silakan ganti ke peran Super Admin untuk menguji fitur ini."
      >
        <div className="space-y-6 sm:space-y-7 w-full max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 w-full">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pengaturan Sistem & Hak Akses</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Kelola kredensial pengguna, pembagian peran RBAC, dan profil akun
              </p>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-xl border border-blue-200 text-xs font-bold w-fit">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Mode Super Admin Terverifikasi</span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200 overflow-x-auto w-full">
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

                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah User Baru</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200/80 font-bold">
                      <tr>
                        <th className="py-3.5 px-5 w-12 text-center">No</th>
                        <th className="py-3.5 px-5">Nama Lengkap</th>
                        <th className="py-3.5 px-5">Email / Username</th>
                        <th className="py-3.5 px-5">Hak Akses (Role)</th>
                        <th className="py-3.5 px-5">Departemen</th>
                        <th className="py-3.5 px-5 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {usersList.map((u, idx) => (
                        <tr key={u.id || idx} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-4 px-5 text-center text-slate-400 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                                alt={u.name}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-mono text-xs">
                            <div>{u.email}</div>
                            <div className="text-[10px] text-slate-400">@{u.username}</div>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              u.role === 'super_admin'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : u.role.includes('admin')
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {getRoleDisplayName(u.role)}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-medium text-slate-700 text-xs">
                            {u.department}
                          </td>
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit Akun"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Akun"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* Modal Add / Edit User */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingUser ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleUserSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Radik Dwiyoga"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Login <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@company.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="username_login"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hak Akses (Role RBAC) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as UserRole)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {availableRoles.map(r => (
                        <option key={r.role} value={r.role}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Departemen / Divisi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Divisi IT, Finance, General Affairs"
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingUser ? 'Simpan Akun' : 'Daftarkan Akun'}</span>
                    </button>
                  </div>
                </form>
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
