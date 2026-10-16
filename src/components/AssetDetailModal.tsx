'use client';

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Printer, 
  Edit3, 
  Check, 
  Boxes, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Asset, AssetCondition, AssetStatus } from '@/types';

interface AssetDetailModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function AssetDetailModal({
  asset,
  isOpen,
  onClose,
  onUpdated
}: AssetDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showBAST, setShowBAST] = useState(false);

  // Edit fields
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [assignedUserName, setAssignedUserName] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('Baik');
  const [status, setStatus] = useState<AssetStatus>('Aktif');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (asset) {
      setName(asset.name);
      setLocationName(asset.locationName || asset.location || '');
      setAssignedUserName(asset.assignedUserName || asset.assignedTo || '');
      setCondition(asset.condition);
      setStatus(asset.status);
      setIsEditing(false);
      setShowBAST(false);
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          locationName,
          assignedUserName: assignedUserName || null,
          condition,
          status
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        onUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBAST = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {showBAST ? 'Berita Acara Serah Terima (BAST)' : 'Detail Informasi Aset'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {asset.assetTag} • {asset.categorySlug.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showBAST && !isEditing && (
              <>
                <button
                  onClick={() => setShowBAST(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>BAST Digital</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </button>
              </>
            )}

            {showBAST && (
              <button
                onClick={() => setShowBAST(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Kembali ke Detail
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Mode 1: Regular Detail / Edit View */}
        {!showBAST ? (
          <div className="p-6 space-y-5 text-xs">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Aset</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lokasi Ruangan</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pemegang (PIC)</label>
                    <input
                      type="text"
                      value={assignedUserName}
                      onChange={(e) => setAssignedUserName(e.target.value)}
                      placeholder="Nama karyawan"
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kondisi Fisik</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as AssetCondition)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Baik">Baik</option>
                      <option value="Perbaikan">Perbaikan</option>
                      <option value="Rusak">Rusak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status Operasional</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as AssetStatus)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Tersedia">Tersedia</option>
                      <option value="Dipinjam">Dipinjam</option>
                      <option value="Dihapusbukukan">Dihapusbukukan</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Meta Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kondisi</span>
                    <span className={`inline-block mt-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                      asset.condition === 'Baik' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {asset.condition}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                    <span className="inline-block mt-1 font-bold px-2 py-0.5 rounded text-[11px] bg-blue-100 text-blue-800">
                      {asset.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jumlah</span>
                    <span className="font-mono font-bold text-slate-900 text-sm block mt-1">
                      {asset.quantity || 1} Unit
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nilai Pengadaan</span>
                    <span className="font-bold text-slate-900 text-xs block mt-1">
                      Rp {(asset.purchasePrice || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Lokasi Penempatan</span>
                      <p className="font-semibold text-slate-800 text-xs">{asset.locationName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Penanggung Jawab (PIC)</span>
                      <p className="font-semibold text-slate-800 text-xs">{asset.assignedUserName || 'Belum Ditugaskan (Pool Umum)'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Tanggal Pengadaan</span>
                      <p className="font-semibold text-slate-800 text-xs">{asset.purchaseDate || '2024-01-01'}</p>
                    </div>
                  </div>
                </div>

                {/* Specific Attributes */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Spesifikasi Khusus Kategori {asset.categorySlug.toUpperCase()}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(asset.specificAttributes).map(([key, val]) => (
                      <div key={key} className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="font-semibold text-slate-800 text-xs">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Content Mode 2: BAST Digital Formal Document (Printable) */
          <div className="p-6">
            <div className="printable-area border border-slate-300 rounded-xl p-8 bg-white text-slate-900 space-y-5 text-xs">
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-base font-black uppercase tracking-wider">BERITA ACARA SERAH TERIMA ASET (BAST)</h2>
                <p className="text-[11px] font-mono mt-0.5">Nomor: BAST/SIMA/{asset.assetTag}/{new Date().getFullYear()}</p>
              </div>

              <p className="leading-relaxed">
                Pada hari ini, tanggal <strong>{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>, telah dilakukan serah terima fasilitas dan inventaris aset perusahaan dengan rincian sebagai berikut:
              </p>

              <table className="w-full border-collapse border border-slate-300 text-left text-xs my-3">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50 w-44">Kode Aset (Tag)</td>
                    <td className="p-2 font-mono font-bold text-blue-600">{asset.assetTag}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50">Nama Barang</td>
                    <td className="p-2 font-bold">{asset.name}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50">Merek / Seri</td>
                    <td className="p-2">{asset.brand || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50">Lokasi Penempatan</td>
                    <td className="p-2">{asset.locationName}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-bold bg-slate-50">Kondisi Fisik Saat Serah Terima</td>
                    <td className="p-2 font-semibold">{asset.condition}</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                Pihak Kedua (Pemegang Aset) berkewajiban menjaga, merawat, dan menggunakan fasilitas inventaris tersebut untuk keperluan operasional perusahaan. Apabila terjadi kerusakan atau kehilangan, segera laporkan ke General Affairs / IT Support.
              </p>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-6 text-center gap-10">
                <div>
                  <p className="font-semibold text-slate-600">Pihak Pertama (Pengelola GA / IT)</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">General Affairs Admin</p>
                  <p className="text-[10px] text-slate-500">SIM ASET TERPADU</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-600">Pihak Kedua (Penerima / PIC)</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">{asset.assignedUserName || 'Karyawan Penerima'}</p>
                  <p className="text-[10px] text-slate-500">NIP / Karyawan</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 no-print">
              <button
                onClick={handlePrintBAST}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1.5 text-xs shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen BAST (Print)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

