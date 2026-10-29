'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { votingAdapter } from '@/data/adapters';
import { useToast } from '@/components/ui/Toast';
import { Voting, Candidate, VoteRecord } from '@/types';
import { formatWibDateTime } from '@/lib/date';
import {
  ArrowLeft,
  Crown,
  Trophy,
  ChartBar,
  Copy,
  CheckCircle,
  Clock,
  ArrowsClockwise,
  UserCheck,
} from '@phosphor-icons/react';

function VotingResultsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<Voting | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [records, setRecords] = useState<VoteRecord[]>([]);

  const loadData = async () => {
    try {
      const v = await votingAdapter.getVoting(id);
      if (!v) {
        toastError('Tidak Ditemukan', 'Sesi voting tidak ditemukan.');
        router.push('/panitia/voting');
        return;
      }
      setVoting(v);

      const c = await votingAdapter.listCandidates(id);
      setCandidates(c);

      const recs = await votingAdapter.listVoteRecords(id);
      setRecords(recs);
    } catch (err: any) {
      toastError('Gagal Memuat', err.message || 'Gagal memuat hasil voting');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const totalVotes = records.length;

  // Calculate vote count per candidate
  const candidateTally = candidates.map((cand) => {
    const votes = records.filter((r) => r.candidateId === cand.id).length;
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    return {
      ...cand,
      votes,
      percentage,
    };
  });

  // Sort by highest votes descending
  const sortedTally = [...candidateTally].sort((a, b) => b.votes - a.votes);
  const winner = sortedTally[0]?.votes > 0 ? sortedTally[0] : null;

  const handleCopyLink = () => {
    if (!voting) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/vote/${voting.privateToken}`;
    navigator.clipboard.writeText(url);
    success('Tautan Tersalin', 'Tautan private voting disalin ke clipboard.');
  };

  if (loading) {
    return (
      <AdminShell title="Hasil Voting" adminOnly={true}>
        <div className="p-8 text-center text-sm text-neutral-500">Memuat hasil perolehan suara...</div>
      </AdminShell>
    );
  }

  if (!voting) return null;

  const status = votingAdapter.getVotingRuntimeStatus(voting);

  return (
    <AdminShell title={`Hasil Voting: ${voting.title}`} adminOnly={true}>
      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/panitia/voting"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft size={14} /> Kembali ke Daftar Voting
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <ArrowsClockwise size={14} /> Refresh Tally
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-900 bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <Copy size={14} /> Salin Link Voting
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Suara Sah</span>
              <UserCheck size={18} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-extrabold text-neutral-900">{totalVotes}</div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Termasuk suara dari peserta yang berstatus arsip (PRD K-29)
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Status Sesi</span>
              <Clock size={18} className="text-neutral-700" />
            </div>
            <div className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              {status === 'AKTIF' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SEDANG BERLANGSUNG
                </span>
              )}
              {status === 'TERJADWAL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  TERJADWAL
                </span>
              )}
              {status === 'SELESAI' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800">
                  SELESAI / DITUTUP
                </span>
              )}
              {status === 'DRAFT' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  DRAFT
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {formatWibDateTime(voting.startsAt)} s/d {formatWibDateTime(voting.endsAt)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pemimpin Sementara</span>
              <Crown size={18} className="text-amber-500" />
            </div>
            <div className="text-lg font-bold text-neutral-900 truncate">
              {winner ? winner.name : 'Belum Ada Suara'}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {winner ? `${winner.votes} suara (${winner.percentage.toFixed(1)}%)` : 'Menunggu pemilih'}
            </p>
          </div>
        </div>

        {/* Tally Breakdown Cards */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ChartBar size={16} />
                Perolehan Suara per Kandidat
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Urutan berdasarkan perolehan suara terbanyak secara real-time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {sortedTally.map((cand, idx) => {
              const isLead = idx === 0 && cand.votes > 0;
              return (
                <div
                  key={cand.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLead
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-neutral-200 bg-neutral-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isLead
                            ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          {cand.name}
                          {isLead && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                              <Trophy size={11} /> Top Leader
                            </span>
                          )}
                        </h4>
                        {cand.description && (
                          <p className="text-xs text-neutral-500">{cand.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-neutral-900">
                        {cand.votes}
                      </span>
                      <span className="text-xs text-neutral-500 ml-1">
                        suara ({cand.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLead ? 'bg-amber-500' : 'bg-neutral-800'
                      }`}
                      style={{ width: `${cand.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log Suara Masuk */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Riwayat Suara Masuk (Audit Log)</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Pencatatan waktu pemberian suara setiap peserta secara immutable.
              </p>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              Belum ada suara yang masuk untuk sesi voting ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-2 font-semibold">#</th>
                    <th className="px-4 py-2 font-semibold">Waktu Suara (WIB)</th>
                    <th className="px-4 py-2 font-semibold">ID Peserta</th>
                    <th className="px-4 py-2 font-semibold">Pilihan Kandidat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {records.map((rec, i) => {
                    const c = candidates.find((cand) => cand.id === rec.candidateId);
                    return (
                      <tr key={rec.id} className="hover:bg-neutral-50/70">
                        <td className="px-4 py-2.5 text-neutral-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-neutral-700">
                          {formatWibDateTime(rec.votedAt)}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-neutral-600">
                          {rec.participantId}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-neutral-900">
                          {c ? c.name : rec.candidateId}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

export default function VotingResultsPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Memuat hasil perolehan suara...</div>}>
      <VotingResultsContent {...props} />
    </Suspense>
  );
}
