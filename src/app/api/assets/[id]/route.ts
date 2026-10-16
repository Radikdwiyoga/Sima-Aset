import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const asset = db.getAssetById(id) || db.getAssetByTag(id);

  if (!asset) {
    return NextResponse.json({ success: false, message: 'Aset tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: asset });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if delta update for quantity
    if (typeof body.deltaQuantity === 'number') {
      const updated = db.updateQuantity(id, body.deltaQuantity);
      if (!updated) {
        return NextResponse.json({ success: false, message: 'Aset tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updated });
    }

    const updated = db.updateAsset(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Aset tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui aset' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = db.deleteAsset(id);

  if (!success) {
    return NextResponse.json({ success: false, message: 'Aset tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Aset berhasil dihapus' });
}
