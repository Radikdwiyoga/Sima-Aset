import { Asset } from '@/types';
import { calculateAssetDepreciation } from './depreciation';
import * as XLSX from 'xlsx';

/** Escape interpolated values before embedding them in generated HTML (PDF print view). */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type ReportGroupBy = 'category' | 'location' | 'condition';

/**
 * Grouped Excel (.xlsx) report:
 * Sheet 1: 'Ringkasan' - summary table (count + total value per group)
 * Sheet 2: 'Rincian_Aset' - complete row-by-row asset breakdown
 */
export function exportAssetsGroupedToExcel(
  assets: Asset[],
  groupBy: ReportGroupBy,
  filename = 'laporan-kelompok-aset.xlsx'
) {
  if (!assets || assets.length === 0) return;

  const label =
    groupBy === 'category' ? 'Kategori' : groupBy === 'location' ? 'Lokasi' : 'Kondisi';
  const keyOf = (a: Asset): string => {
    if (groupBy === 'category') return a.category || a.categorySlug || '-';
    if (groupBy === 'location') return a.location || a.locationName || '-';
    return a.condition || '-';
  };

  const groups = new Map<string, Asset[]>();
  assets.forEach((a) => {
    const k = keyOf(a);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(a);
  });
  const sortedKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b, 'id'));

  // Sheet 1: Ringkasan
  const summaryRows = sortedKeys.map((k, idx) => {
    const list = groups.get(k)!;
    const total = list.reduce((s, a) => s + (a.purchasePrice || 0), 0);
    return {
      'No': idx + 1,
      [label]: k,
      'Jumlah Aset': list.length,
      'Total Nilai Pengadaan (Rp)': total
    };
  });

  const grandTotal = assets.reduce((s, a) => s + (a.purchasePrice || 0), 0);
  summaryRows.push({
    'No': summaryRows.length + 1,
    [label]: 'TOTAL KESELURUHAN',
    'Jumlah Aset': assets.length,
    'Total Nilai Pengadaan (Rp)': grandTotal
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 16 },
    { wch: 28 }
  ];

  // Sheet 2: Rincian
  let rowNo = 1;
  const detailRows: Record<string, unknown>[] = [];
  sortedKeys.forEach((k) => {
    groups.get(k)!.forEach((a) => {
      const pic = a.assignedTo || a.assignedUserName || '-';
      detailRows.push({
        'No': rowNo++,
        'Kode Aset': a.assetTag,
        'Nama Barang': a.name,
        [label]: k,
        'Penanggung Jawab': pic,
        'Kondisi': a.condition,
        'Status': a.status,
        'Harga Pengadaan (Rp)': a.purchasePrice || 0,
        'Tanggal Pengadaan': a.purchaseDate || ''
      });
    });
  });

  const wsDetail = XLSX.utils.json_to_sheet(detailRows);
  wsDetail['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 32 },
    { wch: 22 },
    { wch: 22 },
    { wch: 12 },
    { wch: 16 },
    { wch: 24 },
    { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Rincian_Aset');

  const safeFilename = filename.endsWith('.xlsx')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}

/**
 * Standard Full Asset Inventory Excel (.xlsx) export
 */
export function exportAssetsToExcel(assets: Asset[], filename = 'laporan-inventaris-aset.xlsx') {
  if (!assets || assets.length === 0) return;

  const data = assets.map((a, idx) => {
    let specStr = a.specification || '';
    if (!specStr && a.specificAttributes) {
      specStr = Object.values(a.specificAttributes).filter(Boolean).join(' | ');
    }

    const loc = a.location || a.locationName || '-';
    const pic = a.assignedTo || a.assignedUserName || '-';

    return {
      'No': idx + 1,
      'Kode Aset': a.assetTag,
      'Nama Barang': a.name,
      'Kategori': (a.category || a.categorySlug || '').toUpperCase(),
      'Lokasi': loc,
      'Penanggung Jawab / Pemegang': pic,
      'Merek': a.brand || '-',
      'Nomor Seri': a.serialNumber || '-',
      'Kondisi': a.condition,
      'Status': a.status,
      'Harga Pengadaan (Rp)': a.purchasePrice || 0,
      'Tanggal Pengadaan': a.purchaseDate || '',
      'Spesifikasi': specStr
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 32 },
    { wch: 18 },
    { wch: 24 },
    { wch: 26 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 24 },
    { wch: 18 },
    { wch: 40 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Aset');

  const safeFilename = filename.endsWith('.xlsx')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}

// Backwards compatibility alias
export const exportAssetsToCSV = exportAssetsToExcel;

/**
 * Asset Depreciation & Book Value Excel (.xlsx) export
 */
export function exportDepreciationToExcel(
  assets: Asset[],
  filename = 'laporan-penyusutan-nilai-buku-aset.xlsx'
) {
  const data = (assets || []).filter((a) => a.status !== 'Dihapusbukukan');
  if (data.length === 0) return;

  const rows = data.map((a, idx) => {
    const dep = calculateAssetDepreciation(a);
    const loc = a.location || a.locationName || '-';

    return {
      'No': idx + 1,
      'Kode Aset': a.assetTag,
      'Nama Barang': a.name,
      'Kategori': a.category,
      'Lokasi': loc,
      'Tanggal Pengadaan': a.purchaseDate || '',
      'Harga Pengadaan (Rp)': dep.purchasePrice,
      'Masa Manfaat (Tahun)': dep.usefulLifeYears,
      'Penyusutan per Bulan (Rp)': dep.monthlyDepreciation,
      'Umur Aset (Bulan)': dep.ageInMonths,
      'Akumulasi Penyusutan (Rp)': dep.accumulatedDepreciation,
      'Nilai Buku Saat Ini (Rp)': dep.currentBookValue,
      'Persentase Terdepresiasi': `${dep.depreciationPercentage}%`
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 30 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 24 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Penyusutan_Nilai_Buku');

  const safeFilename = filename.endsWith('.xlsx')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}

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

  const tableRows = assets
    .map(
      (a, idx) => `
    <tr>
      <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
      <td style="font-weight: bold; font-family: monospace; color: #1e40af;">${escapeHtml(a.assetTag)}</td>
      <td style="font-weight: 600;">${escapeHtml(a.name)}</td>
      <td>${escapeHtml(a.category)}</td>
      <td>${escapeHtml(a.location || '-')}</td>
      <td style="font-weight: 500;">${escapeHtml(a.assignedTo || '-')}</td>
      <td style="text-align: center;">
        <span style="padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; ${
          a.status === 'Aktif'
            ? 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;'
            : a.status === 'Dalam Perbaikan'
            ? 'background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
            : 'background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;'
        }">
          ${escapeHtml(a.status)}
        </span>
      </td>
      <td style="text-align: right; font-weight: bold;">Rp ${(a.purchasePrice || 0).toLocaleString('id-ID')}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)} - SIM ASET</title>
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

        <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; color: #0f172a;">${escapeHtml(title)}</h2>

        <div class="summary">
          <div class="summary-item">Total Aset: <span>${assets.length} Unit</span></div>
          <div class="summary-item">Total Nilai Valuasi: <span>Rp ${totalValue.toLocaleString('id-ID')}</span></div>
          <div class="summary-item">Aset Aktif: <span>${assets.filter((a) => a.status === 'Aktif').length} Unit</span></div>
          <div class="summary-item">Dalam Perbaikan: <span>${assets.filter((a) => a.status === 'Dalam Perbaikan').length} Unit</span></div>
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

export function exportDepreciationToPDF(assets: Asset[], title = 'Laporan Depresiasi & Nilai Buku') {
  const data = (assets || []).filter((a) => a.status !== 'Dihapusbukukan');
  if (data.length === 0) return;

  const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const totalBookValue = data.reduce((s, a) => s + calculateAssetDepreciation(a).currentBookValue, 0);
  const totalAccum = data.reduce((s, a) => s + calculateAssetDepreciation(a).accumulatedDepreciation, 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tableRows = data
    .map((a, idx) => {
      const dep = calculateAssetDepreciation(a);
      return `
    <tr>
      <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
      <td style="font-weight: bold; font-family: monospace; color: #1e40af;">${escapeHtml(a.assetTag)}</td>
      <td style="font-weight: 600;">${escapeHtml(a.name)}</td>
      <td>${escapeHtml(a.purchaseDate || '-')}</td>
      <td style="text-align: right;">Rp ${dep.purchasePrice.toLocaleString('id-ID')}</td>
      <td style="text-align: center;">${dep.usefulLifeYears}</td>
      <td style="text-align: right;">Rp ${dep.monthlyDepreciation.toLocaleString('id-ID')}</td>
      <td style="text-align: center;">${dep.ageInMonths}</td>
      <td style="text-align: right;">Rp ${dep.accumulatedDepreciation.toLocaleString('id-ID')}</td>
      <td style="text-align: right; font-weight: bold;">Rp ${dep.currentBookValue.toLocaleString('id-ID')}</td>
      <td style="text-align: center;">${dep.depreciationPercentage}%</td>
    </tr>
  `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)} - SIM ASET</title>
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
          @media print { .no-print { display: none; } }
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
            <div>Total Data: ${data.length} Item</div>
          </div>
        </div>

        <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; color: #0f172a;">${escapeHtml(title)}</h2>

        <div class="summary">
          <div class="summary-item">Total Aset: <span>${data.length} Unit</span></div>
          <div class="summary-item">Total Akumulasi Penyusutan: <span>Rp ${totalAccum.toLocaleString('id-ID')}</span></div>
          <div class="summary-item">Total Nilai Buku: <span>Rp ${totalBookValue.toLocaleString('id-ID')}</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 26px; text-align: center;">No</th>
              <th style="width: 90px;">Kode Aset</th>
              <th>Nama Aset</th>
              <th style="width: 90px;">Tgl Perolehan</th>
              <th style="width: 100px; text-align: right;">Harga Perolehan</th>
              <th style="width: 55px; text-align: center;">Masa Manfaat</th>
              <th style="width: 100px; text-align: right;">Penyusutan/Bulan</th>
              <th style="width: 55px; text-align: center;">Umur (Bln)</th>
              <th style="width: 110px; text-align: right;">Akumulasi Penyusutan</th>
              <th style="width: 110px; text-align: right;">Nilai Buku</th>
              <th style="width: 60px; text-align: center;">%</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <div>
            <em>Dokumen ini dibuat otomatis secara digital oleh SIM Aset Terpadu dan diakui sebagai laporan sah. Metode: Garis Lurus (Straight-Line).</em>
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
