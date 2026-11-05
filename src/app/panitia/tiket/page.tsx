'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  listAdminTicketsAction,
  toggleTicketPublishAction,
  archiveTicketAction,
  TicketTypeAdminDTO,
} from '@/app/actions/tickets';
import { createClient } from '@/lib/supabase/client';
import { formatWibDateTime } from '@/lib/date';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  PencilSimple,
  Ticket,
  Users,
  Archive,
  ArrowClockwise,
} from '@phosphor-icons/react';

export default function AdminTicketListPage() {
  const [tickets, setTickets] = useState<TicketTypeAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  const loadTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await listAdminTicketsAction();
    if (res.success && res.tickets) {
      setTickets(res.tickets);
    } else if (!silent) {
      toastError('Gagal Memuat Tiket', res.error || 'Terjadi kesalahan sistem.');
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    loadTickets();

    // Supabase Realtime: dengarkan perubahan tabel tickets dan participants secara live
    const supabase = createClient();
    const channel = supabase
      .channel('realtime:admin-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          loadTickets(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          loadTickets(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTogglePublish = (t: TicketTypeAdminDTO) => {
    if (t.status === 'archived') {
      toastError(
        'Tiket Diarsipkan',
        'Tiket yang diarsipkan tidak dapat di-toggle langsung. Buka halaman Edit untuk mengubah statusnya.'
      );
      return;
    }

    startTransition(async () => {
      const res = await toggleTicketPublishAction(t.id);
      if (res.success && res.newStatus) {
        success(
          res.newStatus === 'published' ? 'Tiket Dipublikasikan' : 'Tiket Disembunyikan',
          `Jenis tiket "${t.name}" sekarang berstatus ${res.newStatus === 'published' ? 'Published' : 'Draft'}.`
        );
        loadTickets();
      } else {
        toastError('Gagal Mengubah Status', res.error || 'Terjadi kesalahan sistem.');
      }
    });
  };

  const handleArchive = (t: TicketTypeAdminDTO) => {
    if (t.status === 'archived') return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin mengarsipkan jenis tiket "${t.name}"?\n\nCatatan: Tiket yang sudah diterbitkan kepada peserta tetap berlaku dan dapat digunakan untuk check-in.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const res = await archiveTicketAction(t.id);
      if (res.success) {
        success(
          'Tiket Diarsipkan',
          `Jenis tiket "${t.name}" berhasil dipindahkan ke status arsip.`
        );
        loadTickets();
      } else {
        toastError('Gagal Mengarsipkan', res.error || 'Terjadi kesalahan sistem.');
      }
    });
  };

  return (
    <AdminShell title="Kelola Jenis Tiket Acara" adminOnly={true}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Daftar Kategori Tiket Gratis</h2>
            <p className="text-xs text-[#6B7280]">
              Panitia dapat menerbitkan jenis tiket gratis dengan kuota dan periode registrasi masing-masing.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => loadTickets()}
              disabled={loading || isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-xs font-medium text-[#374151] transition-colors"
              title="Muat Ulang Data"
            >
              <ArrowClockwise size={14} className={loading || isPending ? 'animate-spin' : ''} />
              <span>Segarkan</span>
            </button>
            <Link
              href="/panitia/tiket/baru"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus size={16} weight="bold" />
              <span>Tambah Jenis Tiket</span>
            </Link>
          </div>
        </div>

        {/* Tickets Table / State */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-xs text-[#6B7280]">
              <div className="inline-block w-6 h-6 border-2 border-[#891523] border-t-transparent rounded-full animate-spin mb-2" />
              <div>Memuat data jenis tiket dari database...</div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAEDEF] border border-[#891523]/20 text-[#891523] flex items-center justify-center mx-auto">
                <Ticket size={24} weight="duotone" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Belum Ada Jenis Tiket</h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                Belum ada kategori tiket yang dibuat. Tambahkan jenis tiket pertama untuk membuka pendaftaran mahasiswa.
              </p>
              <div className="pt-2">
                <Link
                  href="/panitia/tiket/baru"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs"
                >
                  <Plus size={14} weight="bold" />
                  <span>Buat Tiket Sekarang</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Nama Jenis Tiket</th>
                    <th className="py-3.5 px-4">Harga</th>
                    <th className="py-3.5 px-4">Kuota / Terpakai</th>
                    <th className="py-3.5 px-4">Periode Pendaftaran (WIB)</th>
                    <th className="py-3.5 px-4">Status Admin</th>
                    <th className="py-3.5 px-4">Status Publik</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {tickets.map((t) => {
                    return (
                      <tr key={t.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#111827]">
                          <div>{t.name}</div>
                          {t.description && (
                            <div className="text-[11px] text-[#6B7280] font-normal truncate max-w-xs mt-0.5">
                              {t.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-700">Gratis (Rp0)</td>
                        <td className="py-3.5 px-4 font-mono">
                          {t.capacity === null ? (
                            <div>
                              <span className="text-[#374151] font-semibold">Tanpa Batas</span>
                              <span className="text-[10px] text-[#6B7280] block">
                                {t.activeCount} peserta aktif
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-[#111827]">{t.activeCount}</span>
                              <span className="text-[#6B7280]"> / {t.capacity}</span>
                              <span
                                className={`text-[10px] block ${
                                  (t.remainingQuota ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600 font-bold'
                                }`}
                              >
                                Sisa: {t.remainingQuota ?? 0} kursi
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-[#4B5563]">
                          <div>Buka: {formatWibDateTime(t.registrationOpenAt)}</div>
                          <div>Tutup: {formatWibDateTime(t.registrationCloseAt)}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              t.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : t.status === 'draft'
                                ? 'bg-gray-100 text-gray-700 border border-gray-300'
                                : 'bg-amber-50 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {t.status === 'published'
                              ? 'Published'
                              : t.status === 'draft'
                              ? 'Draft'
                              : 'Archived'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              t.derivedStatus === 'open'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : t.derivedStatus === 'upcoming'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : t.derivedStatus === 'sold_out'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {t.derivedStatusLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {t.status !== 'archived' && (
                              <button
                                onClick={() => handleTogglePublish(t)}
                                disabled={isPending}
                                className="px-2.5 py-1 rounded text-[11px] font-medium border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
                                title={t.status === 'published' ? 'Sembunyikan dari Publik' : 'Buka ke Publik'}
                              >
                                {t.status === 'published' ? 'Unpublish' : 'Publish'}
                              </button>
                            )}
                            {t.status !== 'archived' && (
                              <button
                                onClick={() => handleArchive(t)}
                                disabled={isPending}
                                className="p-1.5 rounded-md hover:bg-amber-50 text-amber-700 transition-colors"
                                title="Arsipkan Jenis Tiket"
                              >
                                <Archive size={15} />
                              </button>
                            )}
                            <Link
                              href={`/panitia/peserta?ticketId=${t.id}`}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#4B5563] transition-colors"
                              title="Lihat Pendaftar Tiket Ini"
                            >
                              <Users size={16} />
                            </Link>
                            <Link
                              href={`/panitia/tiket/${t.id}/edit`}
                              className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#374151] transition-colors"
                              title="Edit Jenis Tiket"
                            >
                              <PencilSimple size={16} />
                            </Link>
                          </div>
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
