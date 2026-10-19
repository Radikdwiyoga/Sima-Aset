'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MapPin, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { DataService } from '@/lib/dataService';
import { Location } from '@/types';

export default function LokasiPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const reloadLocations = () => {
    const list = DataService.getLocations();
    setLocations(list);
  };

  useEffect(() => {
    reloadLocations();
  }, []);

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
    setEditingLoc(loc);
    setName(loc.name);
    setDescription(loc.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, locName: string) => {
    if (confirm(`Yakin ingin menghapus lokasi "${locName}"?`)) {
      DataService.deleteLocation(id);
      reloadLocations();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingLoc) {
      DataService.updateLocation(editingLoc.id, {
        name: name.trim(),
        description: description.trim()
      });
    } else {
      DataService.createLocation({
        name: name.trim(),
        description: description.trim()
      });
    }

    setIsModalOpen(false);
    reloadLocations();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Lokasi</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data lokasi fisik dan persebaran inventaris aset perusahaan
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Lokasi</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 w-12 text-center font-semibold">No</th>
                  <th className="py-3 px-4 font-semibold">Nama Lokasi</th>
                  <th className="py-3 px-4 font-semibold">Deskripsi</th>
                  <th className="py-3 px-4 font-semibold">Jumlah Aset</th>
                  <th className="py-3 px-4 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada data lokasi. Klik &ldquo;+ Tambah Lokasi&rdquo; untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  locations.map((loc, idx) => (
                    <tr key={loc.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{loc.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {loc.description || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {loc.count || 0} Unit
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(loc)}
                            title="Edit Lokasi"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(loc.id, loc.name)}
                            title="Hapus Lokasi"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Add / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingLoc ? 'Edit Lokasi Aset' : 'Tambah Lokasi Baru'}
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
                    Nama Lokasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gedung A Lantai 3, Gudang Logistik"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Deskripsi / Keterangan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Ruang server dan perangkat jaringan utama"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
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
                    <span>{editingLoc ? 'Simpan Perubahan' : 'Tambahkan'}</span>
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
