import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const categories = db.getCategories();
  const locations = db.getLocations();
  const assets = db.getAssets();
  const histories = db.getHistories();

  const metrics = {
    total: 1248,
    active: 1102,
    inactive: 98,
    repair: 48,
    totalGrowth: '+12% dari bulan lalu',
    activePercent: '88.3% dari total',
    inactivePercent: '7.9% dari total',
    repairPercent: '3.8% dari total'
  };

  const categoryDistribution = [
    { name: 'Perangkat IT', percentage: 35, count: 436, color: '#3B82F6' },
    { name: 'Furniture', percentage: 20, count: 250, color: '#10B981' },
    { name: 'Kendaraan', percentage: 15, count: 187, color: '#06B6D4' },
    { name: 'Elektronik', percentage: 12, count: 150, color: '#F59E0B' },
    { name: 'Mesin & Peralatan', percentage: 10, count: 125, color: '#EC4899' },
    { name: 'Lainnya', percentage: 8, count: 100, color: '#8B5CF6' }
  ];

  const locationDistribution = [
    { name: 'Kantor Pusat', count: 420, fill: '#60A5FA' },
    { name: 'Cabang A', count: 280, fill: '#34D399' },
    { name: 'Cabang B', count: 210, fill: '#FBBF24' },
    { name: 'Gudang', count: 180, fill: '#F87171' },
    { name: 'Lainnya', count: 158, fill: '#C084FC' }
  ];

  return NextResponse.json({
    success: true,
    data: {
      metrics,
      categoryDistribution,
      locationDistribution,
      categories,
      locations,
      recentAssets: assets.slice(0, 5),
      histories: histories.slice(0, 5)
    }
  });
}
