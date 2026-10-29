'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ticketAdapter, participantAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { TicketType } from '@/types';
import { formatWibDateTime } from '@/lib/date';
import { useToast } from '@/components/ui/Toast';
import { Plus, PencilSimple, Ticket, Users, CheckCircle, EyeSlash } from '@phosphor-icons/react';

export default function AdminTicketListPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketType[]>(mockStore.getTickets());
  const { success } = useToast();

  const loadTickets = () => {
    ticketAdapter.listTickets().then(setTickets);
  };

  useEffect(() => {
    loadTickets();
    const unsubscribe = mockStore.subscribe(loadTickets);
    return () => unsubscribe();
  }, []);

  const handleTogglePublish = async (t: TicketType) => {
    const newStatus = t.publication === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await ticketAdapter.saveTicket({ ...t, publication: newStatus });
    success(
      newStatus === 'PUBLISHED' ? 'Tiket Dipublikasikan' : 'Tiket Disembunyikan',
      `Jenis tiket "${t.name}" ${
        newStatus === 'PUBLISHED'
          ? 'sekarang dapat dipilih oleh mahasiswa di /daftar.'
          : 'disembunyikan dari pemilihan publik.'
      }`
    );
  };

  return (
    <AdminShell title="Kelola Jenis Tiket Acara" adminOnly={true}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Daftar Kategori Tiket Gratis</h2>
            <p className="text-xs text-[#6B7280]">
              Panitia dapat menerbitkan beberapa jenis tiket gratis dengan kuota dan periode registrasi masing-masing.
            </p>
          </div>
          <Link
            href="/panitia/tiket/baru"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs self-start sm:self-auto"
          >
            <Plus size={16} weight="bold" />
            <span>Tambah Jenis Tiket</span>
          </Link>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama Jenis Tiket</th>
                  <th className="py-3.5 px-4">Harga</th>
                  <th className="py-3.5 px-4">Kuota / Terpakai</th>
                  <th className="py-3.5 px-4">Periode Pendaftaran (WIB)</th>
                  <th className="py-3.5 px-4">Publikasi</th>
                  <th className="py-3.5 px-4">Status Publik</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {tickets.map((t) => {
                  const remaining = ticketAdapter.getRemainingQuota(t.id);
                  const availability = ticketAdapter.getTicketAvailability(t);
                  const activeCount =
                    t.capacity !== null && remaining !== null ? t.capacity - remaining : 0;

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
                          <span className="text-[#374151] font-semibold">Tanpa Batas</span>
                        ) : (
                          <div>
                            <span className="font-bold text-[#111827]">{activeCount}</span>
                            <span className="text-[#6B7280]"> / {t.capacity}</span>
                            <span className="text-[10px] text-emerald-600 block">
                              Sisa: {remaining} kursi
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#4B5563]">
                        <div>Buka: {formatWibDateTime(t.registrationOpensAt)}</div>
                        <div>Tutup: {formatWibDateTime(t.registrationClosesAt)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.publication === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {t.publication === 'PUBLISHED' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-[#374151]">
                          {availability}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePublish(t)}
                            className="px-2.5 py-1 rounded text-[11px] font-medium border border-[#E5E7EB] hover:bg-[#F3F4F6]"
                            title={t.publication === 'PUBLISHED' ? 'Tutup dari Publik' : 'Buka ke Publik'}
                          >
                            {t.publication === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link
                            href={`/panitia/peserta?ticketId=${t.id}`}
                            className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#4B5563]"
                            title="Lihat Pendaftar Tiket Ini"
                          >
                            <Users size={16} />
                          </Link>
                          <Link
                            href={`/panitia/tiket/${t.id}/edit`}
                            className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#374151]"
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
        </div>
      </div>
    </AdminShell>
  );
}
