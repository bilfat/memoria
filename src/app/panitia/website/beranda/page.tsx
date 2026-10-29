'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { EventContent } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { FloppyDisk, ArrowSquareOut, Sparkle } from '@phosphor-icons/react';
import Link from 'next/link';

export default function EditBerandaContentPage() {
  const [event, setEvent] = useState<EventContent>(mockStore.getEvent());
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    eventAdapter.getEvent().then(setEvent);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await eventAdapter.updateEvent(event);
      success('Perubahan Berhasil Disimpan', 'Konten Beranda dan hero publik telah diperbarui seketika.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Kelola Konten Beranda & Informasi Acara" adminOnly={true}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Informasi Utama & Teaser Acara
            </h2>
            <p className="text-xs text-[#6B7280]">
              Perubahan pada form ini langsung ditampilkan pada Beranda, Countdown, surat undangan, dan PDF tiket.
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              <FloppyDisk size={16} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Event Identity */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Identitas & Jadwal Acara
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                NAMA EVENT
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
                TAGLINE / SUBTITEL
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
              DESKRIPSI LENGKAP ACARA
            </label>
            <textarea
              rows={3}
              required
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                WAKTU MULAI ACARA (WIB)
              </label>
              <input
                type="datetime-local"
                required
                value={event.eventStartAt.substring(0, 16)}
                onChange={(e) => setEvent({ ...event, eventStartAt: `${e.target.value}:00+07:00` })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                NAMA VENUE / GEDUNG
              </label>
              <input
                type="text"
                required
                value={event.venueName}
                onChange={(e) => setEvent({ ...event, venueName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              ALAMAT LENGKAP LOKASI
            </label>
            <input
              type="text"
              required
              value={event.venueAddress}
              onChange={(e) => setEvent({ ...event, venueAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>
        </div>

        {/* Section 2: Chapter Teasers on Home */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Konten Teaser Bab Acara
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Fashion Show Teaser */}
            <div className="space-y-3 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
              <span className="text-xs font-bold text-[#891523] uppercase tracking-wider">
                Teaser Fashion Show
              </span>
              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  JUDUL TEASER
                </label>
                <input
                  type="text"
                  value={event.fashionTeaser.title}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      fashionTeaser: { ...event.fashionTeaser, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  RINGKASAN TEASER
                </label>
                <textarea
                  rows={2}
                  value={event.fashionTeaser.description}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      fashionTeaser: { ...event.fashionTeaser, description: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Awarding Teaser */}
            <div className="space-y-3 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Teaser Awarding
              </span>
              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  JUDUL TEASER
                </label>
                <input
                  type="text"
                  value={event.awardingTeaser.title}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      awardingTeaser: { ...event.awardingTeaser, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  RINGKASAN TEASER
                </label>
                <textarea
                  rows={2}
                  value={event.awardingTeaser.description}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      awardingTeaser: { ...event.awardingTeaser, description: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <FloppyDisk size={16} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Konten'}</span>
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
