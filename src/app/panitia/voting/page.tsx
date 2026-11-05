'use client';

import React from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { CheckSquareOffset, Info, ArrowLeft } from '@phosphor-icons/react';

export default function AdminVotingListPage() {
  return (
    <AdminShell title="Kelola Private Voting & Kandidat" adminOnly={true}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">Modul Private Voting (Tahap 2)</h2>
            <p className="text-xs text-[#6B7280]">
              Sistem pemilihan suara private voting dan kandidat terfavorit dijadwalkan untuk rilis pada Phase 2.
            </p>
          </div>
          <Link
            href="/panitia"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* Phase 2 Informative Notice Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <CheckSquareOffset size={32} weight="bold" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-[#111827]">
              Modul Voting Dinonaktifkan di Phase 1
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Sesuai baseline PRD Backend Phase 1, data kandidat dummy dan sistem voting mock telah dibersihkan secara permanen dari runtime produksi. Tabel database dan integrasi pemungutan suara akan diaktifkan secara terpisah pada Phase 2.
            </p>
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-mono font-medium">
              <Info size={14} />
              <span>Status: PHASE_2_SCHEDULED • Zero Fake Candidates</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
