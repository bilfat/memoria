'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentStaffSession, logoutAction } from '@/app/actions/auth';
import { InternalAccount } from '@/types';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { ToastProvider } from '../ui/Toast';
import { ShieldWarning } from '@phosphor-icons/react';
import Link from 'next/link';

// Module-level in-memory cache to make page transitions inside dashboard INSTANT
let memoryStaffSession: InternalAccount | null = null;

export function clearClientStaffSession() {
  memoryStaffSession = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('memoria_staff_session');
    } catch {}
  }
}

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  adminOnly?: boolean;
}

export function AdminShell({ children, title, adminOnly = false }: AdminShellProps) {
  const router = useRouter();

  // Deterministic state on SSR and initial hydration to avoid hydration mismatch
  const [currentUser, setCurrentUser] = useState<InternalAccount | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Fast-path from client session storage or memory cache
    try {
      if (memoryStaffSession) {
        setCurrentUser(memoryStaffSession);
        setLoading(false);
      } else {
        const stored = sessionStorage.getItem('memoria_staff_session');
        if (stored) {
          const parsed = JSON.parse(stored) as InternalAccount;
          memoryStaffSession = parsed;
          setCurrentUser(parsed);
          setLoading(false);
        }
      }
    } catch {}

    // Background session verification (stale-while-revalidate)
    getCurrentStaffSession().then((user) => {
      if (!active) return;
      if (!user) {
        clearClientStaffSession();
        window.location.href = '/panitia/login';
        return;
      }

      memoryStaffSession = user;
      try {
        sessionStorage.setItem('memoria_staff_session', JSON.stringify(user));
      } catch {}

      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    clearClientStaffSession();
    await logoutAction();
    window.location.href = '/panitia/login';
  };

  // Only show full-screen verification on the very first cold load when no cache exists
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center text-xs text-neutral-400 font-sans">
        Memverifikasi sesi panitia...
      </div>
    );
  }

  // Role guard: staff trying to open admin-only routes
  const isStaff = currentUser.role === 'PETUGAS_CHECKIN';
  if (adminOnly && isStaff) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 font-sans">
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
      <div className="h-screen w-full overflow-hidden bg-[#F8F9FB] text-[#252932] flex font-sans">
        {/* Desktop Sidebar (Fixed on the left, does not scroll with page content) */}
        <aside className="hidden md:flex w-64 shrink-0 h-full flex-col z-20">
          <AdminSidebar user={currentUser} onLogout={handleLogout} />
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-64 max-w-[80vw] h-full bg-white shadow-2xl z-10 flex flex-col">
              <AdminSidebar
                user={currentUser}
                onLogout={handleLogout}
                onCloseMobile={() => setMobileDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area (Independent scroll on the right side only) */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md shadow-xs shrink-0">
            <AdminTopbar
              user={currentUser}
              title={title}
              onOpenMobile={() => setMobileDrawerOpen(true)}
            />
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
