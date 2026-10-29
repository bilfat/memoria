'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { CandidatePhotoUpload } from '@/components/admin/CandidatePhotoUpload';
import { votingAdapter } from '@/data/adapters';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Plus, Trash, FloppyDisk, Sparkle } from '@phosphor-icons/react';

interface CandidateDraft {
  name: string;
  description: string;
  photo: string;
}

export default function CreateVotingPage() {
  const router = useRouter();
  const { success } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('2026-10-20T08:00');
  const [endsAt, setEndsAt] = useState('2026-11-20T22:00');
  const [mode, setMode] = useState<'DRAFT' | 'SCHEDULED'>('SCHEDULED');

  const [candidates, setCandidates] = useState<CandidateDraft[]>([
    { name: '', description: '', photo: '' },
    { name: '', description: '', photo: '' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: '', description: '', photo: '' }]);
  };

  const handleRemoveCandidate = (index: number) => {
    if (candidates.length <= 2) {
      alert('Sesi voting memerlukan minimal 2 kandidat.');
      return;
    }
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleUpdateCandidate = (index: number, field: keyof CandidateDraft, value: string) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (new Date(endsAt) <= new Date(startsAt)) {
      setErrorMsg('Waktu selesai voting harus lebih akhir dari waktu mulai.');
      return;
    }

    const validCandidates = candidates.filter((c) => c.name.trim().length > 0);
    if (validCandidates.length < 2) {
      setErrorMsg('Harap masukkan minimal 2 kandidat dengan nama yang valid.');
      return;
    }

    setSubmitting(true);
    try {
      const newVoting = await votingAdapter.saveVoting({
        title: title.trim(),
        description: description.trim(),
        mode,
        startsAt: `${startsAt}:00+07:00`,
        endsAt: `${endsAt}:00+07:00`,
      });

      // Save candidates
      for (let i = 0; i < validCandidates.length; i++) {
        const c = validCandidates[i];
        await votingAdapter.saveCandidate({
          votingId: newVoting.id,
          name: c.name.trim(),
          description: c.description.trim(),
          photo: c.photo.trim() || undefined,
          sortOrder: i + 1,
        });
      }

      success('Voting Berhasil Dibuat', `Sesi voting "${title}" siap dijadwalkan.`);
      router.push('/panitia/voting');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan voting.');
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Buat Sesi Private Voting Baru" adminOnly={true}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/panitia/voting"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] py-1 px-2.5 rounded-lg border border-[#E5E7EB] bg-white"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Voting</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Voting Poll Details */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#111827] border-b border-[#E5E7EB] pb-2">
              Pengaturan Judul & Jadwal Voting
            </h2>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">JUDUL VOTING *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Best Runway Fashion Model 2026"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">DESKRIPSI PETUNJUK</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Petunjuk kriteria pemilihan untuk mahasiswa pemilih..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:border-[#891523]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">MULAI VOTING (WIB) *</label>
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#374151] mb-1">SELESAI VOTING (WIB) *</label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Candidate Repeater */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <div>
                <h2 className="text-sm font-bold text-[#111827]">Daftar Kandidat (Minimal 2)</h2>
                <p className="text-[11px] text-[#6B7280]">
                  Gunakan foto dengan latar transparan (PNG/WebP) agar figur tampil sempurna di atas panggung.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCandidate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#891523]/40 text-[#891523] hover:bg-[#FAEDEF] font-semibold text-xs"
              >
                <Plus size={14} weight="bold" />
                <span>Tambah Kandidat</span>
              </button>
            </div>

            <div className="space-y-4">
              {candidates.map((cand, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#891523]">Kandidat #{idx + 1}</span>
                    {candidates.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="Hapus Kandidat"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#4B5563] mb-1">
                        NAMA KANDIDAT *
                      </label>
                      <input
                        type="text"
                        required
                        value={cand.name}
                        onChange={(e) => handleUpdateCandidate(idx, 'name', e.target.value)}
                        placeholder="Contoh: Aurelia Salsabila"
                        className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <CandidatePhotoUpload
                        photo={cand.photo}
                        onChange={(dataUrl) => handleUpdateCandidate(idx, 'photo', dataUrl)}
                        onRemove={() => handleUpdateCandidate(idx, 'photo', '')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#4B5563] mb-1">
                      DESKRIPSI / KETERANGAN
                    </label>
                    <input
                      type="text"
                      value={cand.description}
                      onChange={(e) => handleUpdateCandidate(idx, 'description', e.target.value)}
                      placeholder="Konsep busana atau tema penampilan..."
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Link
              href="/panitia/voting"
              className="px-5 py-2.5 rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#891523] hover:bg-[#720e1a] text-white font-semibold shadow-xs disabled:opacity-50"
            >
              <FloppyDisk size={16} />
              <span>{submitting ? 'Menyimpan...' : 'Simpan & Jadwalkan Voting'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
