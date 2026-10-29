'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { votingAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { Voting, Candidate, Participant, VotingStatus } from '@/types';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import { useToast } from '@/components/ui/Toast';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  House,
  LockKey,
  ShieldCheck,
  Sparkle,
  User,
  WarningCircle,
} from '@phosphor-icons/react';

function PrivateVotingContent({
  params,
}: {
  params: Promise<{ voteToken: string }>;
}) {
  const resolvedParams = use(params);
  const voteToken = resolvedParams.voteToken;

  const [voting, setVoting] = useState<Voting | undefined>(undefined);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification state
  const [nimInput, setNimInput] = useState('');
  const [voteCodeInput, setVoteCodeInput] = useState('');
  const [verifiedVoter, setVerifiedVoter] = useState<Participant | null>(null);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Voting stage state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    votingAdapter.getVotingByToken(voteToken).then((v) => {
      setVoting(v);
      if (v) {
        votingAdapter.listCandidates(v.id).then((cands) => {
          setCandidates(cands);
          if (cands.length > 0) setSelectedCandidate(cands[0]);
        });
      }
      setLoading(false);
    });
  }, [voteToken]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!nimInput.trim() || !voteCodeInput.trim()) {
      setVerificationError('NIM dan Kode Unik Tiket wajib diisi.');
      return;
    }

    try {
      const res = await votingAdapter.verifyVoter(voteToken, nimInput, voteCodeInput);
      setVerifiedVoter(res.participant);
      setAlreadyVoted(res.alreadyVoted);
    } catch (err: any) {
      setVerificationError(err.message || 'Verifikasi pemilih gagal.');
    }
  };

  const handleNext = () => {
    if (candidates.length === 0) return;
    const nextIdx = (currentIndex + 1) % candidates.length;
    setCurrentIndex(nextIdx);
    setSelectedCandidate(candidates[nextIdx]);
  };

  const handlePrev = () => {
    if (candidates.length === 0) return;
    const prevIdx = (currentIndex - 1 + candidates.length) % candidates.length;
    setCurrentIndex(prevIdx);
    setSelectedCandidate(candidates[prevIdx]);
  };

  const handleConfirmVote = async () => {
    if (!voting || !verifiedVoter || !selectedCandidate) return;
    setVoteSubmitting(true);
    try {
      await votingAdapter.castVote(voting.id, verifiedVoter.id, selectedCandidate.id);
      setVoteSuccess(true);
      setAlreadyVoted(true);
      setShowConfirmModal(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan suara.');
    } finally {
      setVoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="text-center space-y-3 font-mono text-xs text-memoria-champagne">
          <div className="w-8 h-8 rounded-full border-2 border-memoria-gold border-t-transparent animate-spin mx-auto" />
          <span>Mempersiapkan panggung voting...</span>
        </div>
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="min-h-screen bg-memoria-midnight text-memoria-ivory flex items-center justify-center p-4">
        <div className="max-w-md text-center p-8 rounded-3xl bg-memoria-dark-wine/70 border border-memoria-gold/30 space-y-4 shadow-2xl">
          <WarningCircle size={48} className="text-rose-400 mx-auto" />
          <h1 className="text-xl font-bold">Voting Tidak Ditemukan</h1>
          <p className="text-xs text-memoria-champagne/80">
            Tautan private voting ini tidak valid atau telah dihapus oleh panitia.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-memoria-burgundy text-memoria-ivory text-xs uppercase font-bold"
          >
            <House size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const runtimeStatus: VotingStatus = votingAdapter.getVotingRuntimeStatus(voting);

  return (
    <div className="min-h-screen bg-memoria-midnight text-memoria-ivory py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
        {/* Top Header */}
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-memoria-gold/20 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-memoria-gold">
            <LockKey size={16} />
            <span className="uppercase tracking-widest font-semibold">Private Voting Session</span>
          </div>
          <BrandLogotype size="sm" showSubtitle={false} />
        </div>

        {/* MAIN BODY: SWITCH BETWEEN VERIFICATION vs STAGE */}
        <div className="max-w-5xl mx-auto w-full py-8">
          {/* STEP A: NOT VERIFIED YET */}
          {!verifiedVoter ? (
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-memoria-dark-wine/80 border border-memoria-gold/40 text-memoria-champagne text-xs font-mono">
                  <Clock size={14} className="text-memoria-gold" />
                  <span>Status: {runtimeStatus}</span>
                </div>
                <h1
                  style={{ fontFamily: 'var(--font-bodoni), serif' }}
                  className="text-2xl sm:text-3xl font-bold text-memoria-ivory"
                >
                  {voting.title}
                </h1>
                <p className="text-xs text-memoria-champagne/80 font-normal leading-relaxed">
                  {voting.description}
                </p>
              </div>

              {runtimeStatus === 'AKTIF' ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-memoria-dark-wine/90 to-[#1b080b] border border-memoria-gold/40 shadow-2xl space-y-5">
                  <div className="flex items-center gap-2 text-xs text-memoria-gold font-semibold uppercase tracking-wider">
                    <ShieldCheck size={18} />
                    <span>Verifikasi Identitas Tiket</span>
                  </div>

                  {verificationError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-xs text-rose-200 flex items-start gap-2">
                      <WarningCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                      <span>{verificationError}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-memoria-champagne mb-1.5">
                        NIM MAHASISWA
                      </label>
                      <input
                        type="text"
                        required
                        value={nimInput}
                        onChange={(e) => setNimInput(e.target.value)}
                        placeholder="Contoh: 7708220001"
                        className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-ivory text-sm font-mono focus:outline-none focus:border-memoria-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-memoria-champagne mb-1.5">
                        KODE UNIK TIKET (VOTE CODE)
                      </label>
                      <input
                        type="text"
                        required
                        value={voteCodeInput}
                        onChange={(e) => setVoteCodeInput(e.target.value)}
                        placeholder="Contoh: VOTE-7K92P"
                        className="w-full px-4 py-3 rounded-xl bg-memoria-midnight/90 border border-memoria-gold/40 text-memoria-gold text-sm font-mono tracking-wider focus:outline-none focus:border-memoria-gold uppercase"
                      />
                      <span className="text-[11px] text-memoria-champagne/60 mt-1 block">
                        * Lihat kode unik voting pada berkas e-ticket PDF Anda.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-memoria-burgundy hover:bg-memoria-stage-red border border-memoria-gold text-memoria-ivory font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                    >
                      Verifikasi & Masuk Panggung Voting
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-memoria-dark-wine/50 border border-memoria-gold/30 text-center space-y-2">
                  <p className="text-sm font-semibold text-memoria-ivory">
                    {runtimeStatus === 'TERJADWAL' || runtimeStatus === 'DRAFT'
                      ? 'Voting belum dibuka oleh panitia.'
                      : 'Voting telah ditutup sesuai jadwal acara.'}
                  </p>
                  <p className="text-xs text-memoria-champagne/70">
                    Silakan ikuti instruksi panitia pada pengumuman acara.
                  </p>
                </div>
              )}
            </div>
          ) : voteSuccess ? (
            /* STEP C: GOLD SEAL SUCCESS */
            <div className="max-w-md mx-auto text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#99732b] via-[#d6b46a] to-[#ffecb3] border-4 border-[#fff2cc] shadow-[0_0_40px_rgba(214,180,106,0.8)] flex items-center justify-center mx-auto text-memoria-midnight animate-bounce">
                <CheckCircle size={54} weight="fill" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-memoria-gold font-mono tracking-widest uppercase">
                  <Sparkle size={14} weight="fill" />
                  <span>Golden Ballot Stamped</span>
                </div>
                <h2
                  style={{ fontFamily: 'var(--font-bodoni), serif' }}
                  className="text-3xl font-bold text-memoria-ivory"
                >
                  Suara Kamu Berhasil Dicatat!
                </h2>
                <p className="text-xs sm:text-sm text-memoria-champagne/80 font-normal">
                  Terima kasih, <strong>{verifiedVoter.fullName}</strong>. Suaramu untuk{' '}
                  <span className="text-memoria-gold font-bold">{selectedCandidate?.name}</span> telah
                  resmi terdaftar dalam sistem MEMORIA.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-memoria-burgundy text-memoria-ivory text-xs uppercase font-bold tracking-wider border border-memoria-gold/60 shadow-xl hover:scale-105 transition-all"
                >
                  <House size={16} />
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </div>
          ) : alreadyVoted ? (
            /* ALREADY VOTED STATE */
            <div className="max-w-md mx-auto text-center space-y-6 py-12">
              <div className="w-16 h-16 rounded-full bg-memoria-dark-wine border border-memoria-gold flex items-center justify-center mx-auto text-memoria-gold">
                <CheckCircle size={36} weight="fill" />
              </div>
              <h2 className="text-2xl font-bold text-memoria-ivory">
                Kamu Sudah Memberikan Suara
              </h2>
              <p className="text-xs text-memoria-champagne/80 leading-relaxed">
                NIM <strong>{verifiedVoter.nim}</strong> telah tercatat berpartisipasi pada kategori{' '}
                <strong>{voting.title}</strong>. Satu peserta hanya berhak atas satu suara per kategori.
              </p>
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-memoria-dark-wine border border-memoria-gold/40 text-memoria-champagne text-xs uppercase font-semibold hover:border-memoria-gold"
                >
                  <House size={16} />
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </div>
          ) : (
            /* STEP B: SPOTLIGHT ROTATING STAGE */
            <div className="space-y-6">
              {/* Voter badge top */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-memoria-dark-wine/70 border border-memoria-gold/30 text-xs">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-memoria-gold" />
                  <span>
                    Pemilih Sah: <strong>{verifiedVoter.fullName}</strong> ({verifiedVoter.nim})
                  </span>
                </div>
                <span className="text-[11px] text-memoria-champagne/70 font-mono">
                  {candidates.length} Kandidat Panggung
                </span>
              </div>

              {/* THEATRE SPOTLIGHT STAGE */}
              <div className="relative min-h-[460px] sm:min-h-[520px] rounded-3xl overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-memoria-dark-wine via-[#160507] to-memoria-midnight border-2 border-memoria-gold/40 shadow-2xl flex flex-col justify-between p-6">
                {/* Overhead Spotlight Cones */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-full pointer-events-none opacity-80 animate-spotlight-pulse"
                  style={{
                    background:
                      'conic-gradient(from 180deg at 50% 0%, transparent 40%, rgba(214,180,106,0.2) 48%, rgba(255,249,240,0.3) 50%, rgba(214,180,106,0.2) 52%, transparent 60%)',
                  }}
                />

                {/* Stage Proscenium Top Arch */}
                <div className="relative z-10 text-center">
                  <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-memoria-gold font-bold">
                    THE SPOTLIGHT CANDIDATE
                  </span>
                  <h2
                    style={{ fontFamily: 'var(--font-bodoni), serif' }}
                    className="text-2xl sm:text-3xl font-bold text-memoria-ivory"
                  >
                    {voting.title}
                  </h2>
                </div>

                {/* Center Stage: Candidate Figure & Stepped Podium */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-4">
                  {/* Candidate Visual with 3D Subtle Sway */}
                  <div className="relative w-56 sm:w-64 h-64 sm:h-72 flex items-center justify-center animate-candidate-sway select-none">
                    {selectedCandidate?.photo ? (
                      <img
                        src={selectedCandidate.photo}
                        alt={selectedCandidate.name}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
                      />
                    ) : (
                      /* Stylized Stage Silhouette / Avatar */
                      <div className="w-40 h-52 rounded-t-full bg-gradient-to-b from-memoria-burgundy/80 to-transparent border-2 border-dashed border-memoria-gold/50 flex flex-col items-center justify-center text-memoria-gold shadow-2xl p-4 text-center">
                        <Sparkle size={36} weight="fill" className="text-memoria-gold mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-memoria-ivory">
                          {selectedCandidate?.name}
                        </span>
                        <span className="text-[10px] text-memoria-champagne/70 mt-1">
                          Nominee Panggung
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stepped Podium */}
                  <div className="w-64 sm:w-80 h-7 bg-gradient-to-r from-memoria-dark-wine via-memoria-burgundy to-memoria-dark-wine border-t-2 border-memoria-gold rounded-t-lg shadow-2xl" />
                  <div className="w-72 sm:w-96 h-5 bg-gradient-to-r from-[#170406] via-memoria-dark-wine to-[#170406] border-t border-memoria-gold/50" />
                </div>

                {/* Candidate Info Card & Vote Selection */}
                <div className="relative z-10 max-w-md mx-auto w-full text-center space-y-4">
                  <div>
                    <h3
                      style={{ fontFamily: 'var(--font-bodoni), serif' }}
                      className="text-2xl sm:text-3xl font-bold text-memoria-ivory"
                    >
                      {selectedCandidate?.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-memoria-champagne/80 mt-1 font-normal">
                      {selectedCandidate?.description}
                    </p>
                  </div>

                  {/* Candidate Navigation & Select Button */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handlePrev}
                      className="p-3 rounded-full bg-memoria-dark-wine/80 border border-memoria-gold/50 hover:bg-memoria-dark-wine hover:border-memoria-gold text-memoria-ivory transition-all"
                      aria-label="Kandidat Sebelumnya"
                    >
                      <CaretLeft size={20} weight="bold" />
                    </button>

                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red border border-memoria-gold text-memoria-ivory font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Sparkle size={16} weight="fill" className="text-memoria-gold" />
                      <span>PILIH KANDIDAT INI</span>
                    </button>

                    <button
                      onClick={handleNext}
                      className="p-3 rounded-full bg-memoria-dark-wine/80 border border-memoria-gold/50 hover:bg-memoria-dark-wine hover:border-memoria-gold text-memoria-ivory transition-all"
                      aria-label="Kandidat Berikutnya"
                    >
                      <CaretRight size={20} weight="bold" />
                    </button>
                  </div>

                  {/* Dots indicator */}
                  <div className="flex justify-center gap-1.5 pt-1">
                    {candidates.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCurrentIndex(i);
                          setSelectedCandidate(c);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentIndex
                            ? 'bg-memoria-gold w-6'
                            : 'bg-memoria-gold/30 hover:bg-memoria-gold/60'
                        }`}
                        aria-label={`Lihat ${c.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CONFIRMATION MODAL */}
        {showConfirmModal && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="max-w-sm w-full p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-memoria-dark-wine to-[#1a0508] border-2 border-memoria-gold/60 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-memoria-burgundy border border-memoria-gold/50 flex items-center justify-center mx-auto text-memoria-gold">
                <Sparkle size={24} weight="fill" />
              </div>
              <h3
                style={{ fontFamily: 'var(--font-bodoni), serif' }}
                className="text-2xl font-bold text-memoria-ivory"
              >
                Konfirmasi Suara Anda
              </h3>
              <p className="text-xs text-memoria-champagne/80 leading-relaxed">
                Apakah Anda yakin ingin memberikan suara untuk:
                <br />
                <span className="text-memoria-gold font-bold text-base block mt-1">
                  {selectedCandidate.name}
                </span>
                <span className="text-[11px] text-rose-300 block mt-2">
                  * Pilihan ini bersifat final dan tidak dapat diubah kembali.
                </span>
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={voteSubmitting}
                  className="flex-1 py-2.5 rounded-full bg-memoria-midnight border border-memoria-gold/30 text-xs font-semibold text-memoria-champagne hover:border-memoria-gold"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVote}
                  disabled={voteSubmitting}
                  className="flex-1 py-2.5 rounded-full bg-memoria-burgundy hover:bg-memoria-stage-red border border-memoria-gold text-xs font-bold text-memoria-ivory uppercase tracking-wider shadow-lg"
                >
                  {voteSubmitting ? 'Mencatat Suara...' : 'Kirim Suara'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-[11px] text-memoria-champagne/50 py-2 border-t border-memoria-gold/15 max-w-5xl mx-auto w-full">
          Sistem Private Voting MEMORIA SIKC 2026. Hak cipta terpelihara.
        </div>
      </div>
  );
}

export default function PrivateVotingPage(props: { params: Promise<{ voteToken: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#140809] flex items-center justify-center text-xs text-[#D6B46A]">Memuat panggung voting...</div>}>
      <PrivateVotingContent {...props} />
    </Suspense>
  );
}
