'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { mockStore } from '@/data/mock/mockStore';
import {
  Users,
  CheckCircle,
  Ticket,
  CheckSquareOffset,
  EnvelopeSimple,
  QrCode,
  ArrowRight,
  Clock,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { formatWibDateTime } from '@/lib/date';
import { useToast } from '@/components/ui/Toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalActiveParticipants: 0,
    presentParticipants: 0,
    uncheckinParticipants: 0,
    publishedTickets: 0,
    totalQuota: 0,
    usedQuota: 0,
    activeVotings: 0,
    totalVotes: 0,
    totalLecturers: 0,
    presentLecturers: 0,
    recentCheckins: mockStore.getCheckinRecords().slice(0, 5),
  });

  const { success } = useToast();

  const calculateStats = () => {
    const participants = mockStore.getParticipants('ACTIVE');
    const checkins = mockStore.getCheckinRecords();
    const tickets = mockStore.getPublishedTickets();
    const votings = mockStore.getVotings();
    const voteRecords = mockStore.getVotings().flatMap((v) => mockStore.getVoteRecordsByVotingId(v.id));
    const lecturers = mockStore.getLecturerInvitations().filter((l) => l.active);

    const studentCheckins = checkins.filter((c) => c.subjectType === 'MAHASISWA');
    const lecturerCheckins = checkins.filter((c) => c.subjectType === 'DOSEN');

    let totalCap = 0;
    tickets.forEach((t) => {
      if (t.capacity !== null) totalCap += t.capacity;
    });

    setStats({
      totalActiveParticipants: participants.length,
      presentParticipants: studentCheckins.length,
      uncheckinParticipants: Math.max(0, participants.length - studentCheckins.length),
      publishedTickets: tickets.length,
      totalQuota: totalCap,
      usedQuota: participants.length,
      activeVotings: votings.filter((v) => mockStore.getVotingRuntimeStatus(v) === 'AKTIF').length,
      totalVotes: voteRecords.length,
      totalLecturers: lecturers.length,
      presentLecturers: lecturerCheckins.length,
      recentCheckins: checkins.slice(0, 5),
    });
  };

  useEffect(() => {
    calculateStats();
    const unsubscribe = mockStore.subscribe(() => {
      calculateStats();
    });
    return () => unsubscribe();
  }, []);

  const handleResetData = () => {
    if (confirm('Kembalikan seluruh data mock ke kondisi awal (seed)? Tindakan ini akan mereset registrasi dan check-in baru.')) {
      mockStore.resetToDefault();
      success('Mock Data Direset', 'Semua data dikembalikan ke seed awal Diesnatalis SIKC 2026.');
    }
  };

  return (
    <AdminShell title="Dashboard Ringkasan Acara" adminOnly={true}>
      <div className="space-y-6">
        {/* Top greeting banner */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">
              Selamat Datang di Panel MEMORIA
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Pantau seluruh aktivitas pendaftaran tiket, kehadiran tamu, voting private, dan pengumuman acara.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/panitia/check-in"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#891523] text-white text-xs font-semibold shadow-xs hover:bg-[#720e1a] transition-colors"
            >
              <QrCode size={16} />
              <span>Buka Check-in</span>
            </Link>
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#E5E7EB] text-[#4B5563] text-xs font-medium hover:bg-[#F9FAFB] transition-colors"
              title="Reset ke data awal"
            >
              <ArrowClockwise size={15} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Primary Metric KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Peserta Mahasiswa */}
          <Link
            href="/panitia/peserta"
            className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#891523]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Peserta Aktif
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAEDEF] text-[#891523] flex items-center justify-center">
                <Users size={18} weight="bold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-[#111827]">
                {stats.totalActiveParticipants}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">{stats.presentParticipants} Hadir</span>
                <span>•</span>
                <span>{stats.uncheckinParticipants} Belum Check-in</span>
              </div>
            </div>
          </Link>

          {/* 2. Kapasitas Tiket */}
          <Link
            href="/panitia/tiket"
            className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#891523]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Tiket Published
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Ticket size={18} weight="bold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-[#111827]">
                {stats.publishedTickets} Jenis
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                {stats.usedQuota} terpakai dari {stats.totalQuota} kuota
              </div>
            </div>
          </Link>

          {/* 3. Voting & Suara */}
          <Link
            href="/panitia/voting"
            className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#891523]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Suara Sah Masuk
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <CheckSquareOffset size={18} weight="bold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-[#111827]">
                {stats.totalVotes} Suara
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                {stats.activeVotings} sesi voting berstatus Aktif
              </div>
            </div>
          </Link>

          {/* 4. Undangan Dosen */}
          <Link
            href="/panitia/undangan/dosen"
            className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#891523]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Undangan Dosen
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <EnvelopeSimple size={18} weight="bold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-[#111827]">
                {stats.totalLecturers} Dosen
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                <span className="text-emerald-600 font-semibold">{stats.presentLecturers} Hadir</span> di lokasi
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Shortcuts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Module Shortcuts */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
              Aksi Cepat Operasional
            </h3>
            <div className="space-y-2">
              <Link
                href="/panitia/check-in"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#FAEDEF]/40 hover:border-[#891523]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <QrCode size={20} className="text-[#891523]" />
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Scanner Check-in</div>
                    <div className="text-[10px] text-[#6B7280]">Pemindaian QR tiket dan manual</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-[#9CA3AF]" />
              </Link>

              <Link
                href="/panitia/peserta"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#FAEDEF]/40 hover:border-[#891523]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-[#891523]" />
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Kelola Data Peserta</div>
                    <div className="text-[10px] text-[#6B7280]">Edit, arsip, dan ekspor .xlsx</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-[#9CA3AF]" />
              </Link>

              <Link
                href="/panitia/website/beranda"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#FAEDEF]/40 hover:border-[#891523]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Ticket size={20} className="text-[#891523]" />
                  <div>
                    <div className="text-xs font-bold text-[#111827]">Kelola Konten Website</div>
                    <div className="text-[10px] text-[#6B7280]">Perbarui tanggal, venue, dan teasers</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-[#9CA3AF]" />
              </Link>
            </div>
          </div>

          {/* Recent Check-in Activity Feed */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                Riwayat Check-in Terkini
              </h3>
              <Link
                href="/panitia/check-in"
                className="text-xs font-semibold text-[#891523] hover:underline"
              >
                Buka Seluruh Riwayat →
              </Link>
            </div>

            {stats.recentCheckins.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB]">
                {stats.recentCheckins.map((chk) => (
                  <div key={chk.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle size={18} weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#111827] truncate">
                          {chk.subjectName}
                        </div>
                        <div className="text-[11px] text-[#6B7280] font-mono truncate">
                          {chk.subjectType === 'MAHASISWA' ? `NIM: ${chk.subjectIdentifier}` : `Kode: ${chk.subjectIdentifier}`} • Metoda {chk.method}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono font-medium text-[#111827]">
                        {formatWibDateTime(chk.checkedInAt)}
                      </div>
                      <div className="text-[10px] text-[#6B7280]">Oleh {chk.operatorName}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#9CA3AF]">
                Belum ada tamu yang check-in.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
