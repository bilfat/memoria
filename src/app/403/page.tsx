'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldWarning, House, SignIn } from '@phosphor-icons/react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-neutral-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <ShieldWarning size={32} weight="fill" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
            Akses Ditolak (Error 403)
          </span>
          <h1 className="text-xl font-bold text-neutral-900">
            Anda Tidak Memiliki Izin Akses
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Halaman internal ini hanya diperuntukkan bagi peran <strong>Admin Panitia</strong>.
            Akun Anda saat ini memiliki izin terbatas (Petugas Check-in).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/panitia/check-in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold"
          >
            Buka Meja Check-in
          </Link>
          <Link
            href="/panitia/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold"
          >
            <SignIn size={14} /> Ganti Akun Login
          </Link>
        </div>
      </div>
    </div>
  );
}
