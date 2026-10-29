'use client';

import React from 'react';
import Link from 'next/link';
import { InternalAccount } from '@/types';
import { List, ArrowSquareOut, Swap } from '@phosphor-icons/react';

interface AdminTopbarProps {
  user: InternalAccount | null;
  title?: string;
  onOpenMobile: () => void;
  onSwitchRole: () => void;
}

export function AdminTopbar({
  user,
  title = 'Dashboard Panel',
  onOpenMobile,
  onSwitchRole,
}: AdminTopbarProps) {
  const isAdmin = user?.role === 'ADMIN_PANITIA';

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 text-[#4B5563] hover:text-[#111827] focus:outline-none"
          aria-label="Buka menu navigasi"
        >
          <List size={22} />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-[#111827] truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Fast Role Switcher */}
        <button
          onClick={onSwitchRole}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-xs text-[#374151] font-medium transition-colors"
          title="Beralih peran demo antara Admin Panitia dan Petugas Check-in"
        >
          <Swap size={15} className="text-[#891523]" />
          <span className="hidden sm:inline">Ganti Role:</span>
          <span className="font-bold text-[#891523]">
            {isAdmin ? 'Admin' : 'Petugas'}
          </span>
        </button>

        {/* Link to Public Website */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs text-[#4B5563] font-medium transition-colors"
        >
          <span className="hidden sm:inline">Lihat Web Publik</span>
          <ArrowSquareOut size={15} />
        </Link>
      </div>
    </header>
  );
}
