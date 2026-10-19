'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tags, Plus, ArrowRight, Edit2, Trash2, X, Check } from 'lucide-react';
import Link from 'next/link';
import { DataService } from '@/lib/dataService';
import { AssetCategory } from '@/types';

export default function KategoriPage() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AssetCategory | null>(null);
  const [name, setName] = useState('');
  const [codePrefix, setCodePrefix] = useState('');

  const reloadCategories = () => {
    const list = DataService.getCategories();
    setCategories(list);
  };

  useEffect(() => {
    reloadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setCodePrefix('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, cat: AssetCategory) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCat(cat);
    setName(cat.name);
    setCodePrefix(cat.codePrefix);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string, catName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Yakin ingin menghapus kategori "${catName}"?`)) {
      DataService.deleteCategory(id);
      reloadCategories();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prefix = codePrefix.trim().toUpperCase() || `AST-${name.trim().slice(0, 2).toUpperCase()}`;

    if (editingCat) {
      DataService.updateCategory(editingCat.id, {
        name: name.trim(),
        codePrefix: prefix,
        slug: editingCat.slug || name.trim().toLowerCase().replace(/\s+/g, '-')
      });
    } else {
      DataService.createCategory({
        name: name.trim(),
        codePrefix: prefix,
        slug: name.trim().toLowerCase().replace(/\s+/g, '-')
      });
    }

    setIsModalOpen(false);
    reloadCategories();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kategori Aset</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Klasifikasi kelompok aset perusahaan dan pembagian kode prefix inventaris
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Kategori</span>
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <Tags className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Belum ada kategori aset.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Tambah Kategori Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id || cat.name}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {cat.codePrefix}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-500 mr-2">
                        {cat.percentage || 0}%
                      </span>
                      <button
                        onClick={(e) => handleOpenEdit(e, cat)}
                        title="Edit Kategori"
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, cat.id, cat.name)}
                        title="Hapus Kategori"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                    {cat.count} <span className="text-xs font-medium text-slate-400">Unit</span>
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <Link
                    href={`/aset?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center gap-1.5 hover:underline"
                  >
                    <span>Lihat Daftar Aset</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Add / Edit Category */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingCat ? 'Edit Kategori Aset' : 'Tambah Kategori Baru'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Kategori <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Drone & Robotik, Kendaraan Listrik"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Prefix Inventaris (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: AST-DR, AST-EV"
                    value={codePrefix}
                    onChange={(e) => setCodePrefix(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Digunakan untuk format otomatis nomor tag aset baru
                  </span>
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
                    <span>{editingCat ? 'Simpan Perubahan' : 'Tambahkan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
