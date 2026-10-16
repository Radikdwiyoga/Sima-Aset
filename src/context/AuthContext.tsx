'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { getRolePermissions, RolePermissions } from '@/lib/permissions';

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
      } catch (e) {
        localStorage.removeItem('sima_user');
        setUser(null);
      }
    } else {
      // Default to Super Admin so that dev reload still works smoothly,
      // but logout can clear it to test real login page
      const defaultUser: User = {
        id: 'usr-1',
        name: 'Super Admin SIMA',
        username: 'admin',
        email: 'admin@sima.com',
        role: 'super_admin',
        department: 'Administrator Aset',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
      };
      setUser(defaultUser);
      localStorage.setItem('sima_user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password?: string, roleOverride?: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, roleOverride })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('sima_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Kredensial tidak valid' };
    } catch (err) {
      return { success: false, message: 'Koneksi ke server gagal' };
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
