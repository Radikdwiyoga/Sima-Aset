'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Table, 
  ArrowRight,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Asset, AssetCondition, AssetStatus } from '@/types';
import { DataService } from '@/lib/dataService';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export function ImportExcelModal({ isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Partial<Asset>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const normalizeCategory = (cat: string): { name: string; slug: string } => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('it') || lower.includes('komputer') || lower.includes('laptop')) {
      return { name: 'Perangkat IT', slug: 'it' };
    }
    if (lower.includes('elektronik') || lower.includes('ac') || lower.includes('proyektor')) {
      return { name: 'Elektronik', slug: 'elektronik' };
    }
    if (lower.includes('furnitur') || lower.includes('furniture') || lower.includes('meja') || lower.includes('kursi')) {
      return { name: 'Furniture', slug: 'furniture' };
    }
    if (lower.includes('rumah') || lower.includes('tangga') || lower.includes('kebersihan')) {
      return { name: 'Rumah Tangga', slug: 'rumah-tangga' };
    }
    if (lower.includes('kendaraan') || lower.includes('mobil') || lower.includes('motor')) {
      return { name: 'Kendaraan', slug: 'kendaraan' };
    }
    return { name: cat || 'Perangkat IT', slug: 'it' };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');
    setFile(selectedFile);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          setError('File Excel/CSV kosong atau format tidak terbaca.');
          setLoading(false);
          return;
        }

        // Detect columns from first row
        const detectedCols = Object.keys(rawJson[0]);

        // Map columns to Asset model
        const mappedAssets: Partial<Asset>[] = rawJson.map((row, idx) => {
          // Flexible key lookup helper
          const getVal = (...keys: string[]) => {
            for (const k of keys) {
              for (const col of detectedCols) {
                if (col.trim().toLowerCase() === k.toLowerCase()) {
                  return String(row[col] ?? '').trim();
                }
              }
            }
            return '';
          };

          const rawCategory = getVal('kategori', 'category', 'jenis');
          const catInfo = normalizeCategory(rawCategory);
          const rawCondition = getVal('kondisi', 'condition', 'kondisi barang');
          const condition: AssetCondition = 
            rawCondition.toLowerCase().includes('rusak') ? 'Rusak' :
            rawCondition.toLowerCase().includes('baik') ? 'Baik' :
            rawCondition.toLowerCase().includes('perbaikan') ? 'Perbaikan' : 'Baik';

          const rawStatus = getVal('status', 'status aset');
          const status: AssetStatus = 
            rawStatus.toLowerCase().includes('perbaikan') ? 'Dalam Perbaikan' :
            rawStatus.toLowerCase().includes('tidak') || rawStatus.toLowerCase().includes('nonaktif') ? 'Tidak Aktif' : 'Aktif';

          const rawPrice = getVal('harga', 'harga perolehan', 'nilai', 'purchaseprice', 'biaya');
          const purchasePrice = Number(rawPrice.replace(/[^0-9]/g, '')) || 0;

          return {
            assetTag: getVal('kode tag', 'kode aset', 'tag', 'assettag', 'no tag') || `MIG-${Date.now().toString().slice(-4)}-${idx + 1}`,
            name: getVal('nama aset', 'nama', 'name', 'nama barang') || `Aset Impor ${idx + 1}`,
            category: catInfo.name,
            categorySlug: catInfo.slug,
            location: getVal('lokasi', 'location', 'ruangan', 'tempat') || 'Kantor Pusat',
            brand: getVal('merk', 'brand', 'merk/brand'),
            model: getVal('model', 'tipe', 'model/tipe'),
            serialNumber: getVal('nomor seri', 'serial number', 'serialnumber', 'no seri'),
            assignedTo: getVal('penanggung jawab', 'assignedto', 'pic', 'pemegang', 'user'),
            specification: getVal('spesifikasi', 'specification', 'spek'),
            notes: getVal('catatan', 'notes', 'keterangan') || 'Migrasi Data Excel',
            purchasePrice,
            condition,
            status,
            purchaseDate: getVal('tanggal pengadaan', 'purchasedate', 'tanggal beli') || new Date().toISOString().split('T')[0],
          };
        });

        setParsedData(mappedAssets);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Format tidak didukung';
        setError('Gagal membaca file Excel/CSV: ' + errorMsg);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Kode Aset': 'AST-IT-0101',
        'Nama Aset': 'MacBook Pro M3 14 Inch',
        'Kategori': 'Perangkat IT',
        'Lokasi': 'Kantor Pusat - Divisi IT',
        'Merk': 'Apple',
        'Model': 'MacBook Pro M3',
        'Nomor Seri': 'C02G12345678',
        'Kondisi': 'Baik',
        'Status': 'Aktif',
        'Harga Perolehan': 28500000,
        'Penanggung Jawab': 'Budi Santoso',
        'Spesifikasi': 'M3 8-Core CPU, 10-Core GPU, 16GB RAM, 512GB SSD',
        'Catatan': 'Laptop tim engineering'
      },
      {
        'Kode Aset': 'AST-EL-0102',
        'Nama Aset': 'Smart TV LG 55 Inch 4K',
        'Kategori': 'Elektronik',
        'Lokasi': 'Ruang Rapat Utama',
        'Merk': 'LG',
        'Model': '55UR7500PSC',
        'Nomor Seri': 'LG55981204',
        'Kondisi': 'Baik',
        'Status': 'Aktif',
        'Harga Perolehan': 7800000,
        'Penanggung Jawab': 'General Affairs',
        'Spesifikasi': 'Ultra HD 4K, HDR10, WebOS Smart TV',
        'Catatan': 'Display rapat presentasi'
      },
      {
        'Kode Aset': 'AST-FN-0103',
        'Nama Aset': 'Kursi Ergonomis Mesh',
        'Kategori': 'Furniture',
        'Lokasi': 'Cabang A',
        'Merk': 'Stramm',
        'Model': 'ErgoMax 2',
        'Nomor Seri': 'STM-ERG-2026',
        'Kondisi': 'Baik',
        'Status': 'Aktif',
        'Harga Perolehan': 1850000,
        'Penanggung Jawab': 'Siti Rahma',
        'Spesifikasi': 'Lumbar support adjustable, mesh breathable fabric',
        'Catatan': 'Kursi kerja staf'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Migrasi_Aset');
    XLSX.writeFile(wb, 'Template_Migrasi_Data_Aset_SIMA.xlsx');
  };

  const handleExecuteImport = () => {
    if (parsedData.length === 0) return;
    setLoading(true);

    try {
      const created = DataService.batchCreateAssets(parsedData);
      setSuccessCount(created.length);
      setTimeout(() => {
        onSuccess(created.length);
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kesalahan internal';
      setError('Gagal memproses migrasi data: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Import & Migrasi Data dari Excel</h2>
              <p className="text-xs text-slate-500">Impor master aset massal dari file .xlsx, .xls, atau .csv ke dalam SIMA</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* Action Row: Download Template */}
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Gunakan Format Template Resmi</p>
                <p className="text-[11px] text-emerald-800">Unduh template Excel dengan susunan kolom standar (Kode Aset, Nama, Kategori, Lokasi, Harga, Kondisi, dll.)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template .XLSX</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              file 
                ? 'border-blue-400 bg-blue-50/20' 
                : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80 bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>

            {file ? (
              <div>
                <p className="text-xs font-bold text-slate-800">{file.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB &bull; Berhasil dimuat
                </p>
                <span className="inline-block mt-2 text-[11px] font-semibold text-blue-600 hover:underline">
                  Klik untuk mengganti file
                </span>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-800">Klik untuk upload file Excel atau drag & drop file ke sini</p>
                <p className="text-[11px] text-slate-500 mt-1">Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV (.csv)</p>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Migrasi Berhasil!</p>
                <p className="text-[11px] text-emerald-800">Sebanyak {successCount} data aset berhasil diimpor ke sistem SIMA.</p>
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-blue-600" />
                  Preview Data Siap Migrasi ({parsedData.length} baris terdeteksi):
                </span>
                <span className="text-[11px] text-slate-400">Menampilkan 5 baris pertama</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Kode Tag</th>
                      <th className="py-2 px-3">Nama Aset</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3">Lokasi</th>
                      <th className="py-2 px-3">Kondisi</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Harga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {parsedData.slice(0, 5).map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-600">{item.assetTag}</td>
                        <td className="py-2 px-3 font-semibold">{item.name}</td>
                        <td className="py-2 px-3">{item.category}</td>
                        <td className="py-2 px-3">{item.location}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.condition === 'Baik' ? 'bg-emerald-50 text-emerald-700' :
                            item.condition === 'Perbaikan' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {item.condition}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Aktif' ? 'bg-blue-50 text-blue-700' :
                            item.status === 'Dalam Perbaikan' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium">
                          Rp {(item.purchasePrice || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            disabled={parsedData.length === 0 || loading || successCount !== null}
            onClick={handleExecuteImport}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Migrasi {parsedData.length > 0 ? `${parsedData.length} Aset` : 'Data Sekarang'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

