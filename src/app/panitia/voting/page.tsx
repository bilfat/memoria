'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { votingAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { Voting, VotingStatus } from '@/types';
import { formatWibDateTime } from '@/lib/date';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  PencilSimple,
  Copy,
  ChartBar,
  CheckSquareOffset,
  Clock,
  Sparkle,
} from '@phosphor-icons/react';

export default function AdminVotingListPage() {
  const [votings, setVotings] = useState<Voting[]>(mockStore.getVotings());
  const { success } = useToast();

  const loadVotings = () => {
    votingAdapter.listVotings().then(setVotings);
  };

  useEffect(() => {
    loadVotings();
    const unsubscribe = mockStore.subscribe(loadVotings);
    return () => unsubscribe();
  }, []);

  const handleCopyLink = (token: string, title: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/vote/${token}`;
    navigator.clipboard.writeText(fullUrl);
    success(
      'Tautan Private Disalin',
      `Link private untuk voting "${title}" telah disalin ke clipboard.`
    );
  };

  return (
    <AdminShell title="Kelola Private Voting & Kandidat" adminOnly={true}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Daftar Sesi Pemilihan (Voting)</h2>
            <p className="text-xs text-[#6B7280]">
              Voting hanya dapat diakses melalui link private dengan verifikasi NIM dan kode tiket rahasia.
            </p>
          </div>
          <Link
            href="/panitia/voting/baru"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs self-start sm:self-auto"
          >
            <Plus size={16} weight="bold" />
            <span>Tambah Sesi Voting</span>
          </Link>
        </div>

        {/* Voting Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Judul Voting</th>
                  <th className="py-3.5 px-4">Kandidat</th>
                  <th className="py-3.5 px-4">Jadwal Pelaksanaan (WIB)</th>
                  <th className="py-3.5 px-4">Status Otomatis</th>
                  <th className="py-3.5 px-4">Total Suara</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {votings.map((v) => {
                  const runtimeStatus = votingAdapter.getVotingRuntimeStatus(v);
                  const candidates = mockStore.getCandidatesByVotingId(v.id);
                  const votes = mockStore.getVoteRecordsByVotingId(v.id);

                  let statusBadge = 'bg-gray-100 text-gray-700 border-gray-300';
                  if (runtimeStatus === 'AKTIF') {
                    statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-300';
                  } else if (runtimeStatus === 'TERJADWAL') {
                    statusBadge = 'bg-blue-50 text-blue-700 border-blue-300';
                  } else if (runtimeStatus === 'SELESAI') {
                    statusBadge = 'bg-purple-50 text-purple-700 border-purple-300';
                  }

                  return (
                    <tr key={v.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#111827]">
                        <div>{v.title}</div>
                        <div className="text-[11px] text-[#6B7280] font-normal truncate max-w-xs mt-0.5">
                          {v.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#374151]">
                        {candidates.length} Kandidat
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#4B5563]">
                        <div>Mulai: {formatWibDateTime(v.startsAt)}</div>
                        <div>Selesai: {formatWibDateTime(v.endsAt)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}
                        >
                          {runtimeStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#111827]">
                        {votes.length}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyLink(v.privateToken, v.title)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#374151] font-medium text-[11px]"
                            title="Salin Link Private Voting"
                          >
                            <Copy size={13} />
                            <span>Salin Link</span>
                          </button>
                          <Link
                            href={`/panitia/voting/${v.id}/hasil`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200"
                            title="Lihat Hasil Voting & Grafik"
                          >
                            <ChartBar size={13} />
                            <span>Hasil</span>
                          </Link>
                          <Link
                            href={`/panitia/voting/${v.id}/edit`}
                            className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#374151]"
                            title="Edit Voting & Kandidat"
                          >
                            <PencilSimple size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
