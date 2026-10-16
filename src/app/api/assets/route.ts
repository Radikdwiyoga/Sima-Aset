import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const location = searchParams.get('location') || undefined;
  const search = searchParams.get('search') || undefined;

  const assets = db.getAssets({
    category,
    status,
    location,
    search
  });

  return NextResponse.json({ success: true, data: assets });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAsset = db.createAsset(body);
    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan aset.' },
      { status: 500 }
    );
  }
}
