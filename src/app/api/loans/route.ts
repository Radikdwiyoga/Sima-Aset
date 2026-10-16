import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export interface AssetLoan {
  id: string;
  loanNumber: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  borrowerName: string;
  borrowerDept: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  purpose: string;
  documentName?: string;
  documentUrl?: string;
  status: 'Sedang Dipinjam' | 'Sudah Dikembalikan' | 'Terlambat';
  notes?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LOANS_FILE = path.join(DATA_DIR, 'loans.json');

const INITIAL_LOANS: AssetLoan[] = [
  {
    id: 'loan-1',
    loanNumber: 'LOAN/2026/09/001',
    assetId: 'ast-1',
    assetTag: 'AST-IT-0001',
    assetName: 'Laptop Dell Latitude 5520',
    borrowerName: 'Bagas Pratama',
    borrowerDept: 'Divisi Marketing',
    borrowDate: '2026-09-12',
    expectedReturnDate: '2026-10-25',
    purpose: 'Dinas luar kota dan presentasi pitching klien di Surabaya',
    documentName: 'Surat_Tugas_Dinas_Bagas.pdf',
    status: 'Sedang Dipinjam',
    notes: 'Kondisi fisik mulus, tas laptop dan charger lengkap diserahkan.'
  },
  {
    id: 'loan-2',
    loanNumber: 'LOAN/2026/09/002',
    assetId: 'ast-4',
    assetTag: 'AST-KD-0001',
    assetName: 'Toyota Avanza 1.3 G',
    borrowerName: 'Ahmad Fauzi',
    borrowerDept: 'Divisi Logistik',
    borrowDate: '2026-09-05',
    expectedReturnDate: '2026-09-08',
    actualReturnDate: '2026-09-08',
    purpose: 'Distribusi material inventaris cabang',
    documentName: 'Formulir_Peminjaman_Kendaraan.pdf',
    status: 'Sudah Dikembalikan',
    notes: 'Bahan bakar penuh, tidak ada baret pada bodi mobil.'
  },
  {
    id: 'loan-3',
    loanNumber: 'LOAN/2026/10/003',
    assetId: 'ast-5',
    assetTag: 'AST-EL-0001',
    assetName: 'Proyektor Epson EB-X500',
    borrowerName: 'Siti Rahma',
    borrowerDept: 'Divisi HRD',
    borrowDate: '2026-10-02',
    expectedReturnDate: '2026-10-18',
    purpose: 'Pelatihan onboarding karyawan baru',
    documentName: 'Nota_Dinas_HRD_Proyektor.pdf',
    status: 'Sedang Dipinjam',
    notes: 'Lengkap dengan kabel HDMI 10 meter dan remote.'
  }
];

function ensureLoansFile(): AssetLoan[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOANS_FILE)) {
    fs.writeFileSync(LOANS_FILE, JSON.stringify(INITIAL_LOANS, null, 2), 'utf-8');
    return INITIAL_LOANS;
  }
  try {
    const raw = fs.readFileSync(LOANS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    fs.writeFileSync(LOANS_FILE, JSON.stringify(INITIAL_LOANS, null, 2), 'utf-8');
    return INITIAL_LOANS;
  }
}

function saveLoansFile(data: AssetLoan[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LOANS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const loans = ensureLoansFile();
  return NextResponse.json({ success: true, data: loans });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loans = ensureLoansFile();

    const newLoan: AssetLoan = {
      id: `loan-${Date.now()}`,
      loanNumber: `LOAN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(loans.length + 1).padStart(3, '0')}`,
      assetId: body.assetId,
      assetTag: body.assetTag,
      assetName: body.assetName,
      borrowerName: body.borrowerName,
      borrowerDept: body.borrowerDept || 'Umum',
      borrowDate: body.borrowDate || new Date().toISOString().split('T')[0],
      expectedReturnDate: body.expectedReturnDate,
      purpose: body.purpose || 'Keperluan dinas kantor',
      documentName: body.documentName || 'Dokumen_Peminjaman.pdf',
      documentUrl: body.documentUrl,
      status: 'Sedang Dipinjam',
      notes: body.notes || ''
    };

    loans.unshift(newLoan);
    saveLoansFile(loans);

    // Also update asset status to Dipinjam & assignedTo borrower
    try {
      if (body.assetId) {
        db.updateAsset(body.assetId, {
          assignedTo: `${body.borrowerName} (${body.borrowerDept || 'Peminjam'})`,
          status: 'Aktif'
        });
      }
    } catch (e) {
      console.error(e);
    }

    return NextResponse.json({ success: true, data: newLoan });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal membuat peminjaman' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    const loans = ensureLoansFile();

    const index = loans.findIndex(l => l.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    loans[index].status = status;
    if (status === 'Sudah Dikembalikan') {
      loans[index].actualReturnDate = new Date().toISOString().split('T')[0];
    }
    saveLoansFile(loans);

    return NextResponse.json({ success: true, data: loans[index] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui peminjaman' }, { status: 500 });
  }
}

