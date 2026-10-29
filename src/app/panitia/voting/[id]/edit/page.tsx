'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { votingAdapter } from '@/data/adapters';
import { useToast } from '@/components/ui/Toast';
import { Voting, Candidate } from '@/types';
import { ArrowLeft, Plus, Trash, FloppyDisk, LockKey, Sparkle, WarningCircle } from '@phosphor-icons/react';

interface CandidateDraft {
  id?: string;
  name: string;
  description: string;
  photo: string;
}

function EditVotingContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [mode, setMode] = useState<'DRAFT' | 'SCHEDULED'>('SCHEDULED');

  const [candidates, setCandidates] = useState<CandidateDraft[]>([]);
  const [originalCandidates, setOriginalCandidates] = useState<Candidate[]>([]);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const voting = await votingAdapter.getVoting(id);
        if (!voting) {
          toastError('Tidak Ditemukan', 'Sesi voting tidak ditemukan.');
          router.push('/panitia/voting');
          return;
        }

        setTitle(voting.title);
        setDescription(voting.description);
        setMode(voting.mode);

        // Format datetime-local: YYYY-MM-DDTHH:mm
        const s = new Date(voting.startsAt);
        const e = new Date(voting.endsAt);
        const pad = (n: number) => String(n).padStart(2, '0');
        const sStr = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}T${pad(s.getHours())}:${pad(s.getMinutes())}`;
        const eStr = `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())}T${pad(e.getHours())}:${pad(e.getMinutes())}`;
        setStartsAt(sStr);
        setEndsAt(eStr);

        const candList = await votingAdapter.listCandidates(id);
        setOriginalCandidates(candList);
        setCandidates(
          candList.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            photo: c.photo || '',
          }))
        );

        const votes = await votingAdapter.listVoteRecords(id);
        setVoteCount(votes.length);
      } catch (err: any) {
        toastError('Gagal Memuat', err.message || 'Gagal mengambil data voting');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router, toastError]);

  const isLocked = voteCount > 0;

  const handleAddCandidate = () => {
    if (isLocked) return;
    setCandidates([...candidates, { name: '', description: '', photo: '' }]);
  };

  const handleRemoveCandidate = (index: number) => {
    if (isLocked) return;
    if (candidates.length <= 2) {
      alert('Sesi voting memerlukan minimal 2 kandidat.');
      return;
    }
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleUpdateCandidate = (index: number, field: keyof CandidateDraft, value: string) => {
    if (isLocked) return;
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
      await votingAdapter.saveVoting({
        id,
        title: title.trim(),
        description: description.trim(),
        mode,
        startsAt: `${startsAt}:00+07:00`,
        endsAt: `${endsAt}:00+07:00`,
      });

      // If candidates are not locked, synchronize candidates
      if (!isLocked) {
        // Find deleted candidates
        const currentCandidateIds = new Set(candidates.map((c) => c.id).filter(Boolean));
        for (const orig of originalCandidates) {
          if (!currentCandidateIds.has(orig.id)) {
            await votingAdapter.deleteCandidate(orig.id);
          }
        }

        // Save or update existing candidates
        for (let i = 0; i < validCandidates.length; i++) {
          const c = validCandidates[i];
          await votingAdapter.saveCandidate({
            id: c.id,
            votingId: id,
            name: c.name.trim(),
            description: c.description.trim(),
            photo: c.photo.trim() || undefined,
            sortOrder: i + 1,
          });
        }
      }

      success('Voting Diperbarui', `Perubahan pada sesi "${title}" berhasil disimpan.`);
      router.push('/panitia/voting');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pembaruan voting.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Edit Sesi Voting" adminOnly={true}>
        <div className="p-8 text-center text-sm text-neutral-500">Memuat data sesi voting...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Edit: ${title}`} adminOnly={true}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/panitia/voting"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft size={14} /> Kembali ke Daftar Voting
          </Link>
          <Link
            href={`/panitia/voting/${id}/hasil`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Lihat Hasil Perolehan Suara ({voteCount})
          </Link>
        </div>

        {isLocked && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex items-start gap-3">
            <LockKey size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">Kandidat Terkunci</h4>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Sesi voting ini telah menerima <strong>{voteCount} suara sah</strong> dari pemilih.
                Sesuai aturan bisnis PRD (K-27), daftar dan profil kandidat dikunci secara permanen dan
                tidak dapat ditambah, diedit, atau dihapus agar menjaga integritas audit perolehan suara.
                Anda masih dapat menyesuaikan jadwal dan judul sesi.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <WarningCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Pengaturan Sesi */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Informasi & Jadwal Sesi Voting
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Judul Voting / Kategori *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Best Dressed Male Velvet Night"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Deskripsi / Petunjuk Pemilih</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pilih mahasiswa dengan busana paling sesuai tema..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Waktu Mulai (WIB) *</label>
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Waktu Selesai (WIB) *</label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Mode Publikasi</label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="SCHEDULED"
                    checked={mode === 'SCHEDULED'}
                    onChange={() => setMode('SCHEDULED')}
                    className="accent-neutral-900"
                  />
                  <span>Terjadwal (Buka otomatis mengikuti waktu mulai & selesai)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="DRAFT"
                    checked={mode === 'DRAFT'}
                    onChange={() => setMode('DRAFT')}
                    className="accent-neutral-900"
                  />
                  <span>Draft (Tutup / belum dibuka untuk pemilih)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card Daftar Kandidat */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  Daftar Kandidat
                  {isLocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      <LockKey size={10} /> Terkunci
                    </span>
                  )}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Minimal 2 kandidat dengan nama dan deskripsi/subtitle.
                </p>
              </div>
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleAddCandidate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  <Plus size={14} /> Tambah Kandidat
                </button>
              )}
            </div>

            <div className="space-y-4">
              {candidates.map((cand, idx) => (
                <div
                  key={cand.id || idx}
                  className={`p-4 rounded-xl border ${
                    isLocked ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-50/70 border-neutral-200'
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Kandidat #{idx + 1}
                    </span>
                    {!isLocked && candidates.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(idx)}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash size={13} /> Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-600">Nama Kandidat *</label>
                      <input
                        type="text"
                        required
                        disabled={isLocked}
                        value={cand.name}
                        onChange={(e) => handleUpdateCandidate(idx, 'name', e.target.value)}
                        placeholder="Nama lengkap atau alias"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-100 disabled:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-600">URL Foto (PNG/WebP)</label>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={cand.photo}
                        onChange={(e) => handleUpdateCandidate(idx, 'photo', e.target.value)}
                        placeholder="/images/kandidat1.png"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-100 disabled:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600">Deskripsi / Detail Busana</label>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={cand.description}
                      onChange={(e) => handleUpdateCandidate(idx, 'description', e.target.value)}
                      placeholder="Contoh: Burgundy Velvet Suit with Antique Gold Boutonniere"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-100 disabled:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/panitia/voting"
              className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
            >
              <FloppyDisk size={14} />
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}

export default function EditVotingPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Memuat formulir voting...</div>}>
      <EditVotingContent {...props} />
    </Suspense>
  );
}
