'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  listAdminParticipantsAction,
  updateParticipantAction,
  archiveParticipantAction,
  restoreParticipantAction,
  ParticipantListItemDTO,
} from '@/app/actions/participants';
import { listAdminTicketsAction, TicketTypeAdminDTO } from '@/app/actions/tickets';
import { createClient } from '@/lib/supabase/client';
import { enqueueTicketResendAction } from '@/app/actions/emails';
import { TELKOM_FACULTIES, TelkomFaculty } from '@/lib/validations';
import { formatWibDateTime, formatWibTimeOnly } from '@/lib/date';
import { useToast } from '@/components/ui/Toast';
import {
  FileXls,
  MagnifyingGlass,
  Funnel,
  PencilSimple,
  Archive,
  ArrowClockwise,
  EnvelopeSimple,
  Eye,
  CheckCircle,
  Clock,
  X,
  Lock,
  Warning,
  ArrowUUpLeft,
} from '@phosphor-icons/react';

function ParticipantsContent() {
  const searchParams = useSearchParams();
  const initialTicketFilter = searchParams.get('ticketId') || '';

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [participants, setParticipants] = useState<ParticipantListItemDTO[]>([]);
  const [ticketOptions, setTicketOptions] = useState<TicketTypeAdminDTO[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [totalArchived, setTotalArchived] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketFilter, setSelectedTicketFilter] = useState(initialTicketFilter);
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'HADIR' | 'BELUM'>('ALL');

  // Two-step Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStep, setEditStep] = useState<1 | 2>(1);
  const [editingTarget, setEditingTarget] = useState<ParticipantListItemDTO | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    nim: '',
    studyProgram: '',
    faculty: 'Fakultas Ilmu Terapan' as TelkomFaculty,
    phone: '',
    email: '',
    ticketTypeId: '',
  });
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Two-step Archive Modal
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveStep, setArchiveStep] = useState<1 | 2>(1);
  const [archiveTarget, setArchiveTarget] = useState<ParticipantListItemDTO | null>(null);
  const [archivePassword, setArchivePassword] = useState('');
  const [archiveConfirmText, setArchiveConfirmText] = useState('');
  const [archiveReason, setArchiveReason] = useState('Permintaan pembatalan peserta');
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);

  // Restore Modal
  const [restoreTarget, setRestoreTarget] = useState<ParticipantListItemDTO | null>(null);
  const [restorePassword, setRestorePassword] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSubmitting, setRestoreSubmitting] = useState(false);

  const { success, error: toastError, info } = useToast();

  const loadParticipants = async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await listAdminParticipantsAction({
      tab: activeTab,
      page,
      pageSize: 25,
      searchQuery,
      ticketTypeId: selectedTicketFilter,
      attendanceFilter,
    });

    if (res.success) {
      setParticipants(res.participants);
      setTotalActive(res.totalActive);
      setTotalArchived(res.totalArchived);
      setTotalFiltered(res.totalFiltered);
      setTotalPages(res.totalPages);
    } else if (!silent) {
      toastError('Gagal Memuat Peserta', res.error || 'Terjadi kesalahan sistem.');
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    // Load ticket categories for filter dropdown
    listAdminTicketsAction().then((res) => {
      if (res.success && res.tickets) {
        setTicketOptions(res.tickets);
      }
    });
  }, []);

  useEffect(() => {
    loadParticipants();

    // Supabase Realtime: dengarkan perubahan tabel participants dan checkins secara live
    const supabase = createClient();
    const channel = supabase
      .channel('realtime:admin-participants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          loadParticipants(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins' },
        () => {
          loadParticipants(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, page, selectedTicketFilter, attendanceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadParticipants();
  };

  const handleExportXlsx = () => {
    const params = new URLSearchParams({
      tab: activeTab,
      attendanceFilter,
    });
    if (selectedTicketFilter) params.set('ticketTypeId', selectedTicketFilter);
    if (searchQuery.trim()) params.set('searchQuery', searchQuery.trim());

    window.open(`/api/admin/participants/export?${params.toString()}`, '_blank');
    success('Mengunduh Excel', 'Berkas XLSX resmi sedang diproses dan diunduh.');
  };

  const handleResendEmail = (p: ParticipantListItemDTO) => {
    startTransition(async () => {
      const res = await enqueueTicketResendAction(p.id);
      if (res.success) {
        info('Antrean Email Dijadwalkan', res.message || 'Tiket telah dijadwalkan ke antrean email.');
      } else {
        toastError('Gagal Menjadwalkan Email', res.error || 'Terjadi kesalahan.');
      }
    });
  };

  // Two-step Edit Handlers
  const handleOpenEdit = (p: ParticipantListItemDTO) => {
    setEditingTarget(p);
    setEditForm({
      fullName: p.fullName,
      nim: p.nim,
      studyProgram: p.studyProgram,
      faculty: p.faculty as TelkomFaculty,
      phone: p.phone,
      email: p.email,
      ticketTypeId: p.ticketTypeId,
    });
    setEditStep(1);
    setAdminPasswordConfirm('');
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleEditSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditStep(2);
  };

  const handleEditSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;
    setEditError(null);
    setEditSubmitting(true);

    try {
      const res = await updateParticipantAction(
        editingTarget.id,
        editForm,
        adminPasswordConfirm
      );

      if (res.success) {
        success(
          'Data Peserta Diperbarui',
          `Perubahan data untuk ${editForm.fullName} (${editForm.nim}) berhasil disimpan.`
        );
        setEditModalOpen(false);
        loadParticipants();
      } else {
        setEditError(res.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      setEditError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Two-step Archive Handlers
  const handleOpenArchive = (p: ParticipantListItemDTO) => {
    setArchiveTarget(p);
    setArchiveStep(1);
    setArchivePassword('');
    setArchiveConfirmText('');
    setArchiveReason('Permintaan pembatalan peserta');
    setArchiveError(null);
    setArchiveModalOpen(true);
  };

  const handleArchiveSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveTarget) return;
    if (archiveConfirmText.trim() !== 'HAPUS') {
      setArchiveError('Ketik kata "HAPUS" persis untuk konfirmasi tindakan.');
      return;
    }
    setArchiveError(null);
    setArchiveSubmitting(true);

    try {
      const res = await archiveParticipantAction(
        archiveTarget.id,
        archiveReason,
        archivePassword
      );

      if (res.success) {
        success(
          'Peserta Diarsipkan',
          `Peserta ${archiveTarget.fullName} telah dipindahkan ke arsip dan kuotanya dilepas.`
        );
        setArchiveModalOpen(false);
        loadParticipants();
      } else {
        setArchiveError(res.error || 'Gagal mengarsipkan peserta.');
      }
    } catch (err: any) {
      setArchiveError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setArchiveSubmitting(false);
    }
  };

  // Restore Handlers
  const handleOpenRestore = (p: ParticipantListItemDTO) => {
    setRestoreTarget(p);
    setRestorePassword('');
    setRestoreError(null);
  };

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreTarget) return;
    setRestoreError(null);
    setRestoreSubmitting(true);

    try {
      const res = await restoreParticipantAction(restoreTarget.id, restorePassword);
      if (res.success) {
        success('Peserta Dipulihkan', `Peserta ${restoreTarget.fullName} berhasil diaktifkan kembali.`);
        setRestoreTarget(null);
        loadParticipants();
      } else {
        setRestoreError(res.error || 'Gagal memulihkan peserta.');
      }
    } catch (err: any) {
      setRestoreError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setRestoreSubmitting(false);
    }
  };

  return (
    <AdminShell title="Kelola Data Peserta" adminOnly={false}>
      <div className="space-y-6 max-w-7xl">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Pendaftar Tiket Mahasiswa</h2>
            <p className="text-xs text-[#6B7280]">
              Kelola data mahasiswa dari 8 fakultas Universitas Telkom, verifikasi check-in, dan ekspor berkas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportXlsx}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <FileXls size={16} weight="bold" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => loadParticipants()}
              disabled={loading || isPending}
              className="p-2 rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#374151] transition-colors"
              title="Segarkan Data"
            >
              <ArrowClockwise size={16} className={loading || isPending ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tab switch: Aktif vs Arsip */}
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('active');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-[#891523] text-white shadow-xs'
                : 'text-[#4B5563] hover:bg-[#F3F4F6]'
            }`}
          >
            <span>Peserta Aktif</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {totalActive}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('archived');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'archived'
                ? 'bg-[#891523] text-white shadow-xs'
                : 'text-[#4B5563] hover:bg-[#F3F4F6]'
            }`}
          >
            <span>Arsip Peserta</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'archived' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {totalArchived}
            </span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan Nama atau NIM..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
            />
          </form>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Ticket type filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7280] font-medium">Tiket:</span>
              <select
                value={selectedTicketFilter}
                onChange={(e) => {
                  setSelectedTicketFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#891523]"
              >
                <option value="">Semua Kategori Tiket</option>
                {ticketOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7280] font-medium">Kehadiran:</span>
              <select
                value={attendanceFilter}
                onChange={(e) => {
                  setAttendanceFilter(e.target.value as any);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#891523]"
              >
                <option value="ALL">Semua Kehadiran</option>
                <option value="HADIR">Sudah Check-in</option>
                <option value="BELUM">Belum Check-in</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-xs text-[#6B7280]">
              <div className="inline-block w-6 h-6 border-2 border-[#891523] border-t-transparent rounded-full animate-spin mb-2" />
              <div>Memuat data peserta...</div>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-20 px-4 space-y-2 text-xs text-[#6B7280]">
              <p className="font-semibold text-sm text-[#111827]">Tidak Ada Data Peserta</p>
              <p>
                {searchQuery || selectedTicketFilter || attendanceFilter !== 'ALL'
                  ? 'Tidak ada peserta yang cocok dengan kriteria filter saat ini.'
                  : activeTab === 'active'
                  ? 'Belum ada mahasiswa yang mendaftar tiket.'
                  : 'Belum ada peserta yang diarsipkan.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Nama Lengkap & Kontak</th>
                    <th className="py-3.5 px-4">NIM</th>
                    <th className="py-3.5 px-4">Program Studi & Fakultas</th>
                    <th className="py-3.5 px-4">Jenis & No. Tiket</th>
                    <th className="py-3.5 px-4">Kehadiran</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {participants.map((p) => {
                    return (
                      <tr key={p.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#111827]">
                          <div className="font-bold">{p.fullName}</div>
                          <div className="text-[11px] text-[#6B7280] font-normal mt-0.5">
                            {p.email} • {p.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#374151]">{p.nim}</td>
                        <td className="py-3.5 px-4 text-[#4B5563]">
                          <div className="font-medium text-[#111827]">{p.studyProgram}</div>
                          <div className="text-[11px] text-[#6B7280]">{p.faculty}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#891523]">{p.ticketTypeName}</div>
                          <div className="text-[11px] font-mono text-[#6B7280]">{p.ticketNumber}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.hasCheckedIn ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle size={12} weight="fill" />
                                <span>Hadir</span>
                              </span>
                              {p.checkedInAt && (
                                <span className="text-[10px] text-[#6B7280] block mt-0.5">
                                  {formatWibTimeOnly(p.checkedInAt)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              <Clock size={12} />
                              <span>Belum Check-in</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/panitia/peserta/${p.id}`}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#4B5563] transition-colors"
                              title="Lihat Detail Peserta"
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              onClick={() => handleResendEmail(p)}
                              disabled={isPending}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#4B5563] transition-colors"
                              title="Kirim Ulang Tiket ke Email"
                            >
                              <EnvelopeSimple size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#374151] transition-colors"
                              title="Edit Data Peserta (2-Step)"
                            >
                              <PencilSimple size={15} />
                            </button>
                            {p.status === 'active' ? (
                              <button
                                onClick={() => handleOpenArchive(p)}
                                className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
                                title="Arsipkan Peserta (2-Step)"
                              >
                                <Archive size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenRestore(p)}
                                className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 transition-colors"
                                title="Pulihkan Peserta dari Arsip"
                              >
                                <ArrowUUpLeft size={15} weight="bold" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
              <div>
                Menampilkan halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> ({totalFiltered} total)
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-md border border-[#D1D5DB] bg-white disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-md border border-[#D1D5DB] bg-white disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-STEP EDIT MODAL */}
      {/* ========================================================================= */}
      {editModalOpen && editingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  {editStep === 1 ? 'Tahap 1: Koreksi Data Peserta' : 'Tahap 2: Verifikasi Password Admin'}
                </h3>
                <span className="text-[11px] text-[#6B7280]">No. Tiket: {editingTarget.ticketNumber}</span>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <X size={16} />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                {editError}
              </div>
            )}

            {editStep === 1 ? (
              <form onSubmit={handleEditSubmitStep1} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">NIM *</label>
                    <input
                      type="text"
                      required
                      value={editForm.nim}
                      onChange={(e) => setEditForm({ ...editForm, nim: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] font-mono focus:outline-none focus:border-[#891523]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Jenis Tiket *</label>
                    <select
                      value={editForm.ticketTypeId}
                      onChange={(e) => setEditForm({ ...editForm, ticketTypeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#891523]"
                    >
                      {ticketOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Program Studi *</label>
                  <input
                    type="text"
                    required
                    value={editForm.studyProgram}
                    onChange={(e) => setEditForm({ ...editForm, studyProgram: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Fakultas *</label>
                  <select
                    value={editForm.faculty}
                    onChange={(e) => setEditForm({ ...editForm, faculty: e.target.value as TelkomFaculty })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#891523]"
                  >
                    {TELKOM_FACULTIES.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Nomor WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] font-mono focus:outline-none focus:border-[#891523]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a]"
                  >
                    Lanjut ke Verifikasi Password →
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEditSubmitStep2} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
                  <p className="font-semibold">Pratinjau Perubahan:</p>
                  <p>
                    Nama: <strong>{editForm.fullName}</strong> | NIM: <strong>{editForm.nim}</strong>
                  </p>
                  <p>
                    Prodi: {editForm.studyProgram} ({editForm.faculty})
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1 flex items-center gap-1">
                    <Lock size={14} className="text-[#891523]" />
                    <span>Masukkan Password Akun Admin Anda *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    placeholder="Password akun admin saat ini..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                  <span className="text-[10px] text-[#6B7280] block mt-1">
                    Sebagai bagian dari keamanan data mahasiswa, perubahan data peserta memerlukan otorisasi ulang.
                  </span>
                </div>

                <div className="pt-3 flex justify-between gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setEditStep(1)}
                    className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    ← Kembali Edit
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a] disabled:opacity-50"
                  >
                    {editSubmitting ? 'Menyimpan...' : 'Konfirmasi Simpan Perubahan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2-STEP ARCHIVE MODAL */}
      {/* ========================================================================= */}
      {archiveModalOpen && archiveTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                <Warning size={18} />
                <span>Arsipkan Peserta ({archiveTarget.fullName})</span>
              </h3>
              <button
                onClick={() => setArchiveModalOpen(false)}
                className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <X size={16} />
              </button>
            </div>

            {archiveError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                {archiveError}
              </div>
            )}

            {archiveStep === 1 ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5 leading-relaxed">
                  <p className="font-bold">Dampak Pengarsipan Peserta:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Kursi kuota tiket akan <strong>dilepas kembali</strong> ke kuota publik.</li>
                    <li>Kode QR dan e-ticket peserta menjadi <strong>tidak valid</strong> untuk check-in.</li>
                    <li>Riwayat dan data tiket tetap tersimpan di database dalam tab Arsip.</li>
                  </ul>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Alasan Pengarsipan *</label>
                  <input
                    type="text"
                    required
                    value={archiveReason}
                    onChange={(e) => setArchiveReason(e.target.value)}
                    placeholder="Contoh: Permintaan pembatalan peserta / salah daftar"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setArchiveModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiveStep(2)}
                    className="px-4 py-2 rounded-lg bg-rose-700 text-white font-semibold hover:bg-rose-800"
                  >
                    Lanjut ke Otorisasi Password →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleArchiveSubmitStep2} className="space-y-4">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Ketik kata <span className="text-rose-700 font-bold">HAPUS</span> untuk konfirmasi:
                  </label>
                  <input
                    type="text"
                    required
                    value={archiveConfirmText}
                    onChange={(e) => setArchiveConfirmText(e.target.value)}
                    placeholder="HAPUS"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] font-mono focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Password Akun Admin Anda *
                  </label>
                  <input
                    type="password"
                    required
                    value={archivePassword}
                    onChange={(e) => setArchivePassword(e.target.value)}
                    placeholder="Masukkan password admin..."
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div className="pt-3 flex justify-between gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setArchiveStep(1)}
                    className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={archiveSubmitting}
                    className="px-4 py-2 rounded-lg bg-rose-700 text-white font-semibold hover:bg-rose-800 disabled:opacity-50"
                  >
                    {archiveSubmitting ? 'Memproses...' : 'Ya, Arsipkan Peserta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESTORE MODAL */}
      {/* ========================================================================= */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-bold text-emerald-800">
                Pulihkan Peserta: {restoreTarget.fullName}
              </h3>
              <button
                onClick={() => setRestoreTarget(null)}
                className="p-1 rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <X size={16} />
              </button>
            </div>

            {restoreError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                {restoreError}
              </div>
            )}

            <p className="text-[#4B5563] leading-relaxed">
              Peserta akan dikembalikan ke status <strong>Aktif</strong>. Tiket dan QR check-in peserta akan kembali berlaku. Sistem akan memeriksa apakah kuota jenis tiket &quot;{restoreTarget.ticketTypeName}&quot; masih tersedia.
            </p>

            <form onSubmit={handleRestoreSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Masukkan Password Admin *
                </label>
                <input
                  type="password"
                  required
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="Password akun admin saat ini..."
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setRestoreTarget(null)}
                  className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={restoreSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {restoreSubmitting ? 'Memeriksa Kuota...' : 'Konfirmasi Pulihkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default function ParticipantsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Memuat data peserta...</div>}>
      <ParticipantsContent />
    </Suspense>
  );
}
