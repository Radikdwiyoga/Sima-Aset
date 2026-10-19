'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Upload, 
  FileText, 
  AlertCircle
} from 'lucide-react';
import { Asset } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/lib/dataService';

interface CreateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateLoanModal({ isOpen, onClose, onSuccess }: CreateLoanModalProps) {
  const { user } = useAuth();
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [borrowerName, setBorrowerName] = useState(user?.name || 'Staff Karyawan');
  const [borrowerDept, setBorrowerDept] = useState(user?.department || 'Divisi Operasional');
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default 7 days return
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const [expectedReturnDate, setExpectedReturnDate] = useState(nextWeek.toISOString().split('T')[0]);
  
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const data = DataService.getAssets();
      setAvailableAssets(data);
      if (data.length > 0) {
        setSelectedAssetId(data[0].id);
      }

      if (user) {
        setBorrowerName(user.name);
        setBorrowerDept(user.department || 'Operasional');
      }
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeKB = (file.size / 1024).toFixed(1);
      const sizeStr = Number(sizeKB) > 1024 
        ? `${(Number(sizeKB) / 1024).toFixed(1)} MB` 
        : `${sizeKB} KB`;
      setUploadedFile({
        name: file.name,
        size: sizeStr
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) {
      setError('Pilih aset yang ingin dipinjam.');
      return;
    }
    if (!purpose.trim()) {
      setError('Tuliskan keperluan peminjaman.');
      return;
    }

    setLoading(true);
    setError('');

    const targetAsset = availableAssets.find(a => a.id === selectedAssetId);

    try {
      DataService.createLoan({
        assetId: selectedAssetId,
        assetTag: targetAsset?.assetTag || 'AST-000',
        assetName: targetAsset?.name || 'Aset Kantor',
        borrowerName,
        borrowerDept,
        borrowDate,
        expectedReturnDate,
        purpose,
        documentName: uploadedFile ? uploadedFile.name : 'Formulir_Peminjaman_Internal.pdf',
        notes
      });
      onSuccess();
      onClose();
    } catch {
      setError('Terjadi kesalahan saat menyimpan peminjaman.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Formulir Peminjaman Barang</h3>
              <p className="text-xs text-slate-500">Ajukan peminjaman aset kantor beserta upload berkas tugas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-sm">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Asset Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Aset yang Akan Dipinjam <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.assetTag}] {a.name} &bull; Lokasi: {a.location} ({a.status})
                </option>
              ))}
            </select>
          </div>

          {/* Borrower Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Peminjam <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Contoh: Bagas Pratama"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Divisi / Departemen <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={borrowerDept}
                onChange={(e) => setBorrowerDept(e.target.value)}
                placeholder="Contoh: Marketing & Sales"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Borrow Date & Expected Return */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Pinjam <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimasi Tanggal Pengembalian <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Keperluan & Alasan Peminjaman <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Digunakan untuk dinas presentasi program kerja di luar kota selama 3 hari..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Upload Dokumen Peminjaman */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Dokumen Peminjaman (Surat Tugas / Nota Dinas / Form Fisik)
            </label>
            
            <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-4 text-center transition-colors cursor-pointer group">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-slate-700 mt-1">
                  Pilih Berkas atau Tarik ke Sini
                </span>
                <span className="text-[11px] text-slate-400">
                  Mendukung PDF, Word, atau Foto Surat Fisik (Maks. 10MB)
                </span>
              </div>
            </div>

            {uploadedFile && (
              <div className="mt-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate max-w-xs">
                    {uploadedFile.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({uploadedFile.size})
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">
                  Lampiran Siap Dicetak
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan Kondisi Barang Saat Diserahkan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Charger, tas laptop, dan mouse dalam kondisi prima"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memproses Peminjaman...' : 'Simpan & Buat Dokumen'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

