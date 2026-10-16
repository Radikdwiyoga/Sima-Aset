'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Camera, 
  CameraOff, 
  Search, 
  User, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Wrench,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { Asset } from '@/types';
import { Html5Qrcode } from 'html5-qrcode';

interface DashboardQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardQRScannerModal({ isOpen, onClose }: DashboardQRScannerModalProps) {
  const [assetTagInput, setAssetTagInput] = useState('');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Quick preset sample tags for testing without needing a physical barcode printout
  const quickTags = [
    { tag: 'AST-IT-0001', name: 'Laptop Dell Latitude 5520' },
    { tag: 'AST-KD-0001', name: 'Toyota Avanza 1.3 G' },
    { tag: 'AST-EL-0001', name: 'Proyektor Epson EB-X500' },
    { tag: 'AST-FN-0001', name: 'Kursi Kerja Ergonomis' }
  ];

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore cleanup error
      }
      html5QrCodeRef.current = null;
    }
  };

  const startScanner = async (mode: 'environment' | 'user') => {
    await stopScanner();
    setError('');

    try {
      const qrCode = new Html5Qrcode('dashboard-qr-reader');
      html5QrCodeRef.current = qrCode;

      await qrCode.start(
        { facingMode: mode },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          setAssetTagInput(decodedText);
          handleLookup(decodedText);
          stopScanner();
          setIsCameraActive(false);
        },
        () => {
          // ignore scan frames
        }
      );
    } catch (err) {
      console.error('Camera start error:', err);
      setError('Kamera tidak dapat diakses atau browser memblokir izin video.');
      setIsCameraActive(false);
    }
  };

  const handleToggleCamera = async () => {
    if (isCameraActive) {
      await stopScanner();
      setIsCameraActive(false);
    } else {
      setIsCameraActive(true);
      setTimeout(() => {
        startScanner(facingMode);
      }, 100);
    }
  };

  const handleFlipCamera = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      await startScanner(nextMode);
    }
  };

  const handleLookup = async (tag: string) => {
    if (!tag.trim()) return;
    setLoading(true);
    setError('');
    setScannedAsset(null);

    try {
      const res = await fetch(`/api/assets/${encodeURIComponent(tag.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setScannedAsset(json.data);
      } else {
        // Try searching in list by tag
        const listRes = await fetch(`/api/assets?search=${encodeURIComponent(tag.trim())}`);
        const listJson = await listRes.json();
        if (listJson.success && listJson.data && listJson.data.length > 0) {
          setScannedAsset(listJson.data[0]);
        } else {
          setError(`Aset dengan kode tag "${tag}" tidak ditemukan.`);
        }
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    await stopScanner();
    setIsCameraActive(false);
    setScannedAsset(null);
    setAssetTagInput('');
    setError('');
    onClose();
  };

  const handleReset = () => {
    setScannedAsset(null);
    setAssetTagInput('');
    setError('');
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Scan QR Code Aset</h3>
              <p className="text-xs text-slate-500">Cek instan pemegang dan status aset kantor</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Result Card If Scanned */}
          {scannedAsset ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="p-5 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 rounded-2xl border border-blue-100 shadow-xs">
                
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={scannedAsset.image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80"}
                      alt={scannedAsset.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-bold text-blue-600 text-xs tracking-wider block">
                      {scannedAsset.assetTag}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 truncate mt-0.5">
                      {scannedAsset.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {scannedAsset.category} &bull; {scannedAsset.brand || '-'} {scannedAsset.model || ''}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        scannedAsset.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : scannedAsset.status === 'Dalam Perbaikan'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          scannedAsset.status === 'Aktif' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                        {scannedAsset.status}
                      </span>

                      <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        Kondisi: {scannedAsset.condition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prominent "Dipegang Oleh Siapa" Card */}
                <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200/80 shadow-xs flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Saat Ini Dipegang / Ditugaskan Kepada:
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {scannedAsset.assignedTo || 'Belum Ditugaskan (Berada di Gudang)'}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{scannedAsset.location}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Specification Summary */}
                {scannedAsset.specification && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-0.5">Spesifikasi:</span>
                    <span>{scannedAsset.specification}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Scanned Asset */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Scan Aset Lainnya
                </button>
                <Link
                  href={`/aset/${scannedAsset.id}`}
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <span>Buka Detail Lengkap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Camera Scanner Container with Camera Flip Control */}
              {isCameraActive ? (
                <div className="space-y-3">
                  {/* Flip Camera & Facing Mode Indicator Bar */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{facingMode === 'environment' ? 'Kamera Belakang (Utama)' : 'Kamera Depan (Selfie)'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Putar Balik Kamera</span>
                    </button>
                  </div>

                  <div id="dashboard-qr-reader" className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-black min-h-[260px]"></div>

                  <button
                    onClick={handleToggleCamera}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Matikan Kamera</span>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={handleToggleCamera}
                  className="p-8 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-3.5">
                    Aktifkan Kamera untuk Scan QR
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Mendukung kamera belakang & depan pada smartphone / tablet
                  </p>
                </div>
              )}

              {/* Manual Input Search */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Atau Cari Berdasarkan Kode Tag Aset:
                </span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLookup(assetTagInput);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Contoh: AST-IT-0001"
                      value={assetTagInput}
                      onChange={(e) => setAssetTagInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !assetTagInput.trim()}
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Mencari...' : 'Periksa'}
                  </button>
                </form>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quick Sample Tags for Instant Testing */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Klik Cepat Kode Sampel (Demo Tanpa Kamera):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {quickTags.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => {
                        setAssetTagInput(t.tag);
                        handleLookup(t.tag);
                      }}
                      className="p-2.5 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all cursor-pointer group"
                    >
                      <span className="font-mono font-bold text-blue-600 text-xs block group-hover:underline">
                        {t.tag}
                      </span>
                      <span className="text-[11px] text-slate-600 truncate block mt-0.5">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
