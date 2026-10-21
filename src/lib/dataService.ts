import initialDb from '../../data/db.json';
import initialLoans from '../../data/loans.json';
import { Asset, User, AssetCategory, Location, AssetHistory, AssetStatus, MaintenanceLog, AssetDocument } from '@/types';

export interface AssetDisposal {
  id: string;
  assetId: string;
  tag: string;
  name: string;
  category: string;
  date: string;
  reason: string;
  approval: string;
  status: string;
}

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
  /** Asset's assignedTo before the loan was created (restored on return). */
  previousAssignedTo?: string;
  /** Asset's status before the loan was created (restored on return). */
  previousStatus?: string;
}

const STORAGE_KEYS = {
  ASSETS: 'sima_assets_data',
  LOANS: 'sima_loans_data',
  USERS: 'sima_users_data',
  LOCATIONS: 'sima_locations_data',
  CATEGORIES: 'sima_categories_data',
  DISPOSALS: 'sima_disposals_data',
  HISTORIES: 'sima_histories_data',
  OPNAME_VERIFIED: 'sima_opname_verified',
};

const MAINTENANCE_LOGS_KEY = 'sima_maintenance_logs';

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

export function saveStoredUsers(users: User[]): void {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

export function getStoredLocations(): Location[] {
  if (!isBrowser()) return initialDb.locations as Location[];
  const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(initialDb.locations));
  return initialDb.locations as Location[];
}

export function saveStoredLocations(locations: Location[]): void {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  }
}

export function getStoredCategories(): AssetCategory[] {
  if (!isBrowser()) return initialDb.categories as AssetCategory[];
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialDb.categories));
  return initialDb.categories as AssetCategory[];
}

export function saveStoredCategories(categories: AssetCategory[]): void {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }
}

export function getStoredDisposals(): AssetDisposal[] {
  const defaultDisposals: AssetDisposal[] = [
    {
      id: 'dsp-1',
      assetId: 'ast-3',
      tag: 'AST-IT-0003',
      name: 'Printer HP LaserJet Pro',
      category: 'Perangkat IT',
      date: '15 Agu 2026',
      reason: 'Komponen roller & mainboard rusak berat, biaya perbaikan melebihi nilai aset',
      approval: 'Disetujui Manajemen',
      status: 'Dihapusbukukan'
    }
  ];
  if (!isBrowser()) return defaultDisposals;
  const stored = localStorage.getItem(STORAGE_KEYS.DISPOSALS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.DISPOSALS, JSON.stringify(defaultDisposals));
  return defaultDisposals;
}

export function saveStoredDisposals(disposals: AssetDisposal[]): void {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.DISPOSALS, JSON.stringify(disposals));
  }
}

export function getStoredHistories(): AssetHistory[] {
  const defaults = initialDb.histories as AssetHistory[];
  if (!isBrowser()) return defaults;
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORIES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.HISTORIES, JSON.stringify(defaults));
  return defaults;
}

export function saveStoredHistories(histories: AssetHistory[]): void {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.HISTORIES, JSON.stringify(histories));
  }
}

/** Append an activity to the shared history log (newest first). */
export function addHistory(entry: Omit<AssetHistory, 'id'>): AssetHistory {
  const histories = getStoredHistories();
  const newEntry: AssetHistory = { id: `his-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...entry };
  histories.unshift(newEntry);
  saveStoredHistories(histories);
  return newEntry;
}

export function getStoredMaintenanceLogs(): MaintenanceLog[] {
  const defaults = (initialDb.maintenanceLogs as MaintenanceLog[]) || [];
  if (!isBrowser()) return defaults;
  const stored = localStorage.getItem(MAINTENANCE_LOGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  localStorage.setItem(MAINTENANCE_LOGS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveStoredMaintenanceLogs(logs: MaintenanceLog[]): void {
  if (isBrowser()) {
    localStorage.setItem(MAINTENANCE_LOGS_KEY, JSON.stringify(logs));
  }
}

export const DataService = {
  getAssets(filters?: { category?: string; location?: string; status?: string; search?: string }): Asset[] {
    let list = getStoredAssets().map((a) => ({
      ...a,
      specificAttributes: a.specificAttributes || {},
      locationName: a.locationName || a.location || '-',
      assignedUserName: a.assignedUserName || a.assignedTo || '-',
    }));
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
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.assetTag.toLowerCase().includes(q) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
          (a.assignedTo && a.assignedTo.toLowerCase().includes(q)) ||
          (a.assignedUserName && a.assignedUserName.toLowerCase().includes(q)) ||
          (a.location && a.location.toLowerCase().includes(q)) ||
          (a.locationName && a.locationName.toLowerCase().includes(q)) ||
          (a.brand && a.brand.toLowerCase().includes(q)) ||
          (a.model && a.model.toLowerCase().includes(q)) ||
          (a.category && a.category.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getAssetById(id: string): Asset | undefined {
    const assets = getStoredAssets();
    const found = assets.find((a) => a.id === id || a.assetTag.toLowerCase() === id.toLowerCase());
    if (!found) return undefined;
    return {
      ...found,
      documents: found.documents && found.documents.length > 0 ? found.documents : [
        {
          id: `doc-${found.id}-1`,
          name: `Invoice_Pengadaan_${found.assetTag}.pdf`,
          category: 'Invoice',
          fileType: 'pdf',
          fileSize: '1.2 MB',
          uploadDate: found.purchaseDate || '2026-01-15',
          notes: 'Faktur pembelian dan bukti transaksi pengadaan aset resmi'
        },
        {
          id: `doc-${found.id}-2`,
          name: `Kartu_Garansi_Resmi_${(found.brand || 'Vendor').replace(/\s+/g, '_')}.pdf`,
          category: 'Garansi',
          fileType: 'pdf',
          fileSize: '850 KB',
          uploadDate: found.purchaseDate || '2026-01-15',
          notes: 'Sertifikat dan kartu jaminan garansi resmi perbaikan dan suku cadang'
        }
      ],
      specificAttributes: found.specificAttributes || {},
      locationName: found.locationName || found.location || '-',
      assignedUserName: found.assignedUserName || found.assignedTo || '-',
    };
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
      locationName: data.locationName || data.location || 'Kantor Pusat',
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
      assignedUserName: data.assignedUserName || data.assignedTo || '',
      notes: data.notes || '',
      image: data.image || '',
      quantity: data.quantity !== undefined ? Number(data.quantity) || 0 : 1,
      specificAttributes: data.specificAttributes || {},
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
        locationName: data.locationName || data.location || 'Kantor Pusat',
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
        assignedUserName: data.assignedUserName || data.assignedTo || '',
        notes: data.notes || 'Hasil Migrasi Data Excel',
        image: data.image || '',
        specificAttributes: data.specificAttributes || {},
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

  addAssetDocument(assetId: string, doc: Omit<AssetDocument, 'id' | 'uploadDate'>): AssetDocument | undefined {
    const assets = getStoredAssets();
    const index = assets.findIndex((a) => a.id === assetId || a.assetTag.toLowerCase() === assetId.toLowerCase());
    if (index === -1) return undefined;

    const currentDocs = assets[index].documents || [
      {
        id: `doc-${assets[index].id}-1`,
        name: `Invoice_Pengadaan_${assets[index].assetTag}.pdf`,
        category: 'Invoice',
        fileType: 'pdf',
        fileSize: '1.2 MB',
        uploadDate: assets[index].purchaseDate || '2026-01-15',
        notes: 'Faktur pembelian dan bukti transaksi pengadaan aset resmi'
      },
      {
        id: `doc-${assets[index].id}-2`,
        name: `Kartu_Garansi_Resmi_${(assets[index].brand || 'Vendor').replace(/\s+/g, '_')}.pdf`,
        category: 'Garansi',
        fileType: 'pdf',
        fileSize: '850 KB',
        uploadDate: assets[index].purchaseDate || '2026-01-15',
        notes: 'Sertifikat dan kartu jaminan garansi resmi perbaikan dan suku cadang'
      }
    ];

    const newDoc: AssetDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };

    assets[index].documents = [newDoc, ...currentDocs];
    assets[index].updatedAt = new Date().toISOString();
    saveStoredAssets(assets);
    return newDoc;
  },

  deleteAssetDocument(assetId: string, documentId: string): boolean {
    const assets = getStoredAssets();
    const index = assets.findIndex((a) => a.id === assetId || a.assetTag.toLowerCase() === assetId.toLowerCase());
    if (index === -1) return false;

    const currentDocs = assets[index].documents || [];
    assets[index].documents = currentDocs.filter(d => d.id !== documentId);
    assets[index].updatedAt = new Date().toISOString();
    saveStoredAssets(assets);
    return true;
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

    // Also update asset assignedTo + status, capturing prior state for return
    if (newLoan.assetId) {
      const asset = getStoredAssets().find((a) => a.id === newLoan.assetId);
      if (asset) {
        newLoan.previousAssignedTo = asset.assignedTo || '';
        newLoan.previousStatus = asset.status;
        saveStoredLoans(loans);
        DataService.updateAsset(asset.id, {
          assignedTo: newLoan.borrowerName,
          assignedUserName: newLoan.borrowerName,
          ...(asset.status === 'Aktif' || asset.status === 'Tersedia' ? { status: 'Dipinjam' as AssetStatus } : {}),
        });
      }
    }

    addHistory({
      date: newLoan.borrowDate,
      activityType: 'Peminjaman',
      assetTag: newLoan.assetTag,
      assetName: newLoan.assetName,
      description: `Dipinjam oleh ${newLoan.borrowerName}${newLoan.borrowerDept ? ` (${newLoan.borrowerDept})` : ''}${
        newLoan.purpose ? ` — ${newLoan.purpose}` : ''
      }`,
      user: newLoan.borrowerName,
    });

    return newLoan;
  },

  /** Return a loaned asset: restore its previous assignee/status and log the activity. */
  returnLoan(id: string, returnDate?: string): AssetLoan | undefined {
    const loans = getStoredLoans();
    const index = loans.findIndex((l) => l.id === id || l.loanNumber === id);
    if (index === -1) return undefined;

    const loan = loans[index];
    if (loan.status === 'Sudah Dikembalikan') return loan; // idempotent

    loans[index] = {
      ...loan,
      status: 'Sudah Dikembalikan',
      actualReturnDate: returnDate || new Date().toISOString().split('T')[0],
    };
    saveStoredLoans(loans);

    // Restore the asset's prior state
    if (loan.assetId) {
      const asset = getStoredAssets().find((a) => a.id === loan.assetId);
      if (asset) {
        const clearing = !asset.assignedTo || asset.assignedTo === loan.borrowerName;
        DataService.updateAsset(asset.id, {
          ...(clearing
            ? { assignedTo: loan.previousAssignedTo || '', assignedUserName: loan.previousAssignedTo || '' }
            : {}),
          ...(loan.previousStatus && asset.status === 'Dipinjam'
            ? { status: loan.previousStatus as AssetStatus }
            : asset.status === 'Dipinjam'
              ? { status: 'Tersedia' as AssetStatus }
              : {}),
        });
      }
    }

    addHistory({
      date: loans[index].actualReturnDate || new Date().toISOString().split('T')[0],
      activityType: 'Peminjaman',
      assetTag: loan.assetTag,
      assetName: loan.assetName,
      description: `Dikembalikan oleh ${loan.borrowerName} (peminjaman selesai)`,
      user: loan.borrowerName,
    });

    return loans[index];
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

    // Dynamic Category Distribution
    const categoryCountMap: { [cat: string]: number } = {};
    assets.forEach((a) => {
      const cat = a.category || 'Lainnya';
      categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
    });

    const categoryColorPalette = [
      '#3B82F6', // Blue
      '#10B981', // Emerald
      '#06B6D4', // Cyan
      '#F59E0B', // Amber
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#6366F1', // Indigo
      '#14B8A6', // Teal
      '#F97316', // Orange
    ];

    const categoryDistribution = Object.entries(categoryCountMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        percentage: totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0,
        color: categoryColorPalette[index % categoryColorPalette.length],
      }));

    // Dynamic Location Distribution
    const locationCountMap: { [loc: string]: number } = {};
    assets.forEach((a) => {
      const loc = a.location || 'Lainnya';
      locationCountMap[loc] = (locationCountMap[loc] || 0) + 1;
    });

    const locationColorPalette = [
      '#60A5FA', // Blue
      '#34D399', // Emerald
      '#FBBF24', // Amber
      '#F87171', // Red
      '#C084FC', // Purple
      '#38BDF8', // Sky
      '#A78BFA', // Violet
    ];

    const locationDistribution = Object.entries(locationCountMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        fill: locationColorPalette[index % locationColorPalette.length],
      }));

    return {
      totalAssets,
      activeAssets,
      maintenanceAssets,
      inactiveAssets,
      totalValue,
      categoryDistribution: categoryDistribution.length > 0 ? categoryDistribution : [
        { name: 'Belum Ada Data', count: 0, percentage: 0, color: '#94A3B8' }
      ],
      locationDistribution: locationDistribution.length > 0 ? locationDistribution : [
        { name: 'Belum Ada Data', count: 0, fill: '#94A3B8' }
      ],
      categories: getStoredCategories(),
      locations: getStoredLocations(),
      recentActivities: getStoredHistories(),
    };
  },

  login(identifier: string, password?: string): User | null {
    const users = getStoredUsers();
    const cleanId = (identifier || '').trim().toLowerCase();
    const usernamePart = cleanId.split('@')[0];

    // Find by exact username, exact email, or username part
    const found = users.find(
      (u: User) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === usernamePart ||
        cleanId.startsWith(u.username.toLowerCase())
    );

    if (found) {
      if (password !== undefined && !DataService.validatePassword(found, password)) return null;
      return found;
    }

    // Fallback if user types 'admin' or an admin email exactly
    if (cleanId === 'admin' || usernamePart === 'admin') {
      const admin = users.find((u: User) => u.role === 'super_admin') || users[0];
      if (admin && password !== undefined && !DataService.validatePassword(admin, password)) return null;
      return admin || null;
    }

    return null;
  },

  /**
   * Validate a password against a stored user.
   * Users seeded before the password field existed fall back to the
   * demo default 'admin123' so existing logins keep working.
   */
  validatePassword(user: User, password: string): boolean {
    const stored = (user as User & { password?: string }).password || 'admin123';
    return stored === password;
  },

  getLocations(): Location[] {
    const locations = getStoredLocations();
    const assets = getStoredAssets();
    const defaults = (initialDb.locations as any[]) || [];
    return locations.map(loc => {
      const def = defaults.find((d: any) => d.id === loc.id);
      return {
        ...loc,
        latitude: loc.latitude !== undefined ? loc.latitude : def?.latitude,
        longitude: loc.longitude !== undefined ? loc.longitude : def?.longitude,
        address: loc.address || def?.address,
        city: loc.city || def?.city,
        // Count by locationId when present; fall back to name match only for
        // legacy assets that have no locationId (avoids double-counting).
        count: assets.filter(a =>
          a.locationId ? a.locationId === loc.id : (a.location || '').toLowerCase().includes(loc.name.toLowerCase())
        ).length
      };
    });
  },

  createLocation(data: { name: string; description?: string; latitude?: number; longitude?: number; address?: string; city?: string }): Location {
    const list = getStoredLocations();
    const newLoc: Location = {
      id: `loc-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      count: 0,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      city: data.city
    };
    list.push(newLoc);
    saveStoredLocations(list);
    return newLoc;
  },

  updateLocation(id: string, updates: Partial<Location>): Location | undefined {
    const list = getStoredLocations();
    const idx = list.findIndex(l => l.id === id || l.name.toLowerCase() === id.toLowerCase());
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates };
    saveStoredLocations(list);
    return list[idx];
  },

  deleteLocation(id: string): boolean {
    const list = getStoredLocations();
    const filtered = list.filter(l => l.id !== id && l.name !== id);
    if (filtered.length !== list.length) {
      saveStoredLocations(filtered);
      return true;
    }
    return false;
  },

  getCategories(): AssetCategory[] {
    const categories = getStoredCategories();
    const assets = getStoredAssets();
    const total = assets.length;
    return categories.map(cat => {
      const count = assets.filter(a => (a.category && a.category.toLowerCase() === cat.name.toLowerCase()) || a.categorySlug === cat.slug).length;
      return {
        ...cat,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      };
    });
  },

  createCategory(data: { name: string; codePrefix: string; slug?: string }): AssetCategory {
    const list = getStoredCategories();
    const newCat: AssetCategory = {
      id: `cat-${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: data.name,
      codePrefix: data.codePrefix,
      count: 0,
      percentage: 0
    };
    list.push(newCat);
    saveStoredCategories(list);
    return newCat;
  },

  updateCategory(id: string, updates: Partial<AssetCategory>): AssetCategory | undefined {
    const list = getStoredCategories();
    const idx = list.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates };
    saveStoredCategories(list);
    return list[idx];
  },

  deleteCategory(id: string): boolean {
    const list = getStoredCategories();
    const filtered = list.filter(c => c.id !== id && c.slug !== id);
    if (filtered.length !== list.length) {
      saveStoredCategories(filtered);
      return true;
    }
    return false;
  },

  getUsers(): User[] {
    return getStoredUsers();
  },

  createUser(data: Partial<User>): User {
    const users = getStoredUsers();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name || 'User Baru',
      username: data.username || `user_${Date.now().toString().slice(-4)}`,
      email: data.email || 'user@company.com',
      role: data.role || 'staff',
      department: data.department || 'Operasional',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
    };
    users.push(newUser);
    saveStoredUsers(users);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = getStoredUsers();
    const idx = users.findIndex((u: User) => u.id === id || u.email === id);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], ...updates };
    saveStoredUsers(users);
    return users[idx];
  },

  deleteUser(id: string): boolean {
    const users = getStoredUsers();
    const filtered = users.filter((u: User) => u.id !== id);
    if (filtered.length !== users.length) {
      saveStoredUsers(filtered);
      return true;
    }
    return false;
  },

  getDisposals(): AssetDisposal[] {
    return getStoredDisposals();
  },

  createDisposal(data: Partial<AssetDisposal>): AssetDisposal {
    const disposals = getStoredDisposals();
    const newDisposal: AssetDisposal = {
      id: `dsp-${Date.now()}`,
      assetId: data.assetId || '',
      tag: data.tag || '',
      name: data.name || '',
      category: data.category || '',
      date: data.date || new Date().toISOString().split('T')[0],
      reason: data.reason || 'Dihapusbukukan',
      approval: data.approval || 'Disetujui Manajemen',
      status: 'Dihapusbukukan'
    };
    disposals.unshift(newDisposal);
    saveStoredDisposals(disposals);

    // Also update asset status to 'Dihapusbukukan'
    if (newDisposal.assetId || newDisposal.tag) {
      const asset = DataService.getAssetById(newDisposal.assetId || newDisposal.tag);
      if (asset) {
        DataService.updateAsset(asset.id, { status: 'Dihapusbukukan' });
      }
    }

    addHistory({
      date: newDisposal.date,
      activityType: 'Penghapusan',
      assetTag: newDisposal.tag,
      assetName: newDisposal.name,
      description: `Penghapusan aset — ${newDisposal.reason}`,
      user: 'Sistem',
    });

    return newDisposal;
  },
};

