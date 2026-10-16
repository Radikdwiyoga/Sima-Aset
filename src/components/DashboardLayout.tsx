'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-600">Memuat SIM ASET TERPADU...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800 antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Mobile Slide-over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative z-10 flex">
            <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-5 sm:p-7 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
