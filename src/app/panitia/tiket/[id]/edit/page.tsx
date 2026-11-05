'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  getAdminTicketAction,
  saveTicketAction,
  TicketTypeAdminDTO,
  TicketAdminStatus,
} from '@/app/actions/tickets';
import { DateTimePicker24 } from '@/components/admin/DateTimePicker24';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, FloppyDisk, Lock, Users, Warning } from '@phosphor-icons/react';

function EditTicketTypeContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [ticket, setTicket] = useState<TicketTypeAdminDTO | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLimited, setIsLimited] = useState(true);
  const [capacity, setCapacity] = useState<number>(100);
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [status, setStatus] = useState<TicketAdminStatus>('published');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminTicketAction(ticketId).then((res) => {
      if (res.success && res.ticket) {
        const t = res.ticket;
        setTicket(t);
        setName(t.name);
        setDescription(t.description || '');
        setIsLimited(t.capacity !== null);
        setCapacity(t.capacity || 100);
        setOpensAt(t.registrationOpenAt);
        setClosesAt(t.registrationCloseAt);
        setStatus(t.status);
      } else {
        toastError('Gagal Memuat Tiket', res.error || 'Tiket tidak ditemukan.');
      }
      setLoading(false);
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

    if (isLimited && Number(capacity) < ticket.activeCount) {
      setErrorMsg(
        `Kapasitas baru (${capacity}) tidak boleh lebih kecil dari jumlah peserta aktif saat ini (${ticket.activeCount} peserta).`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await saveTicketAction({
        id: ticket.id,
        name: name.trim(),
        description: description.trim() || undefined,
        capacity: isLimited ? Number(capacity) : null,
        registrationOpenAt: opensAt,
        registrationCloseAt: closesAt,
        status,
      });

      if (res.success) {
        success('Perubahan Tiket Disimpan', `Jenis tiket "${name}" telah diperbarui.`);
        router.push('/panitia/tiket');
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan perubahan tiket.');
        toastError('Gagal Menyimpan', res.error || 'Terjadi kesalahan sistem.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan tiket.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Edit Jenis Tiket" adminOnly={true}>
        <div className="text-center py-20 text-xs text-[#6B7280]">
          <div className="inline-block w-6 h-6 border-2 border-[#891523] border-t-transparent rounded-full animate-spin mb-2" />
          <div>Memuat data tiket...</div>
        </div>
      </AdminShell>
    );
  }

  if (!ticket) {
    return (
      <AdminShell title="Edit Jenis Tiket" adminOnly={true}>
        <div className="text-center py-20 text-xs text-[#6B7280]">
          <p>Jenis tiket tidak ditemukan atau telah dihapus.</p>
          <div className="pt-4">
            <Link
              href="/panitia/tiket"
              className="px-4 py-2 rounded-lg bg-[#891523] text-white font-medium"
            >
              Kembali ke Daftar Tiket
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Edit Tiket: ${ticket.name}`} adminOnly={true}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/panitia/tiket"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] py-1 px-2.5 rounded-lg border border-[#E5E7EB] bg-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Tiket</span>
          </Link>
          <Link
            href={`/panitia/peserta?ticketId=${ticket.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-[#891523] hover:underline font-semibold"
          >
            <Users size={14} />
            <span>Lihat {ticket.activeCount} Peserta Terdaftar</span>
          </Link>
        </div>

        {ticket.activeCount > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
            <Warning size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Perhatian Terkait Kapasitas Tiket:</p>
              <p className="mt-0.5 leading-relaxed">
                Saat ini terdapat <strong>{ticket.activeCount} peserta aktif</strong> yang memegang tiket ini. Anda tidak dapat menurunkan kuota kapasitas di bawah angka peserta aktif.
              </p>
            </div>
          </div>
        )}

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

            {/* Price locked */}
            <div>
              <label className="block font-semibold text-[#374151] mb-1 flex items-center gap-1">
                <span>HARGA TIKET</span>
                <Lock size={12} className="text-[#9CA3AF]" />
              </label>
              <input
                type="text"
                disabled
                value="Gratis / Rp0 (Permanen Tanpa Pembayaran)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-semibold cursor-not-allowed"
              />
            </div>

            {/* Quota limit toggle */}
            <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#374151] block">Batasi Kuota Pendaftaran?</span>
                  <span className="text-[11px] text-[#6B7280]">
                    {isLimited
                      ? `Kuota dibatasi dengan angka maksimal (Minimal: ${ticket.activeCount} kursi).`
                      : 'Kapasitas tanpa batas (unlimited).'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLimited}
                    onChange={(e) => setIsLimited(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#891523]"></div>
                </label>
              </div>

              {isLimited && (
                <div className="pt-2 border-t border-[#E5E7EB]">
                  <label className="block font-semibold text-[#374151] mb-1">JUMLAH KUOTA KURSI *</label>
                  <input
                    type="number"
                    min={ticket.activeCount > 0 ? ticket.activeCount : 1}
                    required={isLimited}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#891523]"
                  />
                  <span className="text-[10px] text-[#6B7280] block mt-1">
                    Peserta aktif saat ini: {ticket.activeCount}. Sisa kuota baru: {Math.max(0, capacity - ticket.activeCount)} kursi.
                  </span>
                </div>
              )}
            </div>

            {/* Registration Period (WIB) */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-4">
              <span className="font-semibold text-[#374151] block border-b border-[#E5E7EB] pb-2">
                Periode Pendaftaran Tiket (WIB)
              </span>

              <DateTimePicker24
                label="Buka Pendaftaran"
                required={true}
                valueIso={opensAt}
                onChangeIso={setOpensAt}
                helperText="Tiket berstatus 'Upcoming' sebelum waktu pembukaan ini."
              />

              <DateTimePicker24
                label="Tutup Pendaftaran"
                required={true}
                valueIso={closesAt}
                onChangeIso={setClosesAt}
                helperText="Tiket berstatus 'Closed' setelah waktu penutupan ini."
              />
            </div>

            {/* Publication / Admin Status */}
            <div>
              <label className="block font-semibold text-[#374151] mb-1">STATUS ADMIN *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketAdminStatus)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#891523] bg-white"
              >
                <option value="published">Published (Dapat dilihat mahasiswa di /daftar)</option>
                <option value="draft">Draft (Disembunyikan dari publik)</option>
                <option value="archived">Archived (Diarsipkan — tiket terbit tetap berlaku)</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E7EB]">
              <Link
                href="/panitia/tiket"
                className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB] font-medium transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#891523] text-white font-semibold hover:bg-[#720e1a] shadow-xs disabled:opacity-50 transition-colors"
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
