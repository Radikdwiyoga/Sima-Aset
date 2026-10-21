'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Navigation,
  ExternalLink,
  Compass,
  Map as MapIcon,
  Layers,
  Search,
  Crosshair
} from 'lucide-react';
import { DataService } from '@/lib/dataService';
import { Location } from '@/types';
import { LocationDistributionMap } from '@/components/LocationDistributionMap';

const PRESET_CITIES = [
  { name: 'Jakarta Pusat', lat: -6.175392, lng: 106.827153 },
  { name: 'Jakarta Selatan', lat: -6.229728, lng: 106.807490 },
  { name: 'Bandung', lat: -6.917464, lng: 107.619123 },
  { name: 'Surabaya', lat: -7.257472, lng: 112.752088 },
  { name: 'Semarang', lat: -6.966667, lng: 110.416664 },
  { name: 'Yogyakarta', lat: -7.795580, lng: 110.369490 },
  { name: 'Bekasi / Cikarang', lat: -6.238270, lng: 106.975573 },
  { name: 'Tangerang', lat: -6.178306, lng: 106.631889 },
  { name: 'Medan', lat: 3.595196, lng: 98.672226 },
  { name: 'Makassar', lat: -5.147665, lng: 119.432732 },
  { name: 'Bali / Denpasar', lat: -8.670458, lng: 115.212629 },
  { name: 'Balikpapan (IKN)', lat: -1.237927, lng: 116.828873 },
];

export default function LokasiPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchTable, setSearchTable] = useState('');

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
    setAddress('');
    setCity('');
    setLatitude('-6.175392');
    setLongitude('106.827153');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
    setEditingLoc(loc);
    setName(loc.name);
    setDescription(loc.description || '');
    setAddress(loc.address || '');
    setCity(loc.city || '');
    setLatitude(loc.latitude !== undefined ? String(loc.latitude) : '');
    setLongitude(loc.longitude !== undefined ? String(loc.longitude) : '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, locName: string) => {
    if (confirm(`Yakin ingin menghapus lokasi "${locName}"?`)) {
      DataService.deleteLocation(id);
      reloadLocations();
    }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung pendeteksi GPS geolokasi.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
      },
      (err) => {
        alert(`Gagal mengambil titik GPS: ${err.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const found = PRESET_CITIES.find((c) => c.name === val);
    if (found) {
      setLatitude(String(found.lat));
      setLongitude(String(found.lng));
      if (!city) setCity(found.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const latNum = latitude.trim() !== '' ? parseFloat(latitude) : undefined;
    const lngNum = longitude.trim() !== '' ? parseFloat(longitude) : undefined;

    if (editingLoc) {
      DataService.updateLocation(editingLoc.id, {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        latitude: latNum,
        longitude: lngNum
      });
    } else {
      DataService.createLocation({
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        latitude: latNum,
        longitude: lngNum
      });
    }

    setIsModalOpen(false);
    reloadLocations();
  };

  const filteredList = locations.filter((loc) => {
    if (!searchTable.trim()) return true;
    const q = searchTable.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      (loc.address && loc.address.toLowerCase().includes(q)) ||
      (loc.city && loc.city.toLowerCase().includes(q)) ||
      (loc.description && loc.description.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-blue-600" />
              <span>Data Lokasi & Sebaran Maps</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola titik fisik kantor/gudang, koordinat GPS, dan visualisasi pemetaan aset perusahaan
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Lokasi Baru</span>
          </button>
        </div>

        {/* Visual Sebaran Maps Section */}
        <div className="w-full">
          <LocationDistributionMap
            locations={locations}
            selectedLocationId={selectedLocId}
            onSelectLocation={(loc) => setSelectedLocId(loc.id)}
            heightClass="h-[360px] sm:h-[420px]"
          />
        </div>

        {/* Table & Search Header */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Daftar Titik Lokasi ({locations.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Klik baris atau tombol koordinat untuk memfokuskan lokasi di peta visual
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari lokasi, kota, alamat..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center font-semibold">No</th>
                    <th className="py-3.5 px-4 font-semibold">Nama Lokasi & Wilayah</th>
                    <th className="py-3.5 px-4 font-semibold">Alamat Lengkap</th>
                    <th className="py-3.5 px-4 font-semibold">Koordinat GPS Maps</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Jumlah Aset</th>
                    <th className="py-3.5 px-4 font-semibold text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Tidak ada data lokasi yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((loc, idx) => {
                      const isSelected = selectedLocId === loc.id;
                      const hasCoords = loc.latitude !== undefined && loc.longitude !== undefined;
                      return (
                        <tr
                          key={loc.id || idx}
                          onClick={() => setSelectedLocId(loc.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <MapPin
                                className={`w-4 h-4 shrink-0 ${
                                  isSelected ? 'text-blue-600' : 'text-slate-400'
                                }`}
                              />
                              <div>
                                <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                                  {loc.name}
                                </span>
                                {loc.city && (
                                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 inline-block mt-0.5">
                                    {loc.city}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                            <p className="line-clamp-2 leading-relaxed">
                              {loc.address || loc.description || '-'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            {hasCoords ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLocId(loc.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="font-mono text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Fokuskan titik di peta"
                                >
                                  <Navigation className="w-3 h-3 text-blue-600" />
                                  <span>{loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</span>
                                </button>
                                <a
                                  href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Buka di Google Maps"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">
                                Belum ada koordinat
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {loc.count || 0} Unit
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(loc)}
                                title="Edit Lokasi & Koordinat"
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(loc.id, loc.name)}
                                title="Hapus Lokasi"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Add / Edit with Coordinate Picker */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{editingLoc ? 'Edit Lokasi & Koordinat Maps' : 'Tambah Lokasi Baru'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur nama fisik, alamat lengkap, serta titik koordinat GPS
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Nama Lokasi & Kota */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Lokasi / Kantor <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kantor Cabang Bandung"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kota / Wilayah
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bandung, Jawa Barat"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Alamat Fisik Lengkap */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Lengkap / Gedung
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Jl. Asia Afrika No. 45, Gedung Menara B Lantai 3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Keterangan / Fungsi Penempatan Aset
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kantor operasional pemasaran dan customer support"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* GPS Coordinates Header & Shortcut Tools */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                        <span>Titik Koordinat Maps (GPS)</span>
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Latitude & Longitude menentukan titik pin pada peta
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleGetGPS}
                        disabled={gpsLoading}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                        title="Dapatkan koordinat GPS posisi Anda saat ini"
                      >
                        <Crosshair className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                        <span>{gpsLoading ? 'Mencari...' : 'GPS Saya'}</span>
                      </button>

                      <select
                        onChange={handleSelectPreset}
                        defaultValue=""
                        className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Pilih Kota Cepat...
                        </option>
                        {PRESET_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Latitude (Lintang)
                      </label>
                      <input
                        type="text"
                        placeholder="-6.175392"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Longitude (Bujur)
                      </label>
                      <input
                        type="text"
                        placeholder="106.827153"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Interactive Mini Picker Map */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 bg-white">
                    <LocationDistributionMap
                      locations={locations}
                      heightClass="h-[180px]"
                      isPickerMode={true}
                      pickedCoordinates={
                        latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))
                          ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
                          : null
                      }
                      onPickCoordinates={(lat, lng) => {
                        setLatitude(lat.toFixed(6));
                        setLongitude(lng.toFixed(6));
                      }}
                    />
                    <div className="bg-slate-100/80 px-3 py-1.5 text-[10px] text-slate-500 border-t border-slate-200 flex items-center justify-between">
                      <span>💡 Klik titik mana saja pada peta di atas untuk mengisi koordinat</span>
                      {latitude && longitude && (
                        <span className="font-mono font-bold text-blue-600">
                          {latitude}, {longitude}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingLoc ? 'Simpan Perubahan' : 'Tambahkan Lokasi'}</span>
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
