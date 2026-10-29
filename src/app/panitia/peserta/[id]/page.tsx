'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { participantAdapter, ticketAdapter, votingAdapter, checkinAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { Participant, TicketIdentity, TicketType, Voting, CheckinRecord, VoteRecord } from '@/types';
import { formatWibDateTime } from '@/lib/date';
import { generateQrDataUrl } from '@/lib/qrCode';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  EnvelopeSimple,
  PencilSimple,
  Trash,
  CheckCircle,
  Clock,
  QrCode,
  LockKey,
  User,
} from '@phosphor-icons/react';

function ParticipantDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const participantId = resolvedParams.id;
  const router = useRouter();

  const [participant, setParticipant] = useState<Participant | undefined>(undefined);
  const [identity, setIdentity] = useState<TicketIdentity | undefined>(undefined);
  const [ticket, setTicket] = useState<TicketType | undefined>(undefined);
  const [checkin, setCheckin] = useState<CheckinRecord | undefined>(undefined);
  const [votings, setVotings] = useState<Voting[]>([]);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const { success, info } = useToast();

  useEffect(() => {
    participantAdapter.getParticipant(participantId).then((p) => {
      if (p) {
        setParticipant(p);
        participantAdapter.getTicketIdentity(p.id).then((id) => {
          if (id) {
            setIdentity(id);
            generateQrDataUrl(id.checkinQrToken).then(setQrDataUrl);
          }
        });
        ticketAdapter.getTicket(p.ticketTypeId).then(setTicket);
        const chk = mockStore.getCheckinRecord('MAHASISWA', p.id);
        setCheckin(chk);
      }
    });

    votingAdapter.listVotings().then(setVotings);
    const votes = mockStore.getVotings().flatMap((v) => mockStore.getVoteRecordsByVotingId(v.id));
    setVoteRecords(votes);
  }, [participantId]);

  const handleResendEmail = () => {
    if (!participant) return;
    info(
      'Simulasi Pengiriman Email',
      `E-ticket resmi berhasil dikirim ulang ke alamat ${participant.email}`
    );
  };

  if (!participant) {
    return (
      <AdminShell title="Detail Peserta" adminOnly={true}>
        <div className="text-center py-20 text-xs text-[#6B7280]">Memuat data peserta...</div>
      </AdminShell>
    );
  }

  const hasCheckedIn = Boolean(checkin);

  return (
    <AdminShell title={`Detail Peserta: ${participant.fullName}`} adminOnly={true}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/panitia/peserta"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] py-1 px-3 rounded-lg border border-[#E5E7EB] bg-white"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Data Peserta</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs text-[#374151] hover:bg-[#F9FAFB]"
            >
              <EnvelopeSimple size={15} />
              <span>Kirim Ulang Tiket</span>
            </button>
          </div>
        </div>

        {/* Identity & Ticket Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAEDEF] text-[#891523] flex items-center justify-center font-bold text-sm">
                  {participant.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111827]">{participant.fullName}</h2>
                  <span className="text-xs font-mono text-[#6B7280]">NIM: {participant.nim}</span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                  participant.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {participant.status === 'ACTIVE' ? 'Peserta Aktif' : 'Diarsipkan'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#6B7280] block text-[11px]">EMAIL</span>
                <span className="font-semibold text-[#111827]">{participant.email}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">NOMOR TELEPON / HP</span>
                <span className="font-mono font-semibold text-[#111827]">{participant.phone}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">PROGRAM STUDI</span>
                <span className="font-semibold text-[#111827]">{participant.studyProgram}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">FAKULTAS</span>
                <span className="font-semibold text-[#111827]">{participant.faculty}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">JENIS TIKET</span>
                <span className="font-semibold text-[#891523]">
                  {ticket ? ticket.name : '—'}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">NOMOR TIKET RESMI</span>
                <span className="font-mono font-bold text-[#111827]">
                  {identity ? identity.ticketNo : '—'}
                </span>
              </div>
            </div>

            {/* Secret Vote Code Box */}
            <div className="p-3.5 rounded-xl bg-[#FAEDEF]/50 border border-[#891523]/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#891523]">
                <LockKey size={18} />
                <span className="font-semibold">Kode Unik Voting (Private Vote Code)</span>
              </div>
              <span className="font-mono font-bold text-sm text-[#891523] px-2.5 py-1 rounded bg-white border border-[#891523]/20">
                {identity?.voteCode}
              </span>
            </div>
          </div>

          {/* QR Code & Check-in Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col items-center justify-between text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6B7280] block">
                STATUS KEHADIRAN
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  hasCheckedIn
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {hasCheckedIn ? <CheckCircle size={15} weight="fill" /> : <Clock size={15} />}
                <span>{hasCheckedIn ? 'Hadir di Lokasi' : 'Belum Check-in'}</span>
              </span>
            </div>

            {/* QR View */}
            {qrDataUrl && (
              <div className="p-2 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
                <img src={qrDataUrl} alt="QR Code" className="w-32 h-32" />
              </div>
            )}

            {checkin ? (
              <div className="text-[11px] text-[#4B5563] space-y-0.5 font-mono">
                <div>Waktu: {formatWibDateTime(checkin.checkedInAt)}</div>
                <div>Metoda: {checkin.method}</div>
                <div>Operator: {checkin.operatorName}</div>
              </div>
            ) : (
              <div className="text-[11px] text-[#9CA3AF]">
                Belum tercatat pemindaian QR di pintu masuk.
              </div>
            )}
          </div>
        </div>

        {/* Voting Records for this participant */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Riwayat Partisipasi Private Voting
          </h3>

          <div className="divide-y divide-[#E5E7EB] text-xs">
            {votings.map((v) => {
              const voteRecord = voteRecords.find(
                (vr) => vr.participantId === participant.id && vr.votingId === v.id
              );
              const candidate = voteRecord
                ? mockStore.getCandidatesByVotingId(v.id).find((c) => c.id === voteRecord.candidateId)
                : null;

              return (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#111827] block">{v.title}</span>
                    <span className="text-[11px] text-[#6B7280]">
                      {voteRecord
                        ? `Memilih kandidat: "${candidate?.name || 'Kandidat'}"`
                        : 'Belum memberikan suara'}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold ${
                      voteRecord
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {voteRecord ? 'Sudah Vote' : 'Belum'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export default function ParticipantDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Memuat rincian peserta...</div>}>
      <ParticipantDetailContent {...props} />
    </Suspense>
  );
}
