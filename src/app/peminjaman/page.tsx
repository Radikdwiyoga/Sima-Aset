'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ArrowLeftRight,
  Plus,
  Printer,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  Paperclip,
  Check,
  ChevronDown
} from 'lucide-react';
import { AssetLoan, DataService, getStoredHistories } from '@/lib/dataService';
import { CreateLoanModal } from '@/components/CreateLoanModal';
import { LoanDocumentModal } from '@/components/LoanDocumentModal';

export default function PeminjamanPage() {
  const [loans, setLoans] = useState<AssetLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Peminjaman Aktif' | 'Semua Log Riwayat'>('Peminjaman Aktif');
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLoanForDoc, setSelectedLoanForDoc] = useState<AssetLoan | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchLoans = () => {
    setLoading(true);
    try {
      const data = DataService.getLoans();
      setLoans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturnAsset = (loanId: string) => {
    if (!confirm('Tandai aset ini sebagai sudah dikembalikan?')) return;
    try {
      DataService.returnLoan(loanId);
      fetchLoans();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportLoansExcel = () => {
    setShowExportMenu(false);
    if (loans.length === 0) return;

    const headers = [
      'No Peminjaman',
      'Kode Aset',
      'Nama Aset',
      'Nama Peminjam',
      'Departemen',
      'Tanggal Pinjam',
      'Estimasi Kembali',
      'Dokumen Lampiran',
      'Status Peminjaman',
      'Keperluan'
    ];

    const rows = loans.map(l => [
      `"${l.loanNumber}"`,
      `"${l.assetTag}"`,
      `"${l.assetName}"`,
      `"${l.borrowerName}"`,
      `"${l.borrowerDept}"`,
      `"${l.borrowDate}"`,
      `"${l.expectedReturnDate}"`,
      `"${l.documentName || '-'}"`,
      `"${l.status}"`,
      `"${l.purpose.replace(/"/g, '""')}"`
    ].join(';'));

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Peminjaman_Aset_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLoansPDF = () => {
    setShowExportMenu(false);
    if (loans.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = loans.map((l, idx) => `
      <tr>
        <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold; color: #1e40af;">${l.loanNumber}</td>
        <td style="font-weight: bold;">${l.assetName} <br><small style="color: #64748b; font-family: monospace;">${l.assetTag}</small></td>
        <td><strong>${l.borrowerName}</strong><br><small style="color: #64748b;">${l.borrowerDept}</small></td>
        <td>${l.borrowDate}</td>
        <td style="color: #b45309; font-weight: bold;">${l.expectedReturnDate}</td>
        <td style="font-family: monospace; font-size: 10px;">${l.documentName || '-'}</td>
        <td style="text-align: center;">
          <span style="padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; ${
            l.status === 'Sedang Dipinjam'
              ? 'background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
              : 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;'
          }">
            ${l.status}
          </span>
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekap Peminjaman Aset Perusahaan - SIM ASET</title>
          <style>
            @page { size: A4 landscape; margin: 15mm; }
            body { font-family: sans-serif; font-size: 11px; padding: 20px; color: #0f172a; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; }
            .logo { font-size: 18px; font-weight: 900; color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 9px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
            td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 10.5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">SIM ASET TERPADU ENTERPRISE</div>
              <div>Laporan Rekapitulasi Peminjaman Aset & Fasilitas</div>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">No</th>
                <th>No Peminjaman</th>
                <th>Aset & Kode Tag</th>
                <th>Peminjam & Divisi</th>
                <th>Tgl Pinjam</th>
                <th>Rencana Kembali</th>
                <th>Lampiran Surat</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 300); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const activeLoanCount = loans.filter(l => l.status === 'Sedang Dipinjam').length;
  const returnedLoanCount = loans.filter(l => l.status === 'Sudah Dikembalikan').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-7 w-full">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 w-full">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Peminjaman Barang & Log Aktivitas
              </h1>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                BAST Digital
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola permohonan pinjam aset, unggah dokumen surat tugas, dan cetak Berita Acara resmi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Unduh Rekap</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 text-xs font-semibold">
                  <button
                    onClick={handleExportLoansExcel}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Download Excel (.csv)</span>
                  </button>
                  <button
                    onClick={handleExportLoansPDF}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Cetak / Download PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Create Loan Button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajukan Peminjaman</span>
            </button>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</span>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{loans.length}</h3>
              <span className="text-xs text-slate-500 mt-0.5 block">Permohonan terdata</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sedang Dipinjam</span>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{activeLoanCount}</h3>
              <span className="text-xs text-slate-500 mt-0.5 block">Aset di luar kantor</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selesai Dikembalikan</span>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{returnedLoanCount}</h3>
              <span className="text-xs text-slate-500 mt-0.5 block">Kondisi aman terverifikasi</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-3 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('Peminjaman Aktif')}
            className={`py-3 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'Peminjaman Aktif'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Peminjaman & Dokumen BAST ({loans.length})
          </button>
          <button
            onClick={() => setActiveTab('Semua Log Riwayat')}
            className={`py-3 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'Semua Log Riwayat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua Log Riwayat Aktivitas Sistem
          </button>
        </div>

        {/* Tab 1: Peminjaman Aktif & Dokumen */}
        {activeTab === 'Peminjaman Aktif' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-xs tracking-wider border-b border-slate-200/80 font-bold">
                  <tr>
                    <th className="py-4 px-5">No. Peminjaman</th>
                    <th className="py-4 px-5">Aset yang Dipinjam</th>
                    <th className="py-4 px-5">Peminjam & Divisi</th>
                    <th className="py-4 px-5">Jadwal Pinjam</th>
                    <th className="py-4 px-5">Dokumen Tugas</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-center w-48">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Memuat data peminjaman...
                      </td>
                    </tr>
                  ) : loans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Belum ada data peminjaman aset. Klik tombol &ldquo;+ Ajukan Peminjaman&rdquo; untuk membuat data baru.
                      </td>
                    </tr>
                  ) : (
                    loans.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-blue-600 text-xs">
                          {item.loanNumber}
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-900 block">{item.assetName}</span>
                          <span className="text-xs text-slate-400 font-mono">{item.assetTag}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-800 block text-xs">{item.borrowerName}</span>
                          <span className="text-xs text-slate-500">{item.borrowerDept}</span>
                        </td>
                        <td className="py-4 px-5 text-xs">
                          <span className="text-slate-600 block">Pinjam: {item.borrowDate}</span>
                          <span className="font-bold text-amber-700 block mt-0.5">Kembali: {item.expectedReturnDate}</span>
                        </td>
                        <td className="py-4 px-5">
                          {item.documentName ? (
                            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 font-medium">
                              <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate max-w-[130px]" title={item.documentName}>
                                {item.documentName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                            item.status === 'Sedang Dipinjam'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Sedang Dipinjam' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Print Document Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedLoanForDoc(item)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Cetak Berita Acara Peminjaman (BAST)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak BAST</span>
                            </button>

                            {/* Mark Returned Button */}
                            {item.status === 'Sedang Dipinjam' && (
                              <button
                                type="button"
                                onClick={() => handleReturnAsset(item.id)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Tandai Sudah Dikembalikan"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Kembalikan</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Semua Log Riwayat Aktivitas Sistem */}
        {activeTab === 'Semua Log Riwayat' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-xs tracking-wider border-b border-slate-200/80 font-bold">
                  <tr>
                    <th className="py-4 px-5">Waktu / Tanggal</th>
                    <th className="py-4 px-5">Jenis Aktivitas</th>
                    <th className="py-4 px-5">Aset Terkait</th>
                    <th className="py-4 px-5">Keterangan Catatan</th>
                    <th className="py-4 px-5">Pelaksana / User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(() => {
                    const histories = getStoredHistories();
                    if (histories.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            Belum ada log aktivitas.
                          </td>
                        </tr>
                      );
                    }
                    const badgeColor = (t: string) =>
                      t === 'Peminjaman' ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : t === 'Perawatan' || t === 'Perbaikan' ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : t === 'Pindah Lokasi' ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';
                    return histories.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-5 font-mono text-xs">{h.date}</td>
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor(h.activityType)}`}>
                            {h.activityType}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-semibold text-slate-900 block">{h.assetName}</span>
                          <span className="text-xs text-slate-400 font-mono">{h.assetTag}</span>
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-600">{h.description}</td>
                        <td className="py-4 px-5 font-bold text-slate-800 text-xs">{h.user}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Create Loan Modal */}
      <CreateLoanModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchLoans}
      />

      {/* Official Printable BAST Loan Document Modal */}
      <LoanDocumentModal
        isOpen={!!selectedLoanForDoc}
        loan={selectedLoanForDoc}
        onClose={() => setSelectedLoanForDoc(null)}
      />
    </DashboardLayout>
  );
}
