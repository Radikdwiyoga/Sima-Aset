'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { CategorySlug, AssetCondition, AssetStatus } from '@/types';
import { DataService } from '@/lib/dataService';

interface AddAssetModalProps {
  isOpen: boolean;
  defaultCategory?: CategorySlug;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAssetModal({
  isOpen,
  defaultCategory = 'it',
  onClose,
  onSuccess
}: AddAssetModalProps) {
  const [category, setCategory] = useState<CategorySlug>(defaultCategory);
  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('Gedung A - Lantai 2');
  const [assignedUserName, setAssignedUserName] = useState('');
  const [brand, setBrand] = useState('');
  const purchasePrice = 0;
  const [condition, setCondition] = useState<AssetCondition>('Baik');
  const [status, setStatus] = useState<AssetStatus>('Aktif');
  const [quantity, setQuantity] = useState(1);

  // Category-specific fields
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [wattage, setWattage] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [material, setMaterial] = useState('');
  const [capacity, setCapacity] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama aset harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    // Generate tag if empty
    const prefixMap: Record<string, string> = {
      it: 'IT',
      'rumah-tangga': 'RTK',
      elektronik: 'ELK',
      furnitur: 'FRN',
      furniture: 'FRN'
    };
    const finalTag = assetTag.trim() || `${prefixMap[category] || 'AST'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const specificAttributes: Record<string, any> = {};
    if (category === 'it') {
      if (cpu) specificAttributes.cpu = cpu;
      if (ram) specificAttributes.ram = ram;
      if (storage) specificAttributes.storage = storage;
    } else if (category === 'elektronik') {
      if (wattage) specificAttributes.wattage = Number(wattage);
      if (vendorName) specificAttributes.vendorName = vendorName;
    } else if (category === 'furnitur' || (category as string) === 'furniture') {
      if (material) specificAttributes.material = material;
    } else if (category === 'rumah-tangga') {
      if (capacity) specificAttributes.capacity = capacity;
    }

    try {
      DataService.createAsset({
        assetTag: finalTag,
        name,
        categorySlug: category,
        category: category === 'it' ? 'Perangkat IT' : category === 'elektronik' ? 'Elektronik' : category === 'furnitur' ? 'Furniture' : 'Rumah Tangga',
        locationId: 'loc-1',
        location: locationName,
        assignedTo: assignedUserName || undefined,
        brand,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: Number(purchasePrice) || 0,
        condition,
        status,
      });

      onSuccess();
      onClose();
    } catch {
      setError('Terjadi kesalahan saat menyimpan aset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-8">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tambah Aset Baru</h3>
            <p className="text-xs text-slate-500">Daftarkan fisik barang ke dalam inventaris perusahaan</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Kategori Aset</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { slug: 'it', label: 'Aset IT' },
                { slug: 'rumah-tangga', label: 'Rumah Tangga' },
                { slug: 'elektronik', label: 'Elektronik' },
                { slug: 'furnitur', label: 'Furnitur' }
              ].map((c) => (
                <button
                  type="button"
                  key={c.slug}
                  onClick={() => setCategory(c.slug as CategorySlug)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold text-left transition-all ${
                    category === c.slug
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Aset (Tag)</label>
              <input
                type="text"
                placeholder="Contoh: OFF3002 (Opsional)"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Merek / Brand</label>
              <input
                type="text"
                placeholder="Dell, Apple, Daikin, dsb"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Perangkat / Aset *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Laptop ThinkPad X1 Carbon Gen 11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Penempatan</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Gedung A - Lantai 2"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pemegang (PIC/Karyawan)</label>
              <input
                type="text"
                placeholder="Nama karyawan pemegang"
                value={assignedUserName}
                onChange={(e) => setAssignedUserName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kondisi</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs"
              >
                <option value="Baik">Baik</option>
                <option value="Perbaikan">Perbaikan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Dipinjam">Dipinjam</option>
                <option value="Dihapusbukukan">Dihapusbukukan</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah (Qty)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Dynamic Category Specifications */}
          {category === 'it' && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
              <span className="font-bold text-slate-800 text-[11px] block">Spesifikasi Aset IT:</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="CPU (Core i7 / M3)"
                  value={cpu}
                  onChange={(e) => setCpu(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="RAM (16GB / 32GB)"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Storage (512GB SSD)"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          )}

          {category === 'elektronik' && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
              <span className="font-bold text-slate-800 text-[11px] block">Spesifikasi Elektronik:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Daya Listrik (Watt)"
                  value={wattage}
                  onChange={(e) => setWattage(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Vendor Servis Rekanan"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          )}

          {(category === 'furnitur' || (category as string) === 'furniture') && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
              <span className="font-bold text-slate-800 text-[11px] block">Spesifikasi Furnitur:</span>
              <input
                type="text"
                placeholder="Bahan / Material (Kayu Jati, Rangka Besi, Kulit Sintetis)"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
              />
            </div>
          )}

          {category === 'rumah-tangga' && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
              <span className="font-bold text-slate-800 text-[11px] block">Spesifikasi Rumah Tangga & Utilitas:</span>
              <input
                type="text"
                placeholder="Kapasitas / Volume (5 Liter, 320 Liter, 6 Kg Powder)"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Aset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
