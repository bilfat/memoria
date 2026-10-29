'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ticketAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { TicketType } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, FloppyDisk, Lock } from '@phosphor-icons/react';

function EditTicketTypeContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const router = useRouter();
  const { success } = useToast();

  const [ticket, setTicket] = useState<TicketType | undefined>(undefined);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLimited, setIsLimited] = useState(true);
  const [capacity, setCapacity] = useState<number>(100);
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [publication, setPublication] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    ticketAdapter.getTicket(ticketId).then((t) => {
      if (t) {
        setTicket(t);
        setName(t.name);
        setDescription(t.description || '');
        setIsLimited(t.capacity !== null);
        setCapacity(t.capacity || 100);
        setOpensAt(t.registrationOpensAt.substring(0, 16));
        setClosesAt(t.registrationClosesAt.substring(0, 16));
        setPublication(t.publication);
      }
    });
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setErrorMsg(null);

    if (new Date(closesAt) <= new Date(opensAt)) {
      setErrorMsg('Waktu penutupan pendaftaran harus lebih akhir dari waktu pembukaan.');
      return;
    }

    setSubmitting(true);
    try {
      await ticketAdapter.saveTicket({
        id: ticket.id,
        name: name.trim(),
        description: description.trim(),
        price: 0,
        capacity: isLimited ? Number(capacity) : null,
        registrationOpensAt: `${opensAt}:00+07:00`,
        registrationClosesAt: `${closesAt}:00+07:00`,
        publication,
      });

      success('Perubahan Tiket Disimpan', `Jenis tiket "${name}" telah diperbarui.`);
      router.push('/panitia/tiket');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan tiket.');
      setSubmitting(false);
    }
  };

  if (!ticket) {
    return (
      <AdminShell title="Edit Jenis Tiket" adminOnly={true}>
        <div className="text-center py-20 text-xs text-[#6B7280]">Memuat data tiket...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Edit Tiket: ${ticket.name}`} adminOnly={true}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/panitia/tiket"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] py-1 px-2.5 rounded-lg border border-[#E5E7EB] bg-white"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Tiket</span>
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#111827] border-b border-[#E5E7EB] pb-3">
            Perbarui Informasi Tiket
          </h2>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">NAMA JENIS TIKET *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">DESKRIPSI TIKET</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1 flex items-center gap-1">
                <span>HARGA TIKET</span>
                <Lock size={12} className="text-[#9CA3AF]" />
              </label>
              <input
                type="text"
                disabled
                value="Gratis / Rp0"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-semibold cursor-not-allowed"
              />
            </div>

            {/* Quota limit toggle */}
            <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#374151] block">Batasi Kuota Pendaftaran?</span>
                  <span className="text-[11px] text-[#6B7280]">
                    {isLimited ? 'Kuota dibatasi dengan angka maksimal.' : 'Kapasitas tanpa batas (unlimited).'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isLimited}
                  onChange={(e) => setIsLimited(e.target.checked)}
                  className="w-4 h-4 text-[#891523] rounded-sm focus:ring-[#891523]"
                />
              </div>

              {isLimited && (
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">JUMLAH KUOTA KURSI *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#891523]"
                  />
                </div>
              )}
            </div>

            {/* Registration Period (WIB) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  BUKA PENDAFTARAN (WIB) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  TUTUP PENDAFTARAN (WIB) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] focus:outline-none"
                />
              </div>
            </div>

            {/* Publication Status */}
            <div>
              <label className="block font-semibold text-[#374151] mb-1">STATUS PUBLIKASI</label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="editPublication"
                    checked={publication === 'DRAFT'}
                    onChange={() => setPublication('DRAFT')}
                    className="text-[#891523]"
                  />
                  <span>Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="editPublication"
                    checked={publication === 'PUBLISHED'}
                    onChange={() => setPublication('PUBLISHED')}
                    className="text-[#891523]"
                  />
                  <span className="font-semibold text-emerald-700">Published</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E7EB]">
              <Link
                href="/panitia/tiket"
                className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a] shadow-xs disabled:opacity-50"
              >
                <FloppyDisk size={16} />
                <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}

export default function EditTicketTypePage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Memuat formulir tiket...</div>}>
      <EditTicketTypeContent {...props} />
    </Suspense>
  );
}
