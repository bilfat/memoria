'use client';

import React, { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getPublicEventSettings, updateEventSettingsAction, EventSettingsDTO } from '@/app/actions/cms';
import { useToast } from '@/components/ui/Toast';
import { FloppyDisk, ArrowSquareOut, Trophy } from '@phosphor-icons/react';
import Link from 'next/link';

export default function AdminTeaserAwardingPage() {
  const [event, setEvent] = useState<EventSettingsDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    getPublicEventSettings().then(setEvent).catch((err) => toastError('Gagal Memuat', err.message));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setSaving(true);
    try {
      const res = await updateEventSettingsAction(event);
      if (!res.success) throw new Error(res.message);
      success('Perubahan Disimpan', 'Teaser Awarding di Beranda berhasil diperbarui.');
    } catch (err: any) {
      toastError('Gagal Menyimpan', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <AdminShell title="Kelola Teaser Awarding" adminOnly={true}>
        <div className="py-12 text-center text-xs text-neutral-400">Memuat data teaser awarding...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Kelola Teaser Awarding" adminOnly={true}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Teaser Awarding (Beranda MEMORIA)
            </h2>
            <p className="text-xs text-[#6B7280]">
              Atur judul dan deskripsi panggung The Golden Moment Awarding pada landing page.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/#awarding-showcase"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs text-[#374151] hover:bg-[#F9FAFB]"
            >
              <ArrowSquareOut size={15} />
              <span>Lihat di Beranda</span>
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

        {/* Section: Trophy Preview info */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy size={24} weight="fill" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Piala Emas & Pencahayaan Teatrikal
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Ilustrasi piala emas 3D, sorotan cahaya panggung, dan partikel keemasan dipertahankan
              secara otomatis dari sistem desain MEMORIA tanpa memerlukan unggahan foto manual.
            </p>
          </div>
        </div>

        {/* Section: Editorial Narrative */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] border-b border-[#E5E7EB] pb-2">
            Narasi Penghargaan Kehormatan
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              JUDUL TEASER AWARDING
            </label>
            <input
              type="text"
              required
              value={event.awardingTitle}
              onChange={(e) => setEvent({ ...event, awardingTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              DESKRIPSI TEASER AWARDING
            </label>
            <textarea
              rows={4}
              required
              value={event.awardingDescription}
              onChange={(e) => setEvent({ ...event, awardingDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
            />
          </div>
        </div>
      </form>
    </AdminShell>
  );
}

