import initialDb from '../../data/db.json';
import initialLoans from '../../data/loans.json';
import { Asset, User } from '@/types';

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

const STORAGE_KEYS = {
  ASSETS: 'sima_assets_data',
  LOANS: 'sima_loans_data',
  USERS: 'sima_users_data',
};

// Safe access for SSR & Static Export
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredAssets(): Asset[] {
  if (!isBrowser()) return initialDb.assets as Asset[];
  const stored = localStorage.getItem(STORAGE_KEYS.ASSETS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(initialDb.assets));
  return initialDb.assets as Asset[];
}

export function saveStoredAssets(assets: Asset[]): void {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }
}

export function getStoredLoans(): AssetLoan[] {
  if (!isBrowser()) return initialLoans as AssetLoan[];
  const stored = localStorage.getItem(STORAGE_KEYS.LOANS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(initialLoans));
  return initialLoans as AssetLoan[];
}

export function saveStoredLoans(loans: AssetLoan[]): void {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }
}

export function getStoredUsers(): User[] {
  if (!isBrowser()) return initialDb.users as User[];
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialDb.users));
  return initialDb.users as User[];
}

export const DataService = {
  getAssets(filters?: { category?: string; location?: string; status?: string; search?: string }): Asset[] {
    let list = getStoredAssets();
    if (!filters) return list;

    if (filters.category && filters.category !== 'Semua') {
      const cat = filters.category.toLowerCase();
      list = list.filter((a) => a.category.toLowerCase().includes(cat) || a.categorySlug?.toLowerCase() === cat);
    }
    if (filters.location && filters.location !== 'Semua') {
      list = list.filter((a) => a.location === filters.location);
    }
    if (filters.status && filters.status !== 'Semua') {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.assetTag.toLowerCase().includes(q) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
          (a.assignedTo && a.assignedTo.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getAssetById(id: string): Asset | undefined {
    const assets = getStoredAssets();
    return assets.find((a) => a.id === id || a.assetTag.toLowerCase() === id.toLowerCase());
  },

  createAsset(data: Partial<Asset>): Asset {
    const assets = getStoredAssets();
    const newId = `ast-${Date.now()}`;
    const newAsset: Asset = {
      id: newId,
      assetTag: data.assetTag || `AST-${Date.now().toString().slice(-4)}`,
      name: data.name || 'Aset Baru',
      category: data.category || 'Perangkat IT',
      categorySlug: data.categorySlug || 'it',
      location: data.location || 'Kantor Pusat',
      locationId: data.locationId || 'loc-1',
      purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: data.purchasePrice || 0,
      condition: data.condition || 'Baik',
      status: data.status || 'Aktif',
      brand: data.brand || '',
      model: data.model || '',
      serialNumber: data.serialNumber || '',
      specification: data.specification || '',
      assignedTo: data.assignedTo || '',
      notes: data.notes || '',
      image: data.image || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    assets.unshift(newAsset);
    saveStoredAssets(assets);
    return newAsset;
  },

  batchCreateAssets(items: Partial<Asset>[]): Asset[] {
    const assets = getStoredAssets();
    const createdList: Asset[] = [];

    items.forEach((data, index) => {
      const newId = `ast-${Date.now()}-${index}`;
      const newAsset: Asset = {
        id: newId,
        assetTag: data.assetTag || `AST-${Date.now().toString().slice(-4)}-${index + 1}`,
        name: data.name || 'Aset Import',
        category: data.category || 'Perangkat IT',
        categorySlug: data.categorySlug || 'it',
        location: data.location || 'Kantor Pusat',
        locationId: data.locationId || 'loc-1',
        purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
        purchasePrice: Number(data.purchasePrice) || 0,
        condition: data.condition || 'Baik',
        status: data.status || 'Aktif',
        brand: data.brand || '',
        model: data.model || '',
        serialNumber: data.serialNumber || '',
        specification: data.specification || '',
        assignedTo: data.assignedTo || '',
        notes: data.notes || 'Hasil Migrasi Data Excel',
        image: data.image || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      createdList.push(newAsset);
    });

    const merged = [...createdList, ...assets];
    saveStoredAssets(merged);
    return createdList;
  },

  updateAsset(id: string, updates: Partial<Asset>): Asset | undefined {
    const assets = getStoredAssets();
    const index = assets.findIndex((a) => a.id === id || a.assetTag.toLowerCase() === id.toLowerCase());
    if (index === -1) return undefined;

    assets[index] = {
      ...assets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStoredAssets(assets);
    return assets[index];
  },

  getLoans(): AssetLoan[] {
    return getStoredLoans();
  },

  createLoan(data: Partial<AssetLoan>): AssetLoan {
    const loans = getStoredLoans();
    const newLoan: AssetLoan = {
      id: `loan-${Date.now()}`,
      loanNumber: `LOAN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(
        loans.length + 1
      ).padStart(3, '0')}`,
      assetId: data.assetId || '',
      assetTag: data.assetTag || '',
      assetName: data.assetName || '',
      borrowerName: data.borrowerName || '',
      borrowerDept: data.borrowerDept || '',
      borrowDate: data.borrowDate || new Date().toISOString().split('T')[0],
      expectedReturnDate: data.expectedReturnDate || '',
      purpose: data.purpose || '',
      documentName: data.documentName || '',
      documentUrl: data.documentUrl || '',
      status: 'Sedang Dipinjam',
      notes: data.notes || '',
    };
    loans.unshift(newLoan);
    saveStoredLoans(loans);

    // Also update asset assignedTo
    if (newLoan.assetId) {
      DataService.updateAsset(newLoan.assetId, {
        assignedTo: newLoan.borrowerName,
      });
    }

    return newLoan;
  },

  updateLoan(id: string, updates: Partial<AssetLoan>): AssetLoan | undefined {
    const loans = getStoredLoans();
    const index = loans.findIndex((l) => l.id === id || l.loanNumber === id);
    if (index === -1) return undefined;

    loans[index] = {
      ...loans[index],
      ...updates,
    };
    saveStoredLoans(loans);
    return loans[index];
  },

  getDashboardStats() {
    const assets = getStoredAssets();
    const totalAssets = assets.length;
    const activeAssets = assets.filter((a) => a.status === 'Aktif').length;
    const maintenanceAssets = assets.filter((a) => a.status === 'Dalam Perbaikan').length;
    const inactiveAssets = assets.filter((a) => a.status === 'Tidak Aktif').length;
    const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

    return {
      totalAssets,
      activeAssets,
      maintenanceAssets,
      inactiveAssets,
      totalValue,
      categories: initialDb.categories,
      locations: initialDb.locations,
      recentActivities: initialDb.histories,
    };
  },

  login(identifier: string): User | null {
    const users = getStoredUsers();
    const cleanId = (identifier || '').trim().toLowerCase();
    const usernamePart = cleanId.split('@')[0];

    // Find by exact username, exact email, or username part
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === usernamePart ||
        cleanId.startsWith(u.username.toLowerCase())
    );

    if (found) return found;

    // Fallback if user types 'admin' or admin email
    if (cleanId.includes('admin')) {
      return users.find((u) => u.role === 'super_admin') || users[0];
    }

    return null;
  },
};

