'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { mockStore } from '@/data/mock/mockStore';
import { InternalAccount } from '@/types';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { ToastProvider } from '../ui/Toast';
import { ShieldWarning } from '@phosphor-icons/react';
import Link from 'next/link';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  adminOnly?: boolean;
}

export function AdminShell({ children, title, adminOnly = false }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<InternalAccount | null>(mockStore.getCurrentUser());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let user = mockStore.getCurrentUser();
    if (!user) {
      const defaultAdmin = mockStore.getAccounts().find((a) => a.role === 'ADMIN_PANITIA');
      if (defaultAdmin) {
        mockStore.setCurrentUser(defaultAdmin);
        user = defaultAdmin;
      }
    }
    setCurrentUser(user);

    const unsubscribe = mockStore.subscribe(() => {
      setCurrentUser(mockStore.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    mockStore.logout();
    window.location.href = '/panitia/login';
  };

  const handleSwitchRole = () => {
    const current = mockStore.getCurrentUser();
    const accounts = mockStore.getAccounts();
    if (current?.role === 'ADMIN_PANITIA') {
      const staff = accounts.find((a) => a.role === 'PETUGAS_CHECKIN') || accounts[1];
      mockStore.setCurrentUser(staff);
      router.push('/panitia/check-in');
    } else {
      const admin = accounts.find((a) => a.role === 'ADMIN_PANITIA') || accounts[0];
      mockStore.setCurrentUser(admin);
      router.push('/panitia');
    }
  };

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center text-xs text-neutral-400">
        Memuat dashboard panitia...
      </div>
    );
  }

  // Role guard: staff trying to open admin-only routes
  const isStaff = currentUser.role === 'PETUGAS_CHECKIN';
  if (adminOnly && isStaff) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xl text-center space-y-4">
          <ShieldWarning size={48} className="text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-[#111827]">403 — Akses Ditolak</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Akun Anda terdaftar sebagai <strong>Petugas Check-in</strong> dan tidak memiliki wewenang
            mengakses modul administrasi ini.
          </p>
          <div className="pt-2">
            <Link
              href="/panitia/check-in"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#891523] text-white text-xs font-semibold hover:bg-[#6e0f1b] transition-colors"
            >
              <span>Kembali ke Halaman Check-in</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8F9FB] text-[#252932] flex font-sans">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
          <AdminSidebar user={currentUser} onLogout={handleLogout} />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-64 h-full z-10 animate-in slide-in-from-left duration-200">
              <AdminSidebar
                user={currentUser}
                onLogout={handleLogout}
                onCloseMobile={() => setMobileDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar
            user={currentUser}
            title={title}
            onOpenMobile={() => setMobileDrawerOpen(true)}
            onSwitchRole={handleSwitchRole}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
