'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RoleGuard } from '@/components/RoleGuard';
import { ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AssetCondition, AssetStatus } from '@/types';

export default function TambahAsetPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Perangkat IT');
  const [assetTag, setAssetTag] = useState('');
  const [location, setLocation] = useState('Kantor Pusat');
  const [purchaseDate, setPurchaseDate] = useState('2026-10-16');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('Baik');
  const [status, setStatus] = useState<AssetStatus>('Aktif');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assignedTo, setAssignedTo] = useState('Tim IT');
  const [specification, setSpecification] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const prefixMap: Record<string, string> = {
      'Perangkat IT': 'AST-IT',
      'Furniture': 'AST-FN',
      'Kendaraan': 'AST-KD',
      'Elektronik': 'AST-EL',
      'Mesin & Peralatan': 'AST-MS',
      'Lainnya': 'AST-LN'
    };

    const finalTag = assetTag.trim() || `${prefixMap[category] || 'AST'}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTag: finalTag,
          name: name.trim(),
          category,
          categorySlug: category === 'Perangkat IT' ? 'it' : category.toLowerCase(),
          location,
          locationId: location === 'Kantor Pusat' ? 'loc-1' : 'loc-2',
          purchaseDate,
          purchasePrice: Number(purchasePrice) || 0,
          condition,
          status,
          brand,
          model,
          serialNumber,
          assignedTo,
          specification,
          notes,
          image: category === 'Perangkat IT' 
            ? 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80'
            : category === 'Kendaraan'
            ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1580481077195-c3a821a506cb?w=400&auto=format&fit=crop&q=80'
        })
      });

      const json = await res.json();
      if (json.success) {
        router.push('/aset');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <RoleGuard
        permission="canCreateAsset"
        fallbackTitle="Akses Ditolak: Tambah Aset"
        fallbackDescription="Peran Anda tidak diizinkan untuk mendaftarkan aset baru ke dalam sistem inventaris. Fitur ini hanya dapat dilakukan oleh Super Admin atau Admin Aset."
      >
        <div className="space-y-6 max-w-4xl">
          {/* Header & Breadcrumb */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tambah Aset Baru</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
              <Link href="/aset" className="hover:text-blue-600 font-medium">
                Data Aset
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-800 font-bold">Tambah Aset</span>
            </div>
          </div>

          {/* Form Card (Matching Screen 4) */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Informasi Umum & Spesifikasi Aset</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nama Aset */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Nama Aset <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Laptop Dell Latitude 5520"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="Perangkat IT">Perangkat IT</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Mesin & Peralatan">Mesin & Peralatan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Kode Aset */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kode Aset <span className="text-slate-400 font-normal">(Opsional / Otomatis)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Auto: AST-IT-XXXX"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Lokasi */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Lokasi Penempatan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="Kantor Pusat">Kantor Pusat - Divisi IT</option>
                    <option value="Cabang A">Cabang A - Ruang Rapat</option>
                    <option value="Cabang B">Cabang B - Pool Armada</option>
                    <option value="Gudang">Gudang Utama</option>
                  </select>
                </div>

                {/* Tanggal Perolehan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Tanggal Perolehan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Nilai Perolehan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Nilai Perolehan (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 15000000"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Merek */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Merek / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dell, Toyota, Informa"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Tipe / Model */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Tipe / Model
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Latitude 5520, Avanza 1.3 G"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Nomor Seri (Serial Number / No. Rangka)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: DL5520112345"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Penanggung Jawab */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Penanggung Jawab / Pemegang Aset
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tim IT, Bagas (Marketing)"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Kondisi */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kondisi Fisik
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as AssetCondition)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="Baik">Baik (Normal)</option>
                    <option value="Perbaikan">Perbaikan (Sedang Diservis)</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Status Operasional
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssetStatus)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                  </select>
                </div>
              </div>

              {/* Spesifikasi Teknis */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Spesifikasi Teknis
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Intel Core i5-1135G7, 8GB DDR4 RAM, 512GB NVMe SSD, Windows 11 Pro"
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              {/* Keterangan Tambahan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Keterangan & Catatan Khusus
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan garansi vendor, kelengkapan aksesoris, atau riwayat pengadaan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => router.push('/aset')}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Aset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
