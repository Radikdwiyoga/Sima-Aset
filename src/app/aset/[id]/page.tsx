'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ChevronRight, 
  Edit3, 
  MapPin, 
  Wrench, 
  PowerOff, 
  Printer, 
  QrCode, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  ArrowLeft,
  X,
  Check,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { Asset, AssetHistory, AssetCondition, AssetStatus } from '@/types';
import { QRModal } from '@/components/QRModal';
import { useAuth } from '@/context/AuthContext';

function DetailAsetContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, hasPermission } = useAuth();
  const canEdit = hasPermission('canEditAsset');

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Informasi Umum' | 'Riwayat' | 'Dokumen' | 'Peminjaman' | 'Perawatan'>('Informasi Umum');
  
  // Modals
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editSerial, setEditSerial] = useState('');
  const [editSpec, setEditSpec] = useState('');
  const [editAssigned, setEditAssigned] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCondition, setEditCondition] = useState<AssetCondition>('Baik');

  // Move Location state
  const [newLocation, setNewLocation] = useState('');

  // Maintenance state
  const [maintVendor, setMaintVendor] = useState('');
  const [maintCost, setMaintCost] = useState('');
  const [maintNotes, setMaintNotes] = useState('');

  const fetchAsset = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/assets/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setAsset(json.data);
          setEditName(json.data.name);
          setEditBrand(json.data.brand || '');
          setEditModel(json.data.model || '');
          setEditSerial(json.data.serialNumber || '');
          setEditSpec(json.data.specification || '');
          setEditAssigned(json.data.assignedTo || '');
          setEditNotes(json.data.notes || '');
          setEditCondition(json.data.condition || 'Baik');
          setNewLocation(json.data.location);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!asset) return;
    const nextStatus: AssetStatus = asset.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await res.json();
      if (json.success) {
        fetchAsset();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          brand: editBrand,
          model: editModel,
          serialNumber: editSerial,
          specification: editSpec,
          assignedTo: editAssigned,
          notes: editNotes,
          condition: editCondition
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsEditModalOpen(false);
        fetchAsset();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !newLocation) return;
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: newLocation })
      });
      const json = await res.json();
      if (json.success) {
        setIsMoveModalOpen(false);
        fetchAsset();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    try {
      await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Dalam Perbaikan',
          condition: 'Perbaikan',
          notes: `Sedang servis (${maintNotes})`
        })
      });
      setIsMaintModalOpen(false);
      fetchAsset();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span className="text-xs text-slate-500 font-medium">Memuat detail aset...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!asset) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-base font-bold text-slate-800">Aset Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">Aset dengan ID tersebut tidak tercatat di sistem.</p>
          <Link
            href="/aset"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Data Aset</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-7 max-w-6xl">
        {/* Breadcrumb Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Detail & Spesifikasi Aset</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
            <Link href="/aset" className="hover:text-blue-600 font-medium">
              Data Aset
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-800 font-bold">{asset.assetTag}</span>
          </div>
        </div>

        {/* Top Hero Card (Matching Screen 3) */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-start justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-6 w-full lg:w-auto">
            {/* Asset Image Box */}
            <div className="w-40 h-40 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-3 shadow-xs">
              <img
                src={asset.image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80"}
                alt={asset.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Asset Headline & 2-Column Meta Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {asset.name}
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  asset.status === 'Aktif'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : asset.status === 'Dalam Perbaikan'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {asset.status}
                </span>
              </div>

              {/* 2-Column Specs Grid */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                <div>
                  <span className="text-slate-400 font-semibold block text-xs uppercase">Kode Aset</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{asset.assetTag}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-xs uppercase">Kategori</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{asset.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-xs uppercase">Lokasi Penempatan</span>
                  <span className="font-medium text-slate-700 text-sm mt-0.5 block">{asset.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-xs uppercase">Tanggal Perolehan</span>
                  <span className="font-medium text-slate-700 text-sm mt-0.5 block">{asset.purchaseDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-xs uppercase">Nilai Perolehan</span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block">
                    Rp {asset.purchasePrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-xs uppercase">Kondisi Fisik</span>
                  <span className={`font-bold text-sm mt-0.5 block ${
                    asset.condition === 'Baik' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {asset.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Right (With RBAC Control) */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 w-full lg:w-48 shrink-0">
            {canEdit ? (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 lg:w-full px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-slate-500" />
                  <span>Edit Data Aset</span>
                </button>

                <button
                  onClick={() => setIsMoveModalOpen(true)}
                  className="flex-1 lg:w-full px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>Pindah Lokasi</span>
                </button>

                <button
                  onClick={() => setIsMaintModalOpen(true)}
                  className="flex-1 lg:w-full px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-slate-500" />
                  <span>Pemeliharaan</span>
                </button>

                <button
                  onClick={handleToggleStatus}
                  className={`flex-1 lg:w-full px-4 py-2.5 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    asset.status === 'Aktif'
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <PowerOff className="w-4 h-4" />
                  <span>{asset.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan Aset'}</span>
                </button>
              </>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-1 w-full text-center">
                <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Aksi Dibatasi (Staff)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hanya Admin yang dapat mengubah atau memutasi aset ini.
                </p>
              </div>
            )}

            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex-1 lg:w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Cetak Label QR</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar (Matching Screen 3) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center border-b border-slate-200 px-6 gap-8 overflow-x-auto">
            {(['Informasi Umum', 'Riwayat', 'Dokumen', 'Peminjaman', 'Perawatan'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Informasi Umum (Matching Screen 3 Specifications) */}
          {activeTab === 'Informasi Umum' && (
            <div className="p-8 divide-y divide-slate-100 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 first:pt-0">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Merek / Pabrikan</span>
                  <span className="font-bold text-slate-900 text-base mt-1 block">
                    {asset.brand || 'Dell'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Tipe / Seri Model</span>
                  <span className="font-bold text-slate-900 text-base mt-1 block">
                    {asset.model || 'Latitude 5520'}
                  </span>
                </div>
              </div>

              <div className="py-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Nomor Seri (Serial Number)</span>
                <span className="font-mono font-bold text-blue-600 text-base mt-1 block">
                  {asset.serialNumber || 'DL5520112345'}
                </span>
              </div>

              <div className="py-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Spesifikasi Teknis Detail</span>
                <span className="font-medium text-slate-800 text-sm mt-1.5 block leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {asset.specification || 'Intel Core i5-1135G7, 8GB DDR4 RAM, 512GB PCIe NVMe SSD, Windows 11 Pro 64-bit'}
                </span>
              </div>

              <div className="py-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Penanggung Jawab / Pemegang</span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  {asset.assignedTo || 'Tim IT'}
                </span>
              </div>

              <div className="py-4 last:pb-0">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Keterangan & Catatan Operasional</span>
                <span className="text-slate-600 text-sm mt-1 block leading-relaxed">
                  {asset.notes || 'Laptop untuk operasional harian staff'}
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Riwayat (Matching Screen 5) */}
          {activeTab === 'Riwayat' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Tanggal</th>
                      <th className="py-2.5 px-4 font-semibold">Jenis Aktivitas</th>
                      <th className="py-2.5 px-4 font-semibold">Keterangan</th>
                      <th className="py-2.5 px-4 font-semibold">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono">12 Sep 2026</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Peminjaman
                        </span>
                      </td>
                      <td className="py-3 px-4">Dipinjam oleh Bagas untuk dinas luar kota</td>
                      <td className="py-3 px-4 font-semibold">Bagas</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono">15 Jan 2024</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Registrasi
                        </span>
                      </td>
                      <td className="py-3 px-4">Pengadaan baru aset perusahaan</td>
                      <td className="py-3 px-4 font-semibold">Admin IT</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Dokumen (BAST Digital) */}
          {activeTab === 'Dokumen' && (
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">
                      Berita Acara Serah Terima (BAST Digital)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      BAST/SIMA/{asset.assetTag}/2026
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Peminjaman */}
          {activeTab === 'Peminjaman' && (
            <div className="p-6 text-xs space-y-4">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Status Pemegang</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                    {asset.assignedTo || 'Tim IT'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Departemen Pengguna: Operasional & IT Support
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px]">
                  Sedang Digunakan
                </span>
              </div>
            </div>
          )}

          {/* Tab 5: Perawatan */}
          {activeTab === 'Perawatan' && (
            <div className="p-6 text-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800">Riwayat Servis & Perawatan</h4>
                <button
                  onClick={() => setIsMaintModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Jadwalkan Servis</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Tanggal</th>
                      <th className="py-2.5 px-4 font-semibold">Tipe</th>
                      <th className="py-2.5 px-4 font-semibold">Vendor / Teknisi</th>
                      <th className="py-2.5 px-4 font-semibold">Catatan</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 px-4 font-mono">10 Sep 2026</td>
                      <td className="py-3 px-4 font-semibold">Rutin</td>
                      <td className="py-3 px-4">IT Internal</td>
                      <td className="py-3 px-4">Pembersihan debu fan & update OS</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Sticker Modal */}
      <QRModal
        asset={asset}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Modal: Edit Asset */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Edit Data Aset</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs mt-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Aset</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Merek</label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe / Model</label>
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={editSerial}
                  onChange={(e) => setEditSerial(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Spesifikasi</label>
                <textarea
                  rows={2}
                  value={editSpec}
                  onChange={(e) => setEditSpec(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    value={editAssigned}
                    onChange={(e) => setEditAssigned(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kondisi</label>
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value as AssetCondition)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Perbaikan">Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Move Location */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Pindah Lokasi Aset</h3>
            <p className="text-xs text-slate-500">
              Lokasi saat ini: <strong className="text-slate-800">{asset.location}</strong>
            </p>
            <form onSubmit={handleSaveMove} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi Baru</label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Kantor Pusat - Divisi IT">Kantor Pusat - Divisi IT</option>
                  <option value="Kantor Pusat - Ruang Rapat">Kantor Pusat - Ruang Rapat</option>
                  <option value="Cabang A">Cabang A</option>
                  <option value="Cabang B">Cabang B</option>
                  <option value="Gudang Utama">Gudang Utama</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Pindahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Maintenance */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Jadwalkan Pemeliharaan</h3>
            <form onSubmit={handleSaveMaint} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vendor / Teknisi</label>
                <input
                  type="text"
                  placeholder="Contoh: Dell Service Center"
                  value={maintVendor}
                  onChange={(e) => setMaintVendor(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimasi Biaya (Rp)</label>
                <input
                  type="number"
                  placeholder="350000"
                  value={maintCost}
                  onChange={(e) => setMaintCost(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Kendala / Servis</label>
                <textarea
                  rows={2}
                  placeholder="Pembersihan berkala atau kendala hardware..."
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function DetailAsetPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <span className="text-xs text-slate-500 font-medium">Memuat detail aset...</span>
          </div>
        </DashboardLayout>
      }
    >
      <DetailAsetContent />
    </Suspense>
  );
}

