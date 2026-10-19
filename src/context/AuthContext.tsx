'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { getRolePermissions, RolePermissions } from '@/lib/permissions';
import { DataService } from '@/lib/dataService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password?: string, roleOverride?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  hasPermission: (permission: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved user in localStorage
    const saved = localStorage.getItem('sima_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('sima_user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password?: string, roleOverride?: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      let found = DataService.login(identifier, password);
      
      // If roleOverride is specified, create or customize the profile for demo testing
      if (!found && roleOverride) {
        found = {
          id: `usr-demo-${roleOverride}`,
          name: roleOverride === 'super_admin' ? 'Super Admin SIMA' : roleOverride === 'admin_it' ? 'Andi (Admin Aset)' : roleOverride === 'auditor' ? 'Rina (Auditor SIMA)' : 'Budi (Staff Operasional)',
          username: identifier.split('@')[0],
          email: identifier,
          role: roleOverride,
          department: roleOverride === 'super_admin' ? 'Administrator' : roleOverride === 'admin_it' ? 'Teknisi Aset' : roleOverride === 'auditor' ? 'Audit & Kepatuhan' : 'Divisi Operasional',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
        };
      }

      if (found) {
        const loggedUser: User = roleOverride ? { ...found, role: roleOverride } : found;
        setUser(loggedUser);
        localStorage.setItem('sima_user', JSON.stringify(loggedUser));
        return { success: true };
      }
      return { success: false, message: 'Username / Email atau password salah. Gunakan tombol Uji Coba Demo di bawah jika lupa password.' };
    } catch {
      return { success: false, message: 'Gagal melakukan login' };
    }
  };

  const switchRole = async (role: UserRole) => {
    await login('admin', 'admin123', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sima_user');
    router.push('/login');
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    if (!user) return false;
    const permissions = getRolePermissions(user.role);
    return !!permissions[permission];
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
