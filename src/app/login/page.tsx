'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Boxes, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  UserCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('admin@sima.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(identifier, password);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.message || 'Username / Email atau Password salah.');
      setLoading(false);
    }
  };

  const handleQuickRole = async (role: UserRole, email: string) => {
    setIdentifier(email);
    setPassword('admin123');
    setLoading(true);
    setError('');
    const res = await login(email, 'admin123', role);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.message || 'Gagal login dengan peran terpilih.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B132B] p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-[#111C38] rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden flex flex-col lg:flex-row relative z-10 min-h-[600px]">
        
        {/* Left Side: Brand Visual & Information */}
        <div className="lg:w-5/12 p-8 sm:p-12 flex flex-col justify-between relative bg-gradient-to-br from-[#111C38] via-[#16254E] to-[#1E3A8A]/60 border-b lg:border-b-0 lg:border-r border-slate-800/80">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-8 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="SIM ASET Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4 inline-block">
              Sistem Informasi Manajemen Aset
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              SIM ASET TERPADU
            </h1>
            <p className="text-sm sm:text-base text-blue-200/80 mt-3 font-medium leading-relaxed">
              Platform tata kelola inventaris, barcode/QR digital, dan pelacakan aset terintegrasi lintas divisi.
            </p>
          </div>

          <div className="space-y-3.5 my-8 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Pelacakan Kategori IT, Fasilitas, & Kendaraan</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Pencetakan Label QR & Berita Acara (BAST)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Pembatasan Hak Akses Berbasis Peran (RBAC)</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            SIM Aset Enterprise v2.0 &bull; Multi-Role Access Control Ready
          </div>
        </div>

        {/* Right Side: Sign-In Form (Modern Form Best Practices) */}
        <div className="lg:w-7/12 p-8 sm:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Masuk ke Akun Anda
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Masukkan email dan kata sandi Anda untuk mengakses portal SIMA
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Accessible HTML Sign-In Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="nama@company.com atau admin"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label 
                    htmlFor="current-password" 
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Kata Sandi
                  </label>
                  <span className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                    Lupa sandi?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="current-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-600">Ingat saya di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Role Switcher for Pair Testing */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Uji Coba Hak Akses Cepat (Demo RBAC)
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickRole('super_admin', 'admin@sima.com')}
                  className="p-3 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Super Admin</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Akses penuh semua modul & kelola user
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRole('admin_it', 'andi@company.com')}
                  className="p-3 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs mb-1">
                    <UserCircle2 className="w-3.5 h-3.5" />
                    <span>Admin Aset</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Kelola & mutasi aset (tanpa kelola user)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRole('staff', 'budi@company.com')}
                  className="p-3 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs mb-1">
                    <UserCircle2 className="w-3.5 h-3.5" />
                    <span>Staff / Pemohon</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Hanya lihat aset & pinjam (dilarang edit/tambah)
                  </p>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
