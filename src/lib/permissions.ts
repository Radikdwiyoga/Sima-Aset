import { User, UserRole } from '@/types';

export interface RolePermissions {
  canCreateAsset: boolean;
  canEditAsset: boolean;
  canDeleteAsset: boolean;
  canMoveLocation: boolean;
  canMaintainAsset: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canRequestLoan: boolean;
}

export function getRolePermissions(role?: UserRole): RolePermissions {
  switch (role) {
    case 'super_admin':
      return {
        canCreateAsset: true,
        canEditAsset: true,
        canDeleteAsset: true,
        canMoveLocation: true,
        canMaintainAsset: true,
        canManageUsers: true,
        canViewReports: true,
        canRequestLoan: true
      };

    case 'admin_it':
    case 'admin_ga':
      return {
        canCreateAsset: true,
        canEditAsset: true,
        canDeleteAsset: false, // Protected, requires Super Admin
        canMoveLocation: true,
        canMaintainAsset: true,
        canManageUsers: false, // Protected
        canViewReports: true,
        canRequestLoan: true
      };

    case 'management':
      return {
        canCreateAsset: false,
        canEditAsset: false,
        canDeleteAsset: false,
        canMoveLocation: false,
        canMaintainAsset: false,
        canManageUsers: false,
        canViewReports: true,
        canRequestLoan: false
      };

    case 'staff':
    default:
      return {
        canCreateAsset: false,
        canEditAsset: false,
        canDeleteAsset: false,
        canMoveLocation: false,
        canMaintainAsset: false,
        canManageUsers: false,
        canViewReports: false,
        canRequestLoan: true
      };
  }
}

export function getRoleDisplayName(role?: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin (Akses Penuh)';
    case 'admin_it':
      return 'Admin IT (Hardware & Software)';
    case 'admin_ga':
      return 'Admin GA (Fasilitas & Aset Umum)';
    case 'management':
      return 'Manajemen (Laporan & Audit)';
    case 'staff':
      return 'Staff / Karyawan (Akses Terbatas)';
    default:
      return 'Pengguna';
  }
}

