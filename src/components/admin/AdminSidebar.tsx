'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { InternalAccount } from '@/types';
import {
  Gauge,
  Globe,
  Ticket,
  Users,
  EnvelopeSimple,
  QrCode,
  UserGear,
  SignOut,
  Sparkle,
  Trophy,
} from '@phosphor-icons/react';

interface AdminSidebarProps {
  user: InternalAccount | null;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  subItems?: NavSubItem[];
}

export function AdminSidebar({ user, onLogout, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === 'ADMIN_PANITIA';

  // Sesuai Master Spec Phase A
  const adminNav: NavItem[] = [
    { label: 'Dashboard', href: '/panitia', icon: Gauge },
    {
      label: 'Kelola Beranda',
      href: '/panitia/website/beranda',
      icon: Globe,
      subItems: [
        { label: 'Informasi Acara', href: '/panitia/website/beranda' },
        { label: 'Artis Band', href: '/panitia/website/band' },
        { label: 'Teaser Fashion Show', href: '/panitia/website/teaser-fashion-show' },
        { label: 'Teaser Awarding', href: '/panitia/website/teaser-awarding' },
      ],
    },
    { label: 'Fashion Show', href: '/panitia/fashion-show', icon: Sparkle },
    { label: 'Awarding', href: '/panitia/awarding', icon: Trophy },
    { label: 'Kelola Tiket', href: '/panitia/tiket', icon: Ticket },
    { label: 'Data Peserta', href: '/panitia/peserta', icon: Users },
    {
      label: 'Undangan Dosen',
      href: '/panitia/undangan/dosen',
      icon: EnvelopeSimple,
      subItems: [
        { label: 'Daftar Dosen', href: '/panitia/undangan/dosen' },
        { label: 'Template Undangan', href: '/panitia/undangan/template' },
      ],
    },
    { label: 'Check-in Kehadiran', href: '/panitia/check-in', icon: QrCode },
    { label: 'Kelola Akun', href: '/panitia/akun', icon: UserGear },
  ];

  // Petugas Check-in hanya melihat presensi kehadiran & logout
  const staffNav: NavItem[] = [
    { label: 'Check-in Kehadiran', href: '/panitia/check-in', icon: QrCode },
  ];

  const navList: NavItem[] = isAdmin ? adminNav : staffNav;

  return (
    <aside className="w-64 bg-white border-r border-[#E5E7EB] text-[#252932] flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#891523]">
            MEMORIA PANITIA
          </div>
          <div className="text-[11px] text-[#6B7280]">Diesnatalis SIKC 2026</div>
        </div>
      </div>

      {/* Navigation List - Independently scrollable if screen is short */}
      <nav className="p-3 space-y-1 flex-1 min-h-0 overflow-y-auto">
        {navList.map((item) => {
          const Icon = item.icon;
          const isRootActive =
            item.href === '/panitia'
              ? pathname === '/panitia'
              : pathname === item.href ||
                (item.subItems
                  ? item.subItems.some((s) => pathname === s.href || pathname.startsWith(s.href))
                  : pathname.startsWith(item.href));

          return (
            <div key={item.label} className="space-y-0.5">
              <Link
                href={item.href}
                prefetch={true}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isRootActive
                    ? 'bg-[#FAEDEF] text-[#891523] font-semibold'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                <Icon size={18} weight={isRootActive ? 'bold' : 'regular'} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>

              {/* Submenu if any */}
              {item.subItems && isRootActive && (
                <div className="ml-7 pl-2 border-l border-[#E5E7EB] space-y-0.5 pt-0.5">
                  {item.subItems.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        prefetch={true}
                        onClick={onCloseMobile}
                        className={`block py-1.5 px-2 text-[11px] rounded transition-colors ${
                          isSubActive
                            ? 'text-[#891523] font-bold bg-[#FAEDEF]/60'
                            : 'text-[#6B7280] hover:text-[#111827]'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Session Footer & Logout (Always pinned to bottom) */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] space-y-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FAEDEF] border border-[#891523]/30 flex items-center justify-center text-[#891523] font-bold text-xs uppercase">
            {user?.fullName?.charAt(0) || 'P'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-bold text-[#111827] truncate">
              {user?.fullName || 'Panitia MEMORIA'}
            </div>
            <div className="text-[10px] text-[#6B7280] truncate">
              {user?.role === 'ADMIN_PANITIA' ? 'Admin Panitia' : 'Petugas Check-in'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#E5E7EB] hover:bg-white text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <SignOut size={16} />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
