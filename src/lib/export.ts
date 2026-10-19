import { Asset } from '@/types';
import { calculateAssetDepreciation } from './depreciation';

export function exportAssetsToExcel(assets: Asset[], filename = 'laporan-inventaris-aset.csv') {
  if (!assets || assets.length === 0) return;

  const headers = [
    'Kode Aset',
    'Nama Barang',
    'Kategori',
    'Lokasi',
    'Penanggung Jawab / Pemegang',
    'Merek',
    'Nomor Seri',
    'Kondisi',
    'Status',
    'Harga Pengadaan (Rp)',
    'Tanggal Pengadaan',
    'Spesifikasi'
  ];

  const rows = assets.map((a) => {
    let specStr = a.specification || '';
    if (!specStr && a.specificAttributes) {
      specStr = Object.values(a.specificAttributes).filter(Boolean).join(' | ');
    }

    const loc = a.location || a.locationName || '-';
    const pic = a.assignedTo || a.assignedUserName || '-';

    return [
      `"${a.assetTag}"`,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${(a.category || a.categorySlug || '').toUpperCase()}"`,
      `"${loc.replace(/"/g, '""')}"`,
      `"${pic.replace(/"/g, '""')}"`,
      `"${(a.brand || '-').replace(/"/g, '""')}"`,
      `"${(a.serialNumber || '-').replace(/"/g, '""')}"`,
      `"${a.condition}"`,
      `"${a.status}"`,
      a.purchasePrice || 0,
      `"${a.purchaseDate || ''}"`,
      `"${specStr.replace(/"/g, '""')}"`
    ].join(';'); // Semicolon delimiter works seamlessly for Indonesian/European Excel
  });

  // UTF-8 BOM for Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Backwards compatibility
export const exportAssetsToCSV = exportAssetsToExcel;

export function exportAssetsToPDF(assets: Asset[], title = 'Laporan Inventaris Aset Perusahaan') {
  if (!assets || assets.length === 0) return;

  const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tableRows = assets.map((a, idx) => `
    <tr>
      <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
      <td style="font-weight: bold; font-family: monospace; color: #1e40af;">${a.assetTag}</td>
      <td style="font-weight: 600;">${a.name}</td>
      <td>${a.category}</td>
      <td>${a.location || '-'}</td>
      <td style="font-weight: 500;">${a.assignedTo || '-'}</td>
      <td style="text-align: center;">
        <span style="padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; ${
          a.status === 'Aktif' 
            ? 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;' 
            : a.status === 'Dalam Perbaikan'
            ? 'background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
            : 'background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;'
        }">
          ${a.status}
        </span>
      </td>
      <td style="text-align: right; font-weight: bold;">Rp ${(a.purchasePrice || 0).toLocaleString('id-ID')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - SIM ASET</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 11px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .logo { font-size: 20px; font-weight: 900; color: #1e40af; letter-spacing: -0.5px; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
          .meta { text-align: right; font-size: 10px; color: #475569; }
          .summary { display: flex; gap: 20px; margin-bottom: 16px; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px; }
          .summary-item { font-weight: 600; }
          .summary-item span { font-weight: 900; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background-color: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 9px; font-weight: 700; letter-spacing: 0.5px; padding: 8px 10px; border-bottom: 1px solid #cbd5e1; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 10.5px; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; page-break-inside: avoid; }
          .signature-box { text-align: center; width: 180px; }
          .signature-line { margin-top: 50px; border-bottom: 1px solid #0f172a; font-weight: bold; color: #0f172a; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">SIM ASET TERPADU ENTERPRISE</div>
            <div class="subtitle">Sistem Informasi Manajemen & Tata Kelola Aset Perusahaan</div>
          </div>
          <div class="meta">
            <div><strong>Dokumen Laporan Resmi</strong></div>
            <div>Dicetak: ${currentDate}</div>
            <div>Total Data: ${assets.length} Item</div>
          </div>
        </div>

        <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; color: #0f172a;">${title}</h2>

        <div class="summary">
          <div class="summary-item">Total Aset: <span>${assets.length} Unit</span></div>
          <div class="summary-item">Total Nilai Valuasi: <span>Rp ${totalValue.toLocaleString('id-ID')}</span></div>
          <div class="summary-item">Aset Aktif: <span>${assets.filter(a => a.status === 'Aktif').length} Unit</span></div>
          <div class="summary-item">Dalam Perbaikan: <span>${assets.filter(a => a.status === 'Dalam Perbaikan').length} Unit</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">No</th>
              <th style="width: 100px;">Kode Aset</th>
              <th>Nama Aset</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Penanggung Jawab</th>
              <th style="width: 90px; text-align: center;">Status</th>
              <th style="width: 120px; text-align: right;">Nilai Aset</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <div>
            <em>Dokumen ini dibuat otomatis secara digital oleh SIM Aset Terpadu dan diakui sebagai laporan sah.</em>
          </div>
          <div class="signature-box">
            <div>Mengetahui,</div>
            <div style="font-weight: 600; margin-top: 2px;">Petugas Pengelola Aset</div>
            <div class="signature-line">Administrator Aset</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportDepreciationToExcel(assets: Asset[], filename = 'laporan-penyusutan-nilai-buku-aset.csv') {
  if (!assets || assets.length === 0) return;

  const headers = [
    'Kode Aset',
    'Nama Barang',
    'Kategori',
    'Lokasi',
    'Tanggal Pengadaan',
    'Harga Pengadaan (Rp)',
    'Masa Manfaat (Tahun)',
    'Penyusutan per Bulan (Rp)',
    'Umur Aset (Bulan)',
    'Akumulasi Penyusutan (Rp)',
    'Nilai Buku Saat Ini (Rp)',
    'Persentase Terdepresiasi (%)'
  ];

  const rows = assets
    .filter(a => a.status !== 'Dihapusbukukan')
    .map((a) => {
      const dep = calculateAssetDepreciation(a);
      const loc = a.location || a.locationName || '-';

      return [
        `"${a.assetTag}"`,
        `"${a.name.replace(/"/g, '""')}"`,
        `"${a.category}"`,
        `"${loc.replace(/"/g, '""')}"`,
        `"${a.purchaseDate || ''}"`,
        dep.purchasePrice,
        dep.usefulLifeYears,
        dep.monthlyDepreciation,
        dep.ageInMonths,
        dep.accumulatedDepreciation,
        dep.currentBookValue,
        `"${dep.depreciationPercentage}%"`
      ].join(';');
    });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

