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
  QrCode, 
  FileText, 
  Clock, 
  ShieldCheck, 
  User, 
  ArrowLeft, 
  X, 
  Lock,
  Upload,
  Download,
  Trash2,
  Eye,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { Asset, AssetCondition, AssetDocument } from '@/types';
import { QRModal } from '@/components/QRModal';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/lib/dataService';

function DetailAsetContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('canEditAsset');

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Informasi Umum' | 'Riwayat' | 'Dokumen' | 'Peminjaman' | 'Perawatan'>('Informasi Umum');
  
  // Modals
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<AssetDocument | null>(null);

  // Document upload form states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<AssetDocument['category']>('Invoice');
  const [uploadDocNotes, setUploadDocNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [docAlert, setDocAlert] = useState<string | null>(null);

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
  const [maintNotes, setMaintNotes] = useState('');
  const [maintCost, setMaintCost] = useState('');

  useEffect(() => {
    if (!id) return;
    try {
      const found = DataService.getAssetById(id);
      if (found) {
        setAsset(found);
        setEditName(found.name);
        setEditBrand(found.brand || '');
        setEditModel(found.model || '');
        setEditSerial(found.serialNumber || '');
        setEditSpec(found.specification || '');
        setEditAssigned(found.assignedTo || '');
        setEditNotes(found.notes || '');
        setEditCondition(found.condition);
        setNewLocation(found.location);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Akses Ditolak: Anda tidak memiliki izin untuk mengedit aset ini.');
      return;
    }
    if (!asset) return;

    try {
      const updated = DataService.updateAsset(asset.id, {
        name: editName,
        brand: editBrand,
        model: editModel,
        serialNumber: editSerial,
        specification: editSpec,
        assignedTo: editAssigned,
        notes: editNotes,
        condition: editCondition,
      });
      if (updated) {
        setAsset(updated);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Akses Ditolak: Anda tidak memiliki izin untuk memindahkan aset ini.');
      return;
    }
    if (!asset || !newLocation) return;

    try {
      const updated = DataService.updateAsset(asset.id, {
        location: newLocation,
      });
      if (updated) {
        setAsset(updated);
        setIsMoveModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Akses Ditolak: Anda tidak memiliki izin untuk menjadwalkan perbaikan.');
      return;
    }
    if (!asset) return;

    try {
      const updated = DataService.updateAsset(asset.id, {
        status: 'Dalam Perbaikan',
        condition: 'Perbaikan',
      });
      if (updated) {
        setAsset(updated);
        setIsMaintModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecommission = async () => {
    if (!hasPermission('canDeleteAsset')) {
      alert('Akses Ditolak: Hanya Super Admin yang berwenang menonaktifkan aset.');
      return;
    }
    if (!asset) return;
    if (confirm('Apakah Anda yakin ingin menonaktifkan aset ini? Status aset akan diubah menjadi "Tidak Aktif".')) {
      try {
        const updated = DataService.updateAsset(asset.id, {
          status: 'Tidak Aktif',
        });
        if (updated) {
          setAsset(updated);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    if (!uploadFile) {
      alert('Silakan pilih berkas dokumen yang ingin diupload.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const fileData = evt.target?.result as string;
        const sizeKB = uploadFile.size / 1024;
        const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;

        const newDoc = DataService.addAssetDocument(asset.id, {
          name: uploadDocName.trim() || uploadFile.name,
          category: uploadCategory,
          fileType: uploadFile.name.split('.').pop()?.toLowerCase() || 'pdf',
          fileSize: sizeStr,
          fileData,
          notes: uploadDocNotes.trim() || 'Dokumen kelengkapan diunggah melalui sistem SIMA.'
        });

        if (newDoc) {
          const fresh = DataService.getAssetById(asset.id);
          if (fresh) setAsset(fresh);
          setIsUploadDocModalOpen(false);
          setUploadFile(null);
          setUploadDocName('');
          setUploadDocNotes('');
          setDocAlert(`Dokumen "${newDoc.name}" berhasil diupload dan disimpan!`);
          setTimeout(() => setDocAlert(null), 5000);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(uploadFile);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert('Gagal memproses upload dokumen.');
    }
  };

  const handleDownloadDocument = (doc: AssetDocument) => {
    if (!asset) return;

    if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Default document downloader: creates an official text/certificate archive file
    const content = [
      '================================================================================',
      '                          SIM ASET TERPADU ENTERPRISE',
      '                   DOKUMEN ARSIP KELENGKAPAN ASET PERUSAHAAN',
      '================================================================================',
      '',
      `Nama Dokumen       : ${doc.name}`,
      `Kategori Dokumen   : ${doc.category || 'Dokumen Inventaris'}`,
      `Tanggal Dokumen    : ${doc.uploadDate || '-'}`,
      `Ukuran File        : ${doc.fileSize || '-'}`,
      `Catatan            : ${doc.notes || 'Arsip kelengkapan inventaris resmi internal.'}`,
      '',
      '--------------------------------------------------------------------------------',
      '                             INFORMASI DETAIL ASET',
      '--------------------------------------------------------------------------------',
      `Kode Tag Aset      : ${asset.assetTag}`,
      `Nama Barang        : ${asset.name}`,
      `Kategori Aset      : ${asset.category}`,
      `Lokasi Penempatan  : ${asset.location}`,
      `Penanggung Jawab   : ${asset.assignedTo || '-'}`,
      `Merk / Brand       : ${asset.brand || '-'}`,
      `Model / Tipe       : ${asset.model || '-'}`,
      `Nomor Seri         : ${asset.serialNumber || '-'}`,
      `Harga Perolehan    : Rp ${(asset.purchasePrice || 0).toLocaleString('id-ID')}`,
      `Tanggal Pembelian  : ${asset.purchaseDate || '-'}`,
      `Status Aset        : ${asset.status}`,
      `Kondisi Fisik      : ${asset.condition}`,
      `Spesifikasi        : ${asset.specification || '-'}`,
      '',
      '--------------------------------------------------------------------------------',
      '                        LEMBAR PENGESAHAN & KONTROL',
      '--------------------------------------------------------------------------------',
      'Dokumen ini merupakan salinan arsip digital terverifikasi yang tercatat',
      'dalam Sistem Informasi Manajemen Aset (SIMA) Terpadu Enterprise.',
      '',
      `Waktu Unduh Dokumen: ${new Date().toLocaleString('id-ID')}`,
      'Petugas Administrator Aset Perusahaan: Terverifikasi Digital',
      '================================================================================'
    ].join('\r\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const downloadFilename = doc.name.endsWith('.pdf') ? doc.name.replace(/\.pdf$/, '.txt') : doc.name;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteDocument = (docId: string, docName: string) => {
    if (!canEdit) {
      alert('Akses Ditolak: Anda tidak memiliki izin untuk menghapus dokumen.');
      return;
    }
    if (!asset) return;
    if (confirm(`Apakah Anda yakin ingin menghapus dokumen "${docName}" dari aset ini?`)) {
      DataService.deleteAssetDocument(asset.id, docId);
      const fresh = DataService.getAssetById(asset.id);
      if (fresh) setAsset(fresh);
      setDocAlert(`Dokumen "${docName}" berhasil dihapus.`);
      setTimeout(() => setDocAlert(null), 4000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span className="text-xs text-slate-500 font-medium">Memuat data aset...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!asset) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <p className="text-sm font-semibold text-slate-700">Aset tidak ditemukan</p>
          <button
            onClick={() => router.push('/aset')}
            className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            Kembali ke Daftar Aset
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={13} />
          <Link href="/aset" className="hover:text-blue-600">Manajemen Aset</Link>
          <ChevronRight size={13} />
          <span className="text-slate-800 font-medium">{asset.name}</span>
        </div>

        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/aset')}
              className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">{asset.name}</h1>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                  asset.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  asset.status === 'Dalam Perbaikan' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {asset.status}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                  asset.condition === 'Baik' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  asset.condition === 'Perbaikan' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  Kondisi: {asset.condition}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Kode Tag: <span className="font-semibold text-slate-700">{asset.assetTag}</span> • Kategori: <span className="font-medium text-slate-700">{asset.category}</span></p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <QrCode size={14} />
              Cetak QR Tag
            </button>
            <button
              onClick={() => {
                if (!canEdit) {
                  alert('Akses Ditolak: Anda tidak memiliki izin untuk mengedit aset.');
                  return;
                }
                setIsEditModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                canEdit ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {canEdit ? <Edit3 size={14} /> : <Lock size={14} />}
              Edit Spesifikasi
            </button>
            <button
              onClick={() => {
                if (!canEdit) {
                  alert('Akses Ditolak: Anda tidak memiliki izin untuk memindahkan aset.');
                  return;
                }
                setIsMoveModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                canEdit ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <MapPin size={14} />
              Pindah Lokasi
            </button>
            <button
              onClick={() => {
                if (!canEdit) {
                  alert('Akses Ditolak: Anda tidak memiliki izin untuk menjadwalkan perbaikan.');
                  return;
                }
                setIsMaintModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                canEdit ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Wrench size={14} />
              Jadwal Servis
            </button>
            {hasPermission('canDeleteAsset') && (
              <button
                onClick={handleDecommission}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <PowerOff size={14} />
                Nonaktifkan
              </button>
            )}
          </div>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Lokasi Saat Ini</span>
              <p className="text-sm font-bold text-slate-800">{asset.location}</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Penanggung Jawab</span>
              <p className="text-sm font-bold text-slate-800">{asset.assignedTo || 'Belum Ditugaskan'}</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Nilai Perolehan</span>
              <p className="text-sm font-bold text-slate-800">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(asset.purchasePrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-semibold">
            {(['Informasi Umum', 'Riwayat', 'Dokumen', 'Peminjaman', 'Perawatan'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Tab 1: Informasi Umum & Spesifikasi Lengkap */}
            {activeTab === 'Informasi Umum' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Spesifikasi & Detail */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={15} className="text-blue-600" />
                    Spesifikasi Teknis & Identitas Barang
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Merk / Brand:</span>
                      <span className="text-slate-800 font-semibold">{asset.brand || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Model / Tipe:</span>
                      <span className="text-slate-800 font-semibold">{asset.model || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Nomor Seri (Serial Number):</span>
                      <span className="text-slate-800 font-mono font-semibold">{asset.serialNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Tanggal Pengadaan:</span>
                      <span className="text-slate-800 font-semibold">{asset.purchaseDate}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block font-medium">Spesifikasi Detail:</span>
                      <span className="text-slate-800 font-semibold bg-white p-2 rounded-lg border border-slate-200 mt-1 block">
                        {asset.specification || 'Tidak ada detail spesifikasi spesifik.'}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block font-medium">Catatan / Deskripsi:</span>
                      <span className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-1 block">
                        {asset.notes || 'Tidak ada catatan tambahan.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Asset Photo & QR Tag Preview */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode size={15} className="text-blue-600" />
                    Foto & Label Identifikasi
                  </h3>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                    {asset.image ? (
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-full h-44 object-cover rounded-lg border border-slate-200 shadow-xs mb-3"
                      />
                    ) : (
                      <div className="w-full h-44 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 mb-3">
                        Foto Tidak Tersedia
                      </div>
                    )}

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs w-full flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scan Tag</span>
                        <span className="text-xs font-mono font-bold text-slate-800">{asset.assetTag}</span>
                      </div>
                      <button
                        onClick={() => setIsQRModalOpen(true)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold"
                      >
                        <QrCode size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Riwayat Aktivitas Aset */}
            {activeTab === 'Riwayat' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={15} className="text-blue-600" />
                  Log Rekam Jejak Aset
                </h3>
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-2">
                  <div className="relative pl-5">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
                    <span className="text-[11px] font-semibold text-blue-600">Hari ini</span>
                    <p className="text-xs font-bold text-slate-800">Verifikasi Terakhir & Status Terbarui</p>
                    <p className="text-xs text-slate-500">Status aset: {asset.status} ({asset.condition})</p>
                  </div>
                  <div className="relative pl-5">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></div>
                    <span className="text-[11px] font-semibold text-slate-400">{asset.purchaseDate}</span>
                    <p className="text-xs font-bold text-slate-800">Aset Berhasil Didaftarkan</p>
                    <p className="text-xs text-slate-500">Aset masuk ke sistem melalui pengadaan inventaris awal dengan nilai perolehan Rp {asset.purchasePrice.toLocaleString('id-ID')}.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Dokumen & Sertifikat Kelengkapan */}
            {activeTab === 'Dokumen' && (
              <div className="space-y-4">
                {/* Alert Notification */}
                {docAlert && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{docAlert}</span>
                    </div>
                    <button
                      onClick={() => setDocAlert(null)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                    >
                      Tutup
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={15} className="text-blue-600" />
                      Dokumen & Sertifikat Kelengkapan Barang
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Arsip digital faktur, kartu garansi resmi, berita acara, dan buku panduan aset ini.
                    </p>
                  </div>
                  {canEdit ? (
                    <button
                      onClick={() => setIsUploadDocModalOpen(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <Upload size={13} />
                      <span>+ Upload Dokumen</span>
                    </button>
                  ) : (
                    <div
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-not-allowed"
                      title="Peran Anda hanya memiliki akses melihat."
                    >
                      <Lock size={12} />
                      <span>Upload Dokumen (Admin)</span>
                    </div>
                  )}
                </div>

                {/* Documents Grid / List */}
                {asset.documents && asset.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {asset.documents.map((doc) => {
                      const isInvoice = doc.category === 'Invoice' || doc.name.toLowerCase().includes('invoice') || doc.name.toLowerCase().includes('faktur');
                      const isWarranty = doc.category === 'Garansi' || doc.name.toLowerCase().includes('garansi');
                      const isImage = doc.fileType?.includes('png') || doc.fileType?.includes('jpg') || doc.fileType?.includes('jpeg');

                      return (
                        <div
                          key={doc.id}
                          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isInvoice ? 'bg-rose-50 text-rose-600' :
                              isWarranty ? 'bg-emerald-50 text-emerald-600' :
                              isImage ? 'bg-purple-50 text-purple-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {isWarranty ? (
                                <ShieldCheck size={20} />
                              ) : isImage ? (
                                <ImageIcon size={20} />
                              ) : (
                                <FileText size={20} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isInvoice ? 'bg-rose-100 text-rose-700' :
                                  isWarranty ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {doc.category || 'Dokumen'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {doc.fileSize || 'PDF'}
                                </span>
                              </div>
                              <p className="font-bold text-slate-800 mt-1 truncate" title={doc.name}>
                                {doc.name}
                              </p>
                              {doc.notes && (
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1" title={doc.notes}>
                                  {doc.notes}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400 mt-1">
                                Diunggah: {doc.uploadDate || asset.purchaseDate || '-'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDownloadDocument(doc)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Unduh berkas ke komputer"
                              >
                                <Download size={13} />
                                <span>Unduh</span>
                              </button>

                              {(doc.fileData || doc.notes) && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Lihat isi dokumen"
                                >
                                  <Eye size={13} />
                                  <span>Pratinjau</span>
                                </button>
                              )}
                            </div>

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(doc.id, doc.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus dokumen"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Belum Ada Dokumen Terlampir</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                      Lampirkan berkas invoice pembelian, kartu garansi resmi, sertifikat, atau buku manual untuk melengkapi arsip aset ini.
                    </p>
                    {canEdit && (
                      <button
                        onClick={() => setIsUploadDocModalOpen(true)}
                        className="mt-3 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Upload Dokumen Sekarang</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Peminjaman */}
            {activeTab === 'Peminjaman' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={15} className="text-blue-600" />
                  Status & Riwayat Peminjaman Aset
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-slate-400 block font-medium">Status Penggunaan Saat Ini:</span>
                      <span className="text-slate-800 font-bold text-sm">
                        {asset.assignedTo ? `Sedang Digunakan / Ditugaskan ke: ${asset.assignedTo}` : 'Tersedia di Gudang / Siap Dipinjam'}
                      </span>
                    </div>
                    <button
                      onClick={() => router.push('/peminjaman')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Buka Menu Peminjaman
                    </button>
                  </div>
                  <p className="text-slate-500 mt-3">
                    Pengelolaan perizinan, upload surat serah terima (BAST), dan tanda tangan peminjaman dapat dikelola melalui modul Peminjaman Aset.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 5: Perawatan */}
            {activeTab === 'Perawatan' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench size={15} className="text-blue-600" />
                    Jadwal & Riwayat Servis / Perawatan
                  </h3>
                  <button
                    onClick={() => {
                      if (!canEdit) {
                        alert('Akses Ditolak: Anda tidak memiliki izin untuk menjadwalkan servis.');
                        return;
                      }
                      setIsMaintModalOpen(true);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      canEdit ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    + Jadwalkan Servis
                  </button>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <p className="text-slate-600">
                    Kondisi Aset Saat Ini: <span className="font-bold text-slate-800">{asset.condition}</span> ({asset.status})
                  </p>
                  <p className="text-slate-500 mt-1">
                    Jadwal servis preventif dianjurkan setiap 6 bulan sekali untuk memastikan keandalan operasional perangkat.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Tag Modal */}
      {isQRModalOpen && (
        <QRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          asset={asset}
        />
      )}

      {/* Modal: Edit Spesifikasi */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Data & Spesifikasi Aset</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateAsset} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Aset</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Merk / Brand</label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Model / Tipe</label>
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nomor Seri (Serial Number)</label>
                <input
                  type="text"
                  value={editSerial}
                  onChange={(e) => setEditSerial(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kondisi Barang</label>
                <select
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value as AssetCondition)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Baik">Baik</option>
                  <option value="Perbaikan">Perbaikan</option>
                  <option value="Rusak">Rusak</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Spesifikasi Lengkap</label>
                <textarea
                  rows={3}
                  value={editSpec}
                  onChange={(e) => setEditSpec(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Penanggung Jawab (Assigned To)</label>
                <input
                  type="text"
                  value={editAssigned}
                  onChange={(e) => setEditAssigned(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pindah Lokasi */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Pindah Lokasi Aset</h3>
              <button onClick={() => setIsMoveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleMoveLocation} className="space-y-3 mt-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Lokasi Sekarang:</span>
                <span className="text-slate-800 font-bold">{asset.location}</span>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Pilih Lokasi Baru</label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Kantor Pusat">Kantor Pusat</option>
                  <option value="Kantor Pusat - Divisi IT">Kantor Pusat - Divisi IT</option>
                  <option value="Cabang A">Cabang A</option>
                  <option value="Cabang B">Cabang B</option>
                  <option value="Gudang Utama">Gudang Utama</option>
                  <option value="Ruang Rapat">Ruang Rapat</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Konfirmasi Pindah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Jadwal Servis / Maintenance */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Jadwalkan Servis / Perawatan</h3>
              <button onClick={() => setIsMaintModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMaintenance} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Vendor / Teknisi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Service Center Resmi"
                  value={maintVendor}
                  onChange={(e) => setMaintVendor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Deskripsi Kerusakan / Tindakan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Deskripsikan tindakan servis yang akan dilakukan"
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Estimasi Biaya (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={maintCost}
                  onChange={(e) => setMaintCost(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
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

      {/* Modal: Upload Dokumen Kelengkapan Aset */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Dokumen Kelengkapan</h3>
                  <p className="text-[11px] text-slate-500">Lampirkan faktur, kartu garansi, atau sertifikat aset</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadDocModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="p-5 space-y-4 text-xs">
              {/* File Dropzone */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                  Pilih Berkas Dokumen <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => document.getElementById('asset-doc-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    uploadFile
                      ? 'border-blue-400 bg-blue-50/20'
                      : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  <input
                    id="asset-doc-input"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploadFile(f);
                        if (!uploadDocName) {
                          setUploadDocName(f.name);
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Upload size={18} />
                  </div>
                  {uploadFile ? (
                    <div>
                      <p className="font-bold text-slate-800 text-xs truncate max-w-xs mx-auto">{uploadFile.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {(uploadFile.size / 1024).toFixed(1)} KB &bull; Berkas terpilih
                      </p>
                      <span className="inline-block mt-1.5 text-[11px] font-semibold text-blue-600 hover:underline">
                        Klik untuk mengganti berkas
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-slate-700 text-xs">Klik untuk memilih berkas dokumen</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mendukung format PDF, Word (.docx), Excel (.xlsx), atau Gambar (JPG, PNG)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                  Nama / Judul Dokumen
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Faktur_Pembelian_2026.pdf"
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-medium"
                />
              </div>

              {/* Document Category */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                  Kategori Dokumen
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as AssetDocument['category'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white font-medium"
                >
                  <option value="Invoice">Faktur / Invoice Pembelian</option>
                  <option value="Garansi">Kartu Garansi Resmi & Sertifikat</option>
                  <option value="Manual Book">Buku Manual / Panduan Penggunaan</option>
                  <option value="BAST">Surat Jalan / Berita Acara (BAST)</option>
                  <option value="Foto Fisik">Foto Fisik & Riwayat Kondisi</option>
                  <option value="Lainnya">Dokumen Kelengkapan Lainnya</option>
                </select>
              </div>

              {/* Document Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[11px]">
                  Catatan / Keterangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Garansi resmi berlaku hingga Desember 2028 oleh PT Mitra Perkasa"
                  value={uploadDocNotes}
                  onChange={(e) => setUploadDocNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadDocModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <span>Mengunggah...</span>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Simpan Dokumen</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pratinjau Dokumen */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate max-w-sm">{previewDoc.name}</h3>
                  <p className="text-[10px] text-slate-500">
                    Kategori: {previewDoc.category} &bull; Ukuran: {previewDoc.fileSize || '-'} &bull; Diunggah: {previewDoc.uploadDate || '-'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {previewDoc.fileData && (previewDoc.fileType?.includes('png') || previewDoc.fileType?.includes('jpg') || previewDoc.fileType?.includes('jpeg')) ? (
                <div className="text-center">
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.name}
                    className="max-h-[60vh] max-w-full rounded-xl mx-auto object-contain border border-slate-200 shadow-xs"
                  />
                </div>
              ) : previewDoc.fileData && previewDoc.fileType?.includes('pdf') ? (
                <div className="w-full h-96 border border-slate-200 rounded-xl overflow-hidden">
                  <iframe
                    src={previewDoc.fileData}
                    title={previewDoc.name}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700">
                    {`================================================================================
                    SIM ASET TERPADU ENTERPRISE
             DOKUMEN KELENGKAPAN ASET RESMI PERUSAHAAN
================================================================================

Nama Dokumen       : ${previewDoc.name}
Kategori Dokumen   : ${previewDoc.category || 'Dokumen Inventaris'}
Tanggal Dokumen    : ${previewDoc.uploadDate || '-'}
Ukuran File        : ${previewDoc.fileSize || '-'}
Catatan            : ${previewDoc.notes || 'Arsip kelengkapan inventaris resmi internal.'}

--------------------------------------------------------------------------------
                         INFORMASI DETAIL ASET TERKAIT
--------------------------------------------------------------------------------
Kode Tag Aset      : ${asset.assetTag}
Nama Barang        : ${asset.name}
Kategori Aset      : ${asset.category}
Lokasi Fisik       : ${asset.location}
Penanggung Jawab   : ${asset.assignedTo || '-'}
Merk / Model       : ${asset.brand || '-'} / ${asset.model || '-'}
Nomor Seri         : ${asset.serialNumber || '-'}
Nilai Pengadaan    : Rp ${(asset.purchasePrice || 0).toLocaleString('id-ID')}
Tanggal Beli       : ${asset.purchaseDate || '-'}
Status Operasional : ${asset.status} (${asset.condition})

Dokumen arsip digital resmi tersimpan dalam sistem SIMA.`}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Dokumen resmi terverifikasi SIMA
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(previewDoc)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Unduh Dokumen Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function DetailAsetClient() {
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
