'use client';

import React, { useEffect, useState } from 'react';
import { X, Printer, Boxes, CheckSquare } from 'lucide-react';
import { Asset } from '@/types';
import QRCode from 'qrcode';

interface MultiLabelPrintModalProps {
  assets: Asset[];
  isOpen: boolean;
  onClose: () => void;
}

export function MultiLabelPrintModal({ assets, isOpen, onClose }: MultiLabelPrintModalProps) {
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || assets.length === 0) return;
    setLoading(true);
    const promises = assets.map((a) =>
      QRCode.toDataURL(a.assetTag, { width: 200, margin: 1 }).then((url) => ({ id: a.id, url }))
    );
    Promise.all(promises)
      .then((results) => {
        const map: Record<string, string> = {};
        results.forEach(({ id, url }) => { map[id] = url; });
        setQrUrls(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, assets]);

  if (!isOpen) return null;

  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #multi-label-print-area { display: block !important; }
          @page { size: A4; margin: 10mm; }
        }
        @media screen {
          #multi-label-print-area { display: none; }
        }
      `}</style>

      {/* Screen modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                Cetak Multi Label QR Code
              </h3>
              <p className="text-xs text-slate-500">{assets.length} aset dipilih untuk dicetak</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-slate-500">Membuat QR Code...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="border-2 border-slate-800 rounded-xl p-3 bg-white text-slate-900 text-left">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
                          <Boxes className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-[9px] font-black uppercase">SIM ASET</span>
                      </div>
                      <span className="text-[8px] font-mono font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-300 truncate max-w-[60px]">
                        {asset.assetTag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                        {qrUrls[asset.id] ? (
                          <img src={qrUrls[asset.id]} alt={asset.assetTag} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="text-left space-y-0.5 min-w-0">
                        <p className="font-bold text-[10px] leading-tight line-clamp-2">{asset.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{asset.locationName}</p>
                        <p className="text-[9px] text-slate-400">{asset.purchaseDate}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 text-center">
                      <p className="text-[7px] text-slate-400 uppercase tracking-widest font-semibold">
                        Dilarang memindahkan tanpa izin GA/IT
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5 shrink-0">
            <span className="text-xs text-slate-500">Format A4 · 3 kolom per baris</span>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                Batal
              </button>
              <button
                onClick={handlePrint}
                disabled={loading || assets.length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Semua Label
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden printable area */}
      <div id="multi-label-print-area">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', padding: '8mm' }}>
          {assets.map((asset) => (
            <div key={asset.id} style={{ border: '2px solid #1e293b', borderRadius: '8px', padding: '10px', background: 'white', color: '#0f172a', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #334155', paddingBottom: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>SIM ASET TERPADU</span>
                <span style={{ fontSize: '8px', fontFamily: 'monospace', background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px', border: '1px solid #cbd5e1' }}>{asset.assetTag}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {qrUrls[asset.id] && <img src={qrUrls[asset.id]} alt={asset.assetTag} style={{ width: '64px', height: '64px', objectFit: 'contain' }} />}
                <div>
                  <p style={{ fontWeight: 700, fontSize: '10px', lineHeight: '1.2', marginBottom: '3px' }}>{asset.name}</p>
                  <p style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>{asset.locationName}</p>
                  <p style={{ fontSize: '9px', color: '#94a3b8' }}>{asset.purchaseDate}</p>
                </div>
              </div>
              <div style={{ marginTop: '6px', paddingTop: '5px', borderTop: '1px dashed #cbd5e1', textAlign: 'center' }}>
                <p style={{ fontSize: '7px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dilarang memindahkan tanpa izin GA/IT</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
