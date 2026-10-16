'use client';

import React from 'react';
import { X, Printer, FileText, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { AssetLoan } from '@/lib/dataService';

interface LoanDocumentModalProps {
  loan: AssetLoan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LoanDocumentModal({ loan, isOpen, onClose }: LoanDocumentModalProps) {
  if (!isOpen || !loan) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop (hidden when printing) */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:max-w-none print:rounded-none">
        
        {/* Modal Top Bar (hidden when printing) */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Dokumen BAST Peminjaman Aset
              </h3>
              <p className="text-xs text-slate-500">
                Berita acara serah terima peminjaman barang inventaris resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Document Printable Content */}
        <div className="p-8 sm:p-12 space-y-6 text-slate-800 bg-white print:p-0">
          
          {/* Header Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/logo.png" alt="Logo Perusahaan" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  SIM ASET TERPADU ENTERPRISE
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Divisi Manajemen Aset & Logistik Umum &bull; Kantor Pusat
                </p>
                <p className="text-[11px] text-slate-400">
                  Gedung Graha Inventaris Lt. 5, Jl. Jend. Sudirman Kav. 28, Jakarta Selatan
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-blue-700 block bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {loan.loanNumber}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center py-2">
            <h2 className="text-lg font-black text-slate-900 tracking-wider uppercase underline underline-offset-4">
              BERITA ACARA SERAH TERIMA PEMINJAMAN ASET
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Nomor: BAST/PINJAM/{loan.loanNumber.replace(/\//g, '-')}/2026
            </p>
          </div>

          {/* Opening Paragraph */}
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            Pada hari ini, tanggal <strong>{loan.borrowDate}</strong>, telah dilakukan serah terima peminjaman barang inventaris kantor milik perusahaan dengan ketentuan dan rincian sebagai berikut:
          </p>

          {/* Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pihak Pertama (Pemberi Pinjaman):
              </span>
              <p className="font-bold text-slate-900 mt-0.5">Pengelola Aset / Divisi IT & GA</p>
              <p className="text-slate-600">SIM Aset Terpadu Enterprise</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pihak Kedua (Peminjam):
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{loan.borrowerName}</p>
              <p className="text-slate-600">{loan.borrowerDept}</p>
            </div>
          </div>

          {/* Asset Specification Table */}
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Rincian Aset yang Dipinjam:
            </span>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kode Aset</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3">Tgl Pinjam</th>
                  <th className="py-2.5 px-3">Rencana Kembali</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{loan.assetTag}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{loan.assetName}</td>
                  <td className="py-3 px-3">{loan.borrowDate}</td>
                  <td className="py-3 px-3 font-bold text-amber-700">{loan.expectedReturnDate}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-200 text-[10px]">
                      {loan.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Details & Attachment */}
          <div className="space-y-2 text-xs">
            <div className="flex">
              <span className="w-36 text-slate-500 font-semibold">Keperluan Pinjam:</span>
              <span className="flex-1 font-medium text-slate-800">{loan.purpose}</span>
            </div>
            {loan.documentName && (
              <div className="flex items-center">
                <span className="w-36 text-slate-500 font-semibold">Dokumen Lampiran:</span>
                <span className="flex-1 font-mono font-semibold text-blue-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{loan.documentName}</span>
                </span>
              </div>
            )}
            {loan.notes && (
              <div className="flex">
                <span className="w-36 text-slate-500 font-semibold">Catatan Kondisi:</span>
                <span className="flex-1 text-slate-600">{loan.notes}</span>
              </div>
            )}
          </div>

          {/* Legal Terms */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1 leading-relaxed">
            <p className="font-bold text-slate-800">Ketentuan & Tanggung Jawab:</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Peminjam wajib memelihara dan menjaga keutuhan serta fungsi aset sebaik-baiknya.</li>
              <li>Aset tidak diperkenankan untuk dipindahtangankan kepada pihak ketiga tanpa izin tertulis.</li>
              <li>Kerusakan atau kehilangan yang diakibatkan oleh kelalaian sepenuhnya menjadi tanggung jawab peminjam.</li>
              <li>Aset harus dikembalikan tepat waktu sesuai tanggal rencana pengembalian di atas.</li>
            </ol>
          </div>

          {/* Signatures & Verification QR */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end gap-6 text-xs">
            {/* Digital QR Stamp */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center p-1.5 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    `SIMA-BAST-LOAN:${loan.loanNumber}:${loan.assetTag}:${loan.borrowerName}`
                  )}`}
                  alt="QR Verifikasi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified BAST Digital</span>
                </div>
                <span>Pindai untuk memeriksa keabsahan surat</span>
              </div>
            </div>

            {/* Signature Pihak Pertama & Kedua */}
            <div className="flex gap-12 text-center text-xs">
              <div>
                <p className="text-slate-500 text-[11px]">Yang Menyerahkan,</p>
                <p className="font-semibold text-slate-700 mt-0.5">Pengelola Aset</p>
                <div className="h-14"></div>
                <p className="font-bold text-slate-900 border-t border-slate-800 pt-1">
                  Administrator IT / GA
                </p>
              </div>

              <div>
                <p className="text-slate-500 text-[11px]">Yang Menerima,</p>
                <p className="font-semibold text-slate-700 mt-0.5">Peminjam Barang</p>
                <div className="h-14"></div>
                <p className="font-bold text-slate-900 border-t border-slate-800 pt-1">
                  {loan.borrowerName}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

