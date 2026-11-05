'use client';

import React from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { ArrowLeft, Clock } from '@phosphor-icons/react';

export default function EditVotingPage() {
  return (
    <AdminShell title="Edit Sesi Voting" adminOnly={true}>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/panitia/voting"
            className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-neutral-50 text-neutral-600"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-base font-bold text-neutral-900">Edit Sesi Voting</h2>
            <p className="text-xs text-neutral-500">Fitur ini dijadwalkan pada implementasi Phase 2.</p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] text-center space-y-3">
          <Clock size={36} className="text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800">Modul Voting Dinonaktifkan</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Sistem voting dan kandidat palsu telah dihapus dari runtime Phase 1.
          </p>
          <div className="pt-2">
            <Link
              href="/panitia/voting"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold"
            >
              Kembali ke Daftar Voting
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
