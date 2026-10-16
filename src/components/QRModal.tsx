'use client';

import React, { useEffect, useState } from 'react';
import { X, Printer, Download, Boxes } from 'lucide-react';
import { Asset } from '@/types';
import QRCode from 'qrcode';

interface QRModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QRModal({ asset, isOpen, onClose }: QRModalProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset && isOpen) {
      setLoading(true);
      QRCode.toDataURL(asset.assetTag, { width: 300, margin: 2 })
        .then((url) => {
          setQrUrl(url);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR-${asset.assetTag}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between no-print">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Label Inventaris & QR Code</h3>
            <p className="text-xs text-slate-500">Stiker identifikasi fisik aset</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Label Card */}
        <div className="p-6 flex flex-col items-center">
          <div className="printable-area w-full max-w-sm bg-white border-2 border-slate-900 rounded-xl p-4 shadow-sm text-slate-900">
            {/* Header of the label */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-tight leading-none">SIM ASET TERPADU</h4>
                  <span className="text-[8px] font-semibold tracking-wider text-slate-600 uppercase">Aset Milik Perusahaan</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                {asset.assetTag}
              </span>
            </div>

            {/* Content: QR and Meta */}
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : qrUrl ? (
                  <img src={qrUrl} alt={asset.assetTag} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">Loading...</span>
                )}
              </div>

              <div className="text-left space-y-1 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Nama Barang</span>
                  <p className="font-bold text-slate-900 text-xs leading-tight line-clamp-2">{asset.name}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Lokasi</span>
                  <p className="font-medium text-slate-700 text-[11px]">{asset.locationName}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Pengadaan</span>
                  <p className="text-[11px] text-slate-600">{asset.purchaseDate || '2024'}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-center">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold">
                Dilarang memindahkan atau merusak label tanpa izin GA/IT
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 no-print">
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Label (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
