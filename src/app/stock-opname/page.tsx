'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Search, 
  FileCheck2,
  RefreshCw,
  CameraOff
} from 'lucide-react';
import { Asset, AssetCondition, AssetStatus } from '@/types';
import { Html5Qrcode } from 'html5-qrcode';
import { DataService } from '@/lib/dataService';

export default function StockOpnamePage() {
  const [assetTagInput, setAssetTagInput] = useState('');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [verifiedCondition, setVerifiedCondition] = useState<AssetCondition>('Baik');
  const [verifiedStatus, setVerifiedStatus] = useState<AssetStatus>('Aktif');
  const [auditNotes, setAuditNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({ total: 1595, verified: 42 });
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // ignore cleanup error
      }
      html5QrCodeRef.current = null;
    }
  };

  const startScanner = async (mode: 'environment' | 'user') => {
    await stopScanner();
    try {
      const qrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = qrCode;

      await qrCode.start(
        { facingMode: mode },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setAssetTagInput(decodedText);
          handleLookup(decodedText);
          stopScanner();
          setIsScanning(false);
        },
        () => {}
      );
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const handleToggleScanning = async () => {
    if (isScanning) {
      await stopScanner();
      setIsScanning(false);
    } else {
      setIsScanning(true);
      setTimeout(() => {
        startScanner(facingMode);
      }, 100);
    }
  };

  const handleFlipCamera = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isScanning) {
      await startScanner(nextMode);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleConditionChange = (c: AssetCondition) => {
    setVerifiedCondition(c);
    // Auto-sync status based on condition
    if (c === 'Baik') {
      setVerifiedStatus('Aktif');
    } else if (c === 'Perbaikan') {
      setVerifiedStatus('Dalam Perbaikan');
    } else if (c === 'Rusak') {
      setVerifiedStatus('Tidak Aktif');
    }
  };

  const handleLookup = async (tag: string) => {
    if (!tag.trim()) return;
    setFeedbackMessage(null);

    try {
      const found = DataService.getAssetById(tag.trim());
      if (found) {
        setScannedAsset(found);
        setVerifiedCondition(found.condition);
        setVerifiedStatus(found.status);
        setAuditNotes('');
      } else {
        const searchList = DataService.getAssets({ search: tag.trim() });
        if (searchList.length > 0) {
          setScannedAsset(searchList[0]);
          setVerifiedCondition(searchList[0].condition);
          setVerifiedStatus(searchList[0].status);
          setAuditNotes('');
        } else {
          setFeedbackMessage({
            type: 'error',
            text: `Aset dengan kode tag "${tag}" tidak ditemukan dalam sistem.`
          });
        }
      }
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Gagal mencari aset.' });
    }
  };

  const handleVerify = async () => {
    if (!scannedAsset) return;

    try {
      DataService.updateAsset(scannedAsset.id, {
        condition: verifiedCondition,
        status: verifiedStatus
      });

      setFeedbackMessage({
        type: 'success',
        text: `Berhasil memverifikasi ${scannedAsset.assetTag} (${scannedAsset.name}): Kondisi menjadi "${verifiedCondition}" & Status berubah menjadi "${verifiedStatus}"!`
      });
      setStats(prev => ({ ...prev, verified: prev.verified + 1 }));
      setScannedAsset(null);
      setAssetTagInput('');
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Gagal memverifikasi aset.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full max-w-5xl">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Audit Fisik & Stock Opname
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pindai label QR Code pada fisik aset untuk memverifikasi lokasi dan kondisi barang secara real-time
          </p>
        </div>

        {/* Progress Summary Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Sesi Audit: Stock Opname Q4 2026
              </h3>
              <p className="text-xs text-slate-500">
                Auditor: Tim General Affairs & IT Specialist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Progres Audit
              </span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {stats.verified} / {stats.total} Item
              </span>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (stats.verified / stats.total) * 100 * 5)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Scanner & Manual Lookup Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Input / QR Scanner Trigger */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Pemindaian Barcode / QR Code
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {isScanning && (
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                      title="Putar Balik Kamera Depan / Belakang"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Putar Kamera ({facingMode === 'environment' ? 'Belakang' : 'Depan'})</span>
                    </button>
                  )}

                  <button
                    onClick={handleToggleScanning}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                      isScanning
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {isScanning ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                    <span>{isScanning ? 'Tutup Kamera' : 'Buka Kamera HP/Webcam'}</span>
                  </button>
                </div>
              </div>

              {isScanning && (
                <div className="mb-4 p-2.5 bg-slate-900 rounded-2xl overflow-hidden text-center text-white">
                  <div id="qr-reader" className="w-full"></div>
                  <p className="text-[11px] text-slate-300 mt-2 font-medium">
                    Arahkan kamera ke QR Code aset ({facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'})
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Arahkan kamera smartphone ke label QR pada fisik barang, atau ketik langsung kode aset (contoh: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-blue-600">OFF3001</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-blue-600">6FF2942</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-blue-600">AF70940</code>):
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={assetTagInput}
                    onChange={(e) => setAssetTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLookup(assetTagInput);
                    }}
                    placeholder="Ketik Kode Aset (OFF3001, dll)..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
                <button
                  onClick={() => handleLookup(assetTagInput)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Cari</span>
                </button>
              </div>

              {/* Sample Quick Barcode Tags for Testing */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                  Klik Cepat Contoh Tag (Simulasi Scan):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['AST-EL-0001', 'AST-IT-0001', 'AST-FN-0001', 'AST-KD-0001', 'AST-IT-0003'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setAssetTagInput(tag);
                        handleLookup(tag);
                      }}
                      className="text-[10px] font-mono font-bold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-2 py-1 rounded border border-slate-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {feedbackMessage && (
              <div
                className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-start gap-2 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}
          </div>

          {/* Right: Asset Verification Form */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Detail & Verifikasi Fisik
                </h3>
              </div>

              {scannedAsset ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 text-sm">{scannedAsset.name}</span>
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {scannedAsset.assetTag}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                      <p className="text-slate-500">Lokasi: <strong className="text-slate-700">{scannedAsset.location}</strong></p>
                      <p className="text-slate-500">PIC: <strong className="text-slate-700">{scannedAsset.assignedTo || 'Belum Ditugaskan'}</strong></p>
                      <p className="text-slate-500">Kondisi Saat Ini: <strong className="text-amber-600">{scannedAsset.condition}</strong></p>
                      <p className="text-slate-500">Status Saat Ini: <strong className="text-blue-600">{scannedAsset.status}</strong></p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      1. Ubah Kondisi Fisik (Hasil Pemeriksaan):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Baik', 'Perbaikan', 'Rusak'] as AssetCondition[]).map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => handleConditionChange(c)}
                          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                            verifiedCondition === c
                              ? c === 'Baik'
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                : c === 'Perbaikan'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-rose-500 text-white border-rose-500 shadow-xs'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      2. Status Operasional (Otomatis / Sesuaikan):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Aktif', 'Dalam Perbaikan', 'Tidak Aktif'] as AssetStatus[]).map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setVerifiedStatus(s)}
                          className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold transition-all ${
                            verifiedStatus === s
                              ? s === 'Aktif'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : s === 'Dalam Perbaikan'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      3. Catatan Audit Lapangan (Opsional):
                    </label>
                    <textarea
                      rows={2}
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      placeholder="Contoh: Fisik lecet halus, kabel masih lengkap dan berfungsi normal..."
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    onClick={handleVerify}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi & Simpan Audit</span>
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <QrCode className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                  <p className="text-xs">Silakan scan QR Code atau pilih salah satu kode aset di sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
