'use client';

import React, { useEffect, useState, use, Suspense, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  getAdminParticipantDetailAction,
  ParticipantListItemDTO,
} from '@/app/actions/participants';
import { enqueueTicketResendAction } from '@/app/actions/emails';
import { formatWibDateTime } from '@/lib/date';
import { generateQrDataUrl } from '@/lib/qrCode';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  EnvelopeSimple,
  CheckCircle,
  Clock,
  QrCode,
  Ticket,
  User,
  MapPin,
  CalendarBlank,
  ArrowSquareOut,
  Warning,
} from '@phosphor-icons/react';

function ParticipantDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const participantId = resolvedParams.id;
  const router = useRouter();

  const [participant, setParticipant] = useState<ParticipantListItemDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const { success, error: toastError, info } = useToast();

  const loadData = () => {
    setLoading(true);
    getAdminParticipantDetailAction(participantId).then((res) => {
      if (res.success && res.participant) {
        setParticipant(res.participant);
        if (res.participant.ticketAccessToken) {
          // Token QR check-in
          generateQrDataUrl(res.participant.ticketNumber).then(setQrDataUrl);
        }
      } else {
        toastError('Gagal Memuat Peserta', res.error || 'Data tidak ditemukan.');
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [participantId]);

  const handleResendEmail = () => {
    if (!participant) return;
    startTransition(async () => {
      const res = await enqueueTicketResendAction(participant.id);
      if (res.success) {
        info('Antrean Email Dijadwalkan', res.message || 'Tiket telah dijadwalkan ke antrean email.');
      } else {
        toastError('Gagal Mengirim Ulang', res.error || 'Terjadi kesalahan sistem.');
      }
    });
  };

  if (loading) {
    return (
      <AdminShell title="Detail Peserta" adminOnly={false}>
        <div className="text-center py-20 text-xs text-[#6B7280]">
          <div className="inline-block w-6 h-6 border-2 border-[#891523] border-t-transparent rounded-full animate-spin mb-2" />
          <div>Memuat data peserta...</div>
        </div>
      </AdminShell>
    );
  }

  if (!participant) {
    return (
      <AdminShell title="Detail Peserta" adminOnly={false}>
        <div className="text-center py-20 text-xs text-[#6B7280]">
          <p>Peserta tidak ditemukan atau telah dihapus.</p>
          <div className="pt-4">
            <Link
              href="/panitia/peserta"
              className="px-4 py-2 rounded-lg bg-[#891523] text-white font-medium"
            >
              Kembali ke Daftar Peserta
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  const isArchived = participant.status === 'archived';

  return (
    <AdminShell title={`Detail Peserta: ${participant.fullName}`} adminOnly={false}>
      <div className="max-w-4xl mx-auto space-y-6 text-xs">
        {/* Top toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/panitia/peserta"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] py-1.5 px-3 rounded-lg border border-[#E5E7EB] bg-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Data Peserta</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D1D5DB] bg-white text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
              title="Kirim Ulang Tiket ke Email"
            >
              <EnvelopeSimple size={15} />
              <span>{isPending ? 'Menjadwalkan...' : 'Kirim Ulang Tiket'}</span>
            </button>
            <a
              href={`/tiket/${participant.ticketAccessToken}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white font-semibold transition-colors"
            >
              <span>Buka E-Ticket Digital</span>
              <ArrowSquareOut size={14} />
            </a>
          </div>
        </div>

        {/* Warning if archived */}
        {isArchived && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
            <Warning size={20} className="text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">STATUS TIKET DIARSIPKAN</p>
              <p className="mt-0.5 leading-relaxed">
                Peserta ini telah diarsipkan pada {formatWibDateTime(participant.archivedAt || undefined)}. Tiket tidak dapat digunakan untuk check-in.
              </p>
            </div>
          </div>
        )}

        {/* Main Info Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#891523] font-bold block">
                {participant.ticketTypeName}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mt-0.5">
                {participant.fullName}
              </h1>
              <span className="text-xs font-mono text-[#6B7280]">NIM: {participant.nim}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-[#6B7280] uppercase block">NO. TIKET RESMI</span>
              <span className="text-sm sm:text-base font-mono font-bold text-[#891523]">
                {participant.ticketNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <span className="text-[#6B7280] font-medium block">Program Studi</span>
              <p className="text-sm font-semibold text-[#111827] mt-0.5">{participant.studyProgram}</p>
            </div>

            <div>
              <span className="text-[#6B7280] font-medium block">Fakultas</span>
              <p className="text-sm font-semibold text-[#111827] mt-0.5">{participant.faculty}</p>
            </div>

            <div>
              <span className="text-[#6B7280] font-medium block">Email Mahasiswa</span>
              <p className="text-sm font-semibold text-[#111827] mt-0.5">{participant.email}</p>
            </div>

            <div>
              <span className="text-[#6B7280] font-medium block">Nomor WhatsApp / HP</span>
              <p className="text-sm font-mono font-semibold text-[#111827] mt-0.5">{participant.phone}</p>
            </div>

            <div>
              <span className="text-[#6B7280] font-medium block">Waktu Registrasi (WIB)</span>
              <p className="text-sm font-semibold text-[#111827] mt-0.5">
                {formatWibDateTime(participant.createdAt)}
              </p>
            </div>

            <div>
              <span className="text-[#6B7280] font-medium block">Status Kehadiran</span>
              <div className="mt-1">
                {participant.hasCheckedIn ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    <CheckCircle size={14} weight="fill" />
                    <span>Sudah Hadir ({formatWibDateTime(participant.checkedInAt || undefined)})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-200">
                    <Clock size={14} />
                    <span>Belum Check-in</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* QR Code and Check-in Info */}
          <div className="pt-5 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-white rounded-xl border border-[#D1D5DB] shadow-xs shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR ${participant.ticketNumber}`}
                  className="w-32 h-32 object-contain"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center text-gray-400">
                  <QrCode size={36} />
                </div>
              )}
            </div>

            <div className="space-y-2 text-[#4B5563]">
              <h3 className="font-bold text-sm text-[#111827]">Informasi Tiket & Gate Masuk</h3>
              <p className="leading-relaxed">
                Kode QR ini ditujukan untuk pemindaian scanner petugas check-in di pintu masuk hall acara.
              </p>
              <div className="text-[11px] font-mono text-[#6B7280]">
                Tautan Akses: /tiket/{participant.ticketAccessToken.substring(0, 16)}...
              </div>
            </div>
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
