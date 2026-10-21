'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X, Printer, Boxes, CheckSquare, Square, Search, Filter } from 'lucide-react';
import { Asset } from '@/types';
import QRCode from 'qrcode';

interface MultiLabelPrintModalProps {
  assets: Asset[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function MultiLabelPrintModal({ assets, isOpen, onClose, title = 'Cetak Multi Label QR Code' }: MultiLabelPrintModalProps) {
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize selected IDs with all assets when modal opens or assets change
  useEffect(() => {
    if (isOpen && assets.length > 0) {
      setSelectedIds(new Set(assets.map((a) => a.id)));
    }
  }, [isOpen, assets]);

  // Generate QR code for every asset
  useEffect(() => {
    if (!isOpen || assets.length === 0) return;
    setLoading(true);
    const promises = assets.map((a) =>
      QRCode.toDataURL(a.assetTag || a.id || 'ASET', { width: 250, margin: 1 })
        .then((url) => ({ id: a.id, url }))
        .catch(() => ({ id: a.id, url: '' }))
    );

    Promise.all(promises)
      .then((results) => {
        const map: Record<string, string> = {};
        results.forEach(({ id, url }) => {
          if (url) map[id] = url;
        });
        setQrUrls(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, assets]);

  // Filtered assets for screen preview
  const displayAssets = useMemo(() => {
    if (!searchTerm.trim()) return assets;
    const term = searchTerm.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        (a.assetTag && a.assetTag.toLowerCase().includes(term)) ||
        (a.locationName && a.locationName.toLowerCase().includes(term))
    );
  }, [assets, searchTerm]);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.size === assets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(assets.map((a) => a.id)));
    }
  };

  const toggleSelectAsset = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handlePrint = () => {
    const listToPrint = assets.filter((a) => selectedIds.has(a.id));
    if (listToPrint.length === 0) return;

    // Use a dedicated invisible iframe for isolated, clean multi-page print without layout clipping
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title} - SIM ASET</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            body {
              background: #fff;
              color: #0f172a;
              padding: 4mm 2mm;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
            }
            .label-card {
              border: 1.5px solid #0f172a;
              border-radius: 8px;
              padding: 8px 10px;
              background: #fff;
              page-break-inside: avoid;
              break-inside: avoid;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              min-height: 112px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1.5px solid #0f172a;
              padding-bottom: 4px;
              margin-bottom: 6px;
            }
            .brand {
              font-size: 9px;
              font-weight: 900;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: #0f172a;
            }
            .tag {
              font-size: 8.5px;
              font-family: monospace;
              font-weight: 700;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 1px 4px;
              border-radius: 4px;
            }
            .body {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .qr-img {
              width: 64px;
              height: 64px;
              object-fit: contain;
              flex-shrink: 0;
            }
            .meta {
              flex: 1;
              min-width: 0;
            }
            .name {
              font-size: 10px;
              font-weight: 700;
              line-height: 1.25;
              color: #0f172a;
              margin-bottom: 3px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .loc {
              font-size: 8.5px;
              color: #475569;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-bottom: 2px;
            }
            .date {
              font-size: 8px;
              color: #64748b;
            }
            .footer {
              margin-top: 6px;
              padding-top: 4px;
              border-top: 1px dashed #cbd5e1;
              text-align: center;
              font-size: 6.5px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${listToPrint
              .map(
                (asset) => `
              <div class="label-card">
                <div>
                  <div class="header">
                    <span class="brand">SIM ASET TERPADU</span>
                    <span class="tag">${asset.assetTag || asset.id}</span>
                  </div>
                  <div class="body">
                    ${
                      qrUrls[asset.id]
                        ? `<img class="qr-img" src="${qrUrls[asset.id]}" alt="${asset.assetTag}" />`
                        : `<div style="width:64px;height:64px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:8px;">QR</div>`
                    }
                    <div class="meta">
                      <div class="name">${asset.name}</div>
                      <div class="loc">📍 ${asset.locationName || 'Lokasi Kantor'}</div>
                      <div class="date">📅 ${asset.purchaseDate || '-'}</div>
                    </div>
                  </div>
                </div>
                <div class="footer">Dilarang memindahkan tanpa izin GA/IT</div>
              </div>
            `
              )
              .join('')}
          </div>
        </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch {
          // ignore
        }
      }, 3000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Siap mencetak <span className="font-bold text-blue-600">{selectedIds.size}</span> dari{' '}
              <span className="font-bold text-slate-700">{assets.length}</span> aset di halaman ini (Format Stiker A4, 3 kolom)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Select All + Search */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {selectedIds.size === assets.length ? (
                <>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>Batalkan Semua</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  <span>Pilih Semua ({assets.length})</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-400">|</span>

            <span className="text-xs font-medium text-slate-600">
              {selectedIds.size} label terpilih
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aset dalam list..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content: Grid of Preview Label Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-slate-600">Men-generate QR Code untuk semua aset...</span>
            </div>
          ) : displayAssets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada aset yang cocok dengan pencarian &quot;{searchTerm}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayAssets.map((asset) => {
                const isChecked = selectedIds.has(asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggleSelectAsset(asset.id)}
                    className={`relative border-2 rounded-xl p-3 bg-white text-slate-900 text-left transition-all cursor-pointer shadow-xs ${
                      isChecked
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/10'
                        : 'border-slate-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
                          <Boxes className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-900">SIM ASET</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">
                          {asset.assetTag || asset.id}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div onClick
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-0.5 flex items-center justify-center">
                        {qrUrls[asset.id] ? (
                          <img
                            src={qrUrls[asset.id]}
                            alt={asset.assetTag}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      <div className="text-left space-y-0.5 min-w-0 flex-1">
                        <p className="font-bold text-[11px] leading-tight line-clamp-2 text-slate-900">
                          {asset.name}
                        </p>
                        <p className="text-[9px] text-slate-500 truncate">
                          📍 {asset.locationName || 'Kantor Pusat'}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          📅 {asset.purchaseDate || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-dashed border-slate-200 text-center">
                      <p className="text-[7px] text-slate-400 uppercase tracking-wider font-semibold">
                        Dilarang memindahkan tanpa izin GA/IT
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Ukuran A4 Stiker · 3 Kolom per Baris · Auto Page Break
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || selectedIds.size === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak {selectedIds.size} Label QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
