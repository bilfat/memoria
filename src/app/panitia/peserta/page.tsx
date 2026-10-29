'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { participantAdapter, ticketAdapter, votingAdapter, checkinAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { Participant, TicketType, TicketIdentity, Voting, CheckinRecord, VoteRecord } from '@/types';
import { exportParticipantsToXlsx } from '@/lib/xlsxExport';
import { formatWibDateTime } from '@/lib/date';
import { useToast } from '@/components/ui/Toast';
import {
  FileXls,
  MagnifyingGlass,
  Funnel,
  PencilSimple,
  Trash,
  ArrowClockwise,
  EnvelopeSimple,
  Eye,
  CheckCircle,
  WarningCircle,
  X,
  Lock,
} from '@phosphor-icons/react';

function ParticipantsContent() {
  const searchParams = useSearchParams();
  const filterTicketId = searchParams.get('ticketId') || '';

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [participants, setParticipants] = useState<Participant[]>(mockStore.getParticipants());
  const [tickets, setTickets] = useState<TicketType[]>(mockStore.getTickets());
  const [votings, setVotings] = useState<Voting[]>(mockStore.getVotings());
  const [checkins, setCheckins] = useState<CheckinRecord[]>(mockStore.getCheckinRecords());
  const [ticketIdentities, setTicketIdentities] = useState<TicketIdentity[]>(mockStore.getParticipants().map((p) => mockStore.getTicketIdentity(p.id)!));

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketFilter, setSelectedTicketFilter] = useState(filterTicketId);
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'HADIR' | 'BELUM'>('ALL');

  // Two-step Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStep, setEditStep] = useState<1 | 2>(1);
  const [editingTarget, setEditingTarget] = useState<Participant | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    nim: '',
    email: '',
    phone: '',
    ticketTypeId: '',
  });
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Two-step Archive Modal
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveStep, setArchiveStep] = useState<1 | 2>(1);
  const [archiveTarget, setArchiveTarget] = useState<Participant | null>(null);
  const [archivePassword, setArchivePassword] = useState('');
  const [archiveConfirmText, setArchiveConfirmText] = useState('');
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);

  // Restore Modal
  const [restoreTarget, setRestoreTarget] = useState<Participant | null>(null);
  const [restoring, setRestoring] = useState(false);

  const { success, error, info } = useToast();

  const loadAll = () => {
    participantAdapter.listParticipants().then(setParticipants);
    ticketAdapter.listTickets().then(setTickets);
    votingAdapter.listVotings().then(setVotings);
    checkinAdapter.listRecords().then(setCheckins);
  };

  useEffect(() => {
    loadAll();
    const unsubscribe = mockStore.subscribe(loadAll);
    return () => unsubscribe();
  }, []);

  // Filtered dataset
  const currentList = participants.filter((p) => p.status === activeTab);
  const filteredList = currentList.filter((p) => {
    // Search query
    const q = searchQuery.trim().toLowerCase();
    const matchQuery = !q || p.fullName.toLowerCase().includes(q) || p.nim.includes(q);

    // Ticket filter
    const matchTicket = !selectedTicketFilter || p.ticketTypeId === selectedTicketFilter;

    // Attendance filter
    const hasCheckin = checkins.some(
      (c) => c.subjectType === 'MAHASISWA' && c.subjectId === p.id
    );
    let matchAttendance = true;
    if (attendanceFilter === 'HADIR') matchAttendance = hasCheckin;
    if (attendanceFilter === 'BELUM') matchAttendance = !hasCheckin;

    return matchQuery && matchTicket && matchAttendance;
  });

  // --- ACTIONS ---
  const handleExportXlsx = () => {
    const allIdentities = participants.map((p) => mockStore.getTicketIdentity(p.id)!);
    const allVotes = mockStore.getVotings().flatMap((v) => mockStore.getVoteRecordsByVotingId(v.id));

    exportParticipantsToXlsx({
      participants: filteredList,
      tickets,
      identities: allIdentities,
      votings,
      voteRecords: allVotes,
      checkinRecords: checkins,
      filenamePrefix: `MEMORIA-Peserta-${activeTab}`,
    });

    success(
      'Ekspor Excel Berhasil',
      `Telah mengunduh berkas .xlsx resmi untuk ${filteredList.length} peserta.`
    );
  };

  const handleResendEmail = (p: Participant) => {
    info(
      'Simulasi Email Terkirim',
      `E-ticket PDF resmi telah dikirim ulang ke alamat ${p.email}.`
    );
  };

  // Two-step Edit flow
  const handleOpenEdit = (p: Participant) => {
    setEditingTarget(p);
    setEditForm({
      fullName: p.fullName,
      nim: p.nim,
      email: p.email,
      phone: p.phone,
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
      await participantAdapter.updateParticipant(editingTarget.id, editForm, adminPasswordConfirm);
      success(
        'Data Peserta Diperbarui',
        `Perubahan data untuk ${editForm.fullName} (${editForm.nim}) berhasil disimpan.`
      );
      setEditModalOpen(false);
    } catch (err: any) {
      setEditError(err.message || 'Verifikasi password salah.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Two-step Archive flow
  const handleOpenArchive = (p: Participant) => {
    setArchiveTarget(p);
    setArchiveStep(1);
    setArchivePassword('');
    setArchiveConfirmText('');
    setArchiveReason('Pembatalan atas permintaan');
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
      await participantAdapter.archiveParticipant(archiveTarget.id, archivePassword, archiveReason);
      success(
        'Peserta Diarsipkan',
        `${archiveTarget.fullName} dipindahkan ke Arsip. Kuota tiket telah dikembalikan.`
      );
      setArchiveModalOpen(false);
    } catch (err: any) {
      setArchiveError(err.message || 'Password otorisasi salah.');
    } finally {
      setArchiveSubmitting(false);
    }
  };

  // Restore flow
  const handleRestore = async (p: Participant) => {
    setRestoring(true);
    try {
      await participantAdapter.restoreParticipant(p.id);
      success(
        'Peserta Dipulihkan',
        `${p.fullName} berhasil dipulihkan ke Peserta Aktif dengan identitas tiket semula.`
      );
      setRestoreTarget(null);
    } catch (err: any) {
      error('Gagal Memulihkan', err.message || 'Kapasitas tiket tidak mencukupi.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#111827]">
            Manajemen Data Peserta & Kehadiran
          </h2>
          <p className="text-xs text-[#6B7280]">
            Pantau status check-in dan riwayat voting real-time seluruh mahasiswa terdaftar.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white border border-[#E5E7EB] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ACTIVE'
                ? 'bg-[#891523] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Peserta Aktif ({participants.filter((p) => p.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setActiveTab('ARCHIVED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ARCHIVED'
                ? 'bg-[#891523] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Arsip Peserta ({participants.filter((p) => p.status === 'ARCHIVED').length})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama atau NIM..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
            />
          </div>

          {/* Ticket Type Filter */}
          <select
            value={selectedTicketFilter}
            onChange={(e) => setSelectedTicketFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white text-[#374151] focus:outline-none"
          >
            <option value="">Semua Jenis Tiket</option>
            {tickets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Attendance Filter (Active only) */}
          {activeTab === 'ACTIVE' && (
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white text-[#374151] focus:outline-none"
            >
              <option value="ALL">Semua Kehadiran</option>
              <option value="HADIR">Sudah Hadir</option>
              <option value="BELUM">Belum Check-in</option>
            </select>
          )}
        </div>

        {/* Action: Real XLSX Export Button */}
        <button
          onClick={handleExportXlsx}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <FileXls size={16} weight="bold" />
          <span>Ekspor Excel (.xlsx)</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">NIM</th>
                <th className="py-3 px-4">Jenis Tiket</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Kehadiran</th>
                <th className="py-3 px-4">Waktu Check-in</th>
                {/* DYNAMIC VOTING COLUMNS (PRD K-22) */}
                {votings.map((v) => (
                  <th key={v.id} className="py-3 px-4 bg-purple-50/40 text-purple-900">
                    Vote: {v.title}
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredList.length > 0 ? (
                filteredList.map((p) => {
                  const ticket = tickets.find((t) => t.id === p.ticketTypeId);
                  const checkin = checkins.find(
                    (c) => c.subjectType === 'MAHASISWA' && c.subjectId === p.id
                  );
                  const hasCheckedIn = Boolean(checkin);

                  return (
                    <tr key={p.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#111827]">
                        <Link
                          href={`/panitia/peserta/${p.id}`}
                          className="hover:text-[#891523] hover:underline"
                        >
                          {p.fullName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#111827]">{p.nim}</td>
                      <td className="py-3 px-4 text-[#374151]">{ticket ? ticket.name : '—'}</td>
                      <td className="py-3 px-4 text-[11px] text-[#6B7280]">
                        <div>{p.email}</div>
                        <div className="font-mono">{p.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            hasCheckedIn
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {hasCheckedIn ? 'Hadir' : 'Belum Check-in'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#4B5563]">
                        {checkin ? formatWibDateTime(checkin.checkedInAt) : '—'}
                      </td>

                      {/* DYNAMIC VOTE STATUS CELLS */}
                      {votings.map((v) => {
                        const hasVoted = mockStore.hasParticipantVoted(p.id, v.id);
                        return (
                          <td key={v.id} className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                hasVoted
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'text-gray-400'
                              }`}
                            >
                              {hasVoted ? 'Sudah' : 'Belum'}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-3 px-4 text-right">
                        {activeTab === 'ACTIVE' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/panitia/peserta/${p.id}`}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#4B5563]"
                              title="Lihat Detail Peserta"
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              onClick={() => handleResendEmail(p)}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#4B5563]"
                              title="Kirim Ulang Tiket PDF ke Email"
                            >
                              <EnvelopeSimple size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#374151]"
                              title="Edit Data Peserta (2-Step)"
                            >
                              <PencilSimple size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenArchive(p)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"
                              title="Arsipkan Peserta (2-Step)"
                            >
                              <Trash size={15} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRestore(p)}
                            disabled={restoring}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          >
                            <ArrowClockwise size={13} />
                            <span>Pulihkan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7 + votings.length} className="py-12 text-center text-[#9CA3AF]">
                    Tidak ada data peserta ditemukan pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TWO-STEP EDIT MODAL */}
      {editModalOpen && editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#891523] uppercase">
                  VERIFIKASI TAHAP {editStep} DARI 2
                </span>
                <h3 className="text-sm font-bold text-[#111827]">
                  {editStep === 1 ? 'Edit Informasi Peserta' : 'Konfirmasi Password Admin'}
                </h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-[#9CA3AF]">
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {editError}
              </div>
            )}

            {editStep === 1 ? (
              /* Step 1: Edit Form */
              <form onSubmit={handleEditSubmitStep1} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">NAMA LENGKAP</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">NIM MAHASISWA</label>
                  <input
                    type="text"
                    required
                    value={editForm.nim}
                    onChange={(e) => setEditForm({ ...editForm, nim: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] font-mono focus:outline-none"
                  />
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">
                    * Catatan: Nomor tiket, QR Code, dan kode voting tetap identik setelah NIM diubah.
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">JENIS TIKET</label>
                  <select
                    value={editForm.ticketTypeId}
                    onChange={(e) => setEditForm({ ...editForm, ticketTypeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white"
                  >
                    {tickets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">EMAIL</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">NOMOR HP</label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#891523] text-white font-semibold"
                  >
                    Lanjut ke Otorisasi Password →
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Password Confirmation */
              <form onSubmit={handleEditSubmitStep2} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-1">
                  <div className="font-semibold text-[#111827]">Ringkasan Perubahan:</div>
                  <div className="text-[11px] text-[#6B7280]">
                    Nama: {editingTarget.fullName} → <strong>{editForm.fullName}</strong>
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    NIM: {editingTarget.nim} → <strong>{editForm.nim}</strong>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    PASSWORD AKUN ADMIN ANDA *
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    placeholder="Masukkan password admin Anda"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#6B7280] block mt-1">
                    (Password demo bawaan: <code>admin123</code>)
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setEditStep(1)}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563]"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 rounded-lg bg-[#891523] text-white font-semibold disabled:opacity-50"
                  >
                    {editSubmitting ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TWO-STEP ARCHIVE MODAL */}
      {archiveModalOpen && archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-600 uppercase">
                  VERIFIKASI TAHAP {archiveStep} DARI 2
                </span>
                <h3 className="text-sm font-bold text-[#111827]">
                  {archiveStep === 1 ? 'Peringatan Pengarsipan' : 'Otorisasi Penghapusan Data'}
                </h3>
              </div>
              <button onClick={() => setArchiveModalOpen(false)} className="text-[#9CA3AF]">
                <X size={18} />
              </button>
            </div>

            {archiveError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {archiveError}
              </div>
            )}

            {archiveStep === 1 ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <WarningCircle size={18} />
                    <span>Dampak Pengarsipan:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                    <li>Peserta {archiveTarget.fullName} ({archiveTarget.nim}) akan dipindahkan ke tab Arsip.</li>
                    <li>Tiket dan QR Code akan dinonaktifkan (ditolak saat check-in).</li>
                    <li>Satu kuota tiket akan dikembalikan ke kapasitas tersedia.</li>
                    <li>Suara voting dan riwayat kehadiran sebelumnya <strong>tetap dihitung</strong>.</li>
                  </ul>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">ALASAN ARSIP (OPSIONAL)</label>
                  <input
                    type="text"
                    value={archiveReason}
                    onChange={(e) => setArchiveReason(e.target.value)}
                    placeholder="Contoh: Permintaan pembatalan mandiri"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setArchiveModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563]"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiveStep(2)}
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                  >
                    Lanjut ke Tahap 2 →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleArchiveSubmitStep2} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                  Ketik kata <strong className="text-rose-600 font-mono">HAPUS</strong> dan masukkan password admin Anda:
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">KETIK KATA KONFIRMASI</label>
                  <input
                    type="text"
                    required
                    value={archiveConfirmText}
                    onChange={(e) => setArchiveConfirmText(e.target.value)}
                    placeholder="HAPUS"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">PASSWORD ADMIN</label>
                  <input
                    type="password"
                    required
                    value={archivePassword}
                    onChange={(e) => setArchivePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setArchiveStep(1)}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563]"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={archiveSubmitting}
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-50"
                  >
                    {archiveSubmitting ? 'Mengarsipkan...' : 'Arsipkan Peserta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminParticipantsPage() {
  return (
    <AdminShell title="Data Peserta, Edit, Arsip & Ekspor" adminOnly={true}>
      <React.Suspense fallback={<div className="py-20 text-center text-xs text-[#6B7280]">Memuat data...</div>}>
        <ParticipantsContent />
      </React.Suspense>
    </AdminShell>
  );
}
