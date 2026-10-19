import { Asset } from '@/types';

export interface DepreciationResult {
  assetId: string;
  assetTag: string;
  name: string;
  category: string;
  purchasePrice: number;
  purchaseDate: string;
  usefulLifeYears: number;
  annualRate: number; // e.g. 0.25 (25%)
  monthlyDepreciation: number;
  ageInMonths: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  salvageValue: number;
  depreciationPercentage: number;
  isFullyDepreciated: boolean;
}

// Category useful life in years according to Indonesian standard tax (UU PPh) & PSAK
export const CATEGORY_USEFUL_LIFE_YEARS: Record<string, number> = {
  'it': 4,
  'perangkat it': 4,
  'furniture': 5,
  'furnitur': 5,
  'kendaraan': 8,
  'elektronik': 5,
  'mesin': 8,
  'mesin & peralatan': 8,
  'rumah-tangga': 4,
  'lainnya': 5
};

export function getUsefulLifeYears(category: string): number {
  const clean = (category || '').toLowerCase().trim();
  return CATEGORY_USEFUL_LIFE_YEARS[clean] || 5;
}

export function parsePurchaseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // If already ISO format "YYYY-MM-DD"
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  // Indonesian month map
  const indoMonths: Record<string, number> = {
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
    'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'agu': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11
  };

  const parts = dateStr.toLowerCase().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10) || 1;
    const month = indoMonths[parts[1]] !== undefined ? indoMonths[parts[1]] : 0;
    const year = parseInt(parts[2], 10) || new Date().getFullYear();
    return new Date(year, month, day);
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function calculateAssetDepreciation(asset: Asset, asOfDate: Date = new Date()): DepreciationResult {
  const purchasePrice = asset.purchasePrice || 0;
  const usefulLifeYears = getUsefulLifeYears(asset.categorySlug || asset.category);
  const totalMonths = usefulLifeYears * 12;
  const annualRate = 1 / usefulLifeYears;
  const salvageValue = 0; // Standard straight-line

  const pDate = parsePurchaseDate(asset.purchaseDate);
  const diffYears = asOfDate.getFullYear() - pDate.getFullYear();
  const diffMonths = asOfDate.getMonth() - pDate.getMonth();
  const rawMonths = diffYears * 12 + diffMonths;
  const ageInMonths = Math.max(0, rawMonths);

  const depreciableAmount = Math.max(0, purchasePrice - salvageValue);
  const monthlyDepreciation = depreciableAmount / totalMonths;

  const accumulatedDepreciation = Math.min(
    depreciableAmount,
    Math.round(monthlyDepreciation * ageInMonths)
  );

  const currentBookValue = Math.max(salvageValue, purchasePrice - accumulatedDepreciation);
  const depreciationPercentage = purchasePrice > 0 
    ? Math.min(100, Math.round((accumulatedDepreciation / purchasePrice) * 100))
    : 0;
  const isFullyDepreciated = accumulatedDepreciation >= depreciableAmount;

  return {
    assetId: asset.id,
    assetTag: asset.assetTag,
    name: asset.name,
    category: asset.category,
    purchasePrice,
    purchaseDate: asset.purchaseDate,
    usefulLifeYears,
    annualRate,
    monthlyDepreciation: Math.round(monthlyDepreciation),
    ageInMonths,
    accumulatedDepreciation,
    currentBookValue,
    salvageValue,
    depreciationPercentage,
    isFullyDepreciated
  };
}

export function calculatePortfolioDepreciation(assets: Asset[]) {
  const results = assets
    .filter(a => a.status !== 'Dihapusbukukan')
    .map(a => calculateAssetDepreciation(a));

  const totalOriginalCost = results.reduce((sum, r) => sum + r.purchasePrice, 0);
  const totalAccumulatedDepreciation = results.reduce((sum, r) => sum + r.accumulatedDepreciation, 0);
  const totalCurrentBookValue = results.reduce((sum, r) => sum + r.currentBookValue, 0);
  const totalMonthlyDepreciation = results.reduce((sum, r) => sum + r.monthlyDepreciation, 0);

  return {
    items: results,
    totalOriginalCost,
    totalAccumulatedDepreciation,
    totalCurrentBookValue,
    totalMonthlyDepreciation,
    depreciationRatio: totalOriginalCost > 0 ? Math.round((totalAccumulatedDepreciation / totalOriginalCost) * 100) : 0
  };
}
