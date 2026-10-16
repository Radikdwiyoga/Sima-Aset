import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'SIMA-ASET';

  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({ success: true, qrDataUrl });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal membuat QR Code' }, { status: 500 });
  }
}
