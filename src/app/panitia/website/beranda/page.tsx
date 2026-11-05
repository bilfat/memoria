'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getPublicEventSettings, updateEventSettingsAction, EventSettingsDTO } from '@/app/actions/cms';
import { DateTimePicker24, EventSchedulePreviewBox } from '@/components/admin/DateTimePicker24';
import { useToast } from '@/components/ui/Toast';
import { FloppyDisk, ArrowSquareOut } from '@phosphor-icons/react';
import Link from 'next/link';

export default function EditBerandaContentPage() {
  const [event, setEvent] = useState<EventSettingsDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    getPublicEventSettings()
      .then(setEvent)
      .catch((err) => toastError('Gagal Memuat Data', err.message));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSaving(true);
    try {
      const res = await updateEventSettingsAction(event);
      if (!res.success) throw new Error(res.message);
      success('Perubahan Berhasil Disimpan', 'Jadwal dan identitas acara telah diperbarui ke Supabase.');
    } catch (err: any) {
      toastError('Gagal Menyimpan', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <AdminShell title="Informasi Acara (Beranda MEMORIA)" adminOnly={true}>
        <div className="py-12 text-center text-xs text-neutral-400">Memuat konfigurasi acara dari database...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Informasi Acara (Beranda MEMORIA)" adminOnly={true}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Informasi Utama & Jadwal Acara
            </h2>
            <p className="text-xs text-[#6B7280]">
              Pengaturan satu sumber waktu resmi untuk Beranda, Countdown panggung, e-ticket, dan surat undangan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs text-[#374151] hover:bg-[#F9FAFB]"
            >
              <ArrowSquareOut size={15} />
              <span>Lihat Publik</span>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FloppyDisk size={16} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Event Identity */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Identitas Acara
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                NAMA EVENT *
              </label>
              <input
                type="text"
                required
                value={event.eventName}
                onChange={(e) => setEvent({ ...event, eventName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                TAGLINE
              </label>
              <input
                type="text"
                value={event.tagline}
                onChange={(e) => setEvent({ ...event, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              DESKRIPSI ACARA
            </label>
            <textarea
              rows={3}
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>
        </div>

        {/* Section 2: Precise 24-Hour Schedule (WIB) with DatePicker */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Jadwal Acara & Waktu Resmi (Asia/Jakarta)
          </h3>

          <div className="max-w-md">
            <DateTimePicker24
              label="Waktu Acara"
              required={true}
              valueIso={event.eventStartAt}
              onChangeIso={(newIso) => setEvent({ ...event, eventStartAt: newIso })}
              helperText="Digunakan untuk patokan timer countdown dan jam acara di Beranda & Tiket."
            />
          </div>

          {/* Automatic Realtime Schedule Summary Preview */}
          <EventSchedulePreviewBox
            startIso={event.eventStartAt}
          />
        </div>

        {/* Section 3: Venue & Location */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Lokasi & Venue Acara
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                NAMA VENUE / GEDUNG *
              </label>
              <input
                type="text"
                required
                value={event.venueName}
                onChange={(e) => setEvent({ ...event, venueName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                ALAMAT LENGKAP
              </label>
              <input
                type="text"
                value={event.venueAddress}
                onChange={(e) => setEvent({ ...event, venueAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              TEKS FOOTER
            </label>
            <input
              type="text"
              value={event.footerText}
              onChange={(e) => setEvent({ ...event, footerText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
