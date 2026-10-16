export type UserRole = 'super_admin' | 'admin_it' | 'admin_ga' | 'management' | 'staff' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type CategorySlug = 
  | 'it' 
  | 'furniture' 
  | 'furnitur'
  | 'kendaraan' 
  | 'elektronik' 
  | 'mesin' 
  | 'lainnya'
  | 'rumah-tangga';

export interface AssetCategory {
  id: string;
  slug: string;
  name: string;
  codePrefix: string;
  percentage?: number;
  count: number;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  count: number;
}

export type AssetCondition = 'Baik' | 'Perbaikan' | 'Rusak';
export type AssetStatus = 'Aktif' | 'Tidak Aktif' | 'Dalam Perbaikan' | 'Tersedia' | 'Dipinjam' | 'Dihapusbukukan';

export interface AssetHistory {
  id: string;
  date: string;
  activityType: 'Peminjaman' | 'Perawatan' | 'Pindah Lokasi' | 'Perbaikan' | 'Penghapusan';
  assetTag: string;
  assetName: string;
  description: string;
  user: string;
}

export interface Asset {
  id: string;
  assetTag: string; // e.g. AST-IT-0001, AST-FN-0001, AST-KD-0001
  name: string;
  category: string; // e.g. "Perangkat IT", "Furniture", "Kendaraan", "Elektronik"
  categorySlug: string;
  location: string; // e.g. "Kantor Pusat - Divisi IT", "Cabang A", "Ruang Rapat"
  locationName?: string; // backwards compatibility
  locationId?: string;
  purchaseDate: string; // e.g. "12 Januari 2024"
  purchasePrice: number; // e.g. 15000000
  condition: AssetCondition;
  status: AssetStatus;
  image?: string;
  brand?: string; // e.g. "Dell", "Toyota", "Epson"
  model?: string; // e.g. "Latitude 5520", "Avanza", "EB-X500"
  serialNumber?: string; // e.g. "DL5520112345"
  specification?: string; // e.g. "Intel i5, 8GB RAM, 512GB SSD"
  assignedTo?: string; // e.g. "Tim IT", "Bagas", "Admin"
  assignedUserName?: string | null; // backwards compatibility
  notes?: string; // e.g. "Laptop untuk operasional harian"
  quantity?: number;
  specificAttributes?: any; // backwards compatibility
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  type: 'Rutin' | 'Perbaikan';
  scheduleDate: string;
  completionDate?: string | null;
  vendorName: string;
  cost: number;
  notes: string;
  status: 'Terjadwal' | 'Sedang Berjalan' | 'Selesai';
}
