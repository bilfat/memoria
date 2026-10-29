'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { votingAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { Voting, Candidate, Participant, VotingStatus } from '@/types';
import { BrandLogotype } from '@/components/brand/BrandLogotype';
import {
  Clock,
  House,
  LockKey,
  ShieldCheck,
  Sparkle,
  WarningCircle,
} from '@phosphor-icons/react';
import { VotingCandidateGallery } from '@/components/public/voting/VotingCandidateGallery';
import { VoteConfirmationDialog } from '@/components/public/voting/VoteConfirmationDialog';
import { VotingSuccessModal } from '@/components/public/voting/VotingSuccessModal';
import { AlreadyVotedState } from '@/components/public/voting/AlreadyVotedState';

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

  // Voting selection & modal state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  // Load voting and candidates
  useEffect(() => {
    votingAdapter.getVotingByToken(voteToken).then((v) => {
      setVoting(v);
      if (v) {
        votingAdapter.listCandidates(v.id).then((cands) => {
          setCandidates(cands);
        });
      }
      setLoading(false);
    });

    // Subscribe to mock store updates
    const unsubscribe = mockStore.subscribe(() => {
      votingAdapter.getVotingByToken(voteToken).then((v) => {
        setVoting(v);
        if (v) {
          votingAdapter.listCandidates(v.id).then(setCandidates);
        }
      });
    });

    return () => unsubscribe();
  }, [voteToken]);

  // URL test parameter hook for fast verification & visual testing
  useEffect(() => {
    if (typeof window !== 'undefined' && voting && !verifiedVoter) {
      const urlParams = new URLSearchParams(window.location.search);
      const demo = urlParams.get('demo');
      if (demo === 'citra') {
        handleUseDemoAccount('7708220002', 'VOTE-3M48Q');
      } else if (demo === 'andi') {
        handleUseDemoAccount('7708220001', 'VOTE-7K92P');
      }
    }
  }, [voting, verifiedVoter]);

  useEffect(() => {
    if (typeof window !== 'undefined' && candidates.length > 0 && verifiedVoter) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('modal') === 'confirm' && !showConfirmModal) {
        setSelectedCandidate(candidates[0]);
        setShowConfirmModal(true);
      } else if (urlParams.get('modal') === 'success' && !voteSuccess) {
        setSelectedCandidate(candidates[0]);
        setVoteSuccess(true);
      }
    }
  }, [candidates, verifiedVoter]);

  // Handle identity verification form submission
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
      setVerificationError(err.message || 'Verifikasi identitas tiket gagal.');
    }
  };

  // Demo shortcut helper for testing
  const handleUseDemoAccount = async (nim: string, code: string) => {
    setNimInput(nim);
    setVoteCodeInput(code);
    setVerificationError(null);
    try {
      const res = await votingAdapter.verifyVoter(voteToken, nim, code);
      setVerifiedVoter(res.participant);
      setAlreadyVoted(res.alreadyVoted);
    } catch (err: any) {
      setVerificationError(err.message || 'Verifikasi akun demo gagal.');
    }
  };

  // Open confirmation modal for a candidate
  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowConfirmModal(true);
  };

  // Confirm and persist the vote
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
      <div className="min-h-screen bg-[#140809] text-[#f5e9d3] flex items-center justify-center p-4">
        <div className="text-center space-y-3 font-mono text-xs text-[#eacfa4]">
          <div className="w-8 h-8 rounded-full border-2 border-[#d6b46a] border-t-transparent animate-spin mx-auto" />
          <span>Mempersiapkan galeri panggung voting...</span>
        </div>
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="min-h-screen bg-[#140809] text-[#f5e9d3] flex items-center justify-center p-4">
        <div className="max-w-md text-center p-8 rounded-3xl bg-[#350a10]/80 border border-[#d6b46a]/40 space-y-4 shadow-2xl">
          <WarningCircle size={48} className="text-rose-400 mx-auto" />
          <h1
            style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
            className="text-2xl font-bold text-[#f5e9d3]"
          >
            Voting Tidak Ditemukan
          </h1>
          <p className="text-xs text-[#eacfa4]/80">
            Tautan private voting ini tidak valid atau telah dihapus oleh panitia.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#891523] text-white text-xs uppercase font-bold tracking-wider hover:bg-[#b52735] transition-colors"
            >
              <House size={16} />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const runtimeStatus: VotingStatus = votingAdapter.getVotingRuntimeStatus(voting);

  return (
    <div className="relative min-h-screen bg-[#140809] text-[#f5e9d3] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-x-hidden selection:bg-[#d6b46a]/30 selection:text-white">
      {/* Background Theatrical Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[650px] bg-[radial-gradient(ellipse_at_top,_rgba(137,21,35,0.28)_0%,_rgba(53,10,16,0.18)_45%,_transparent_75%)] blur-3xl pointer-events-none z-0"
      />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-[#d6b46a]/25 pb-4 select-none">
        <div className="flex items-center gap-2 text-xs font-mono text-[#d6b46a]">
          <LockKey size={16} />
          <span className="uppercase tracking-widest font-semibold">Private Voting Session</span>
        </div>
        <BrandLogotype size="sm" showSubtitle={false} />
      </header>

      {/* MAIN BODY */}
      <main className="relative z-10 max-w-7xl mx-auto w-full py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* ========================================================= */}
        {/* STATE 1: BELUM TERVERIFIKASI */}
        {/* ========================================================= */}
        {!verifiedVoter ? (
          <div className="max-w-md mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#350a10]/80 border border-[#d6b46a]/40 text-[#f5d890] text-xs font-mono">
                <Clock size={14} className="text-[#fef08a]" />
                <span>Status: {runtimeStatus}</span>
              </div>
              <h1
                style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
                className="text-2xl sm:text-3xl font-bold text-[#f5e9d3] pt-1"
              >
                {voting.title}
              </h1>
              <p className="text-xs text-[#eacfa4]/80 font-normal leading-relaxed">
                {voting.description}
              </p>
            </div>

            {runtimeStatus === 'AKTIF' ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#350a10]/90 to-[#190508] border border-[#d6b46a]/45 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(137,21,35,0.3)] space-y-5">
                <div className="flex items-center gap-2 text-xs text-[#d6b46a] font-semibold uppercase tracking-wider">
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
                    <label className="block text-xs font-semibold text-[#eacfa4] mb-1.5">
                      NIM MAHASISWA
                    </label>
                    <input
                      type="text"
                      required
                      value={nimInput}
                      onChange={(e) => setNimInput(e.target.value)}
                      placeholder="Contoh: 7708220002"
                      className="w-full px-4 py-3 rounded-xl bg-[#140809]/90 border border-[#d6b46a]/40 text-[#f5e9d3] text-sm font-mono focus:outline-none focus:border-[#d6b46a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#eacfa4] mb-1.5">
                      KODE UNIK TIKET (VOTE CODE)
                    </label>
                    <input
                      type="text"
                      required
                      value={voteCodeInput}
                      onChange={(e) => setVoteCodeInput(e.target.value)}
                      placeholder="Contoh: VOTE-3M48Q"
                      className="w-full px-4 py-3 rounded-xl bg-[#140809]/90 border border-[#d6b46a]/40 text-[#f5d890] text-sm font-mono tracking-wider focus:outline-none focus:border-[#d6b46a] uppercase"
                    />
                    <span className="text-[11px] text-[#eacfa4]/60 mt-1 block">
                      * Lihat kode unik voting pada berkas e-ticket PDF Anda.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#891523] via-[#b52735] to-[#891523] hover:brightness-110 border border-[#d6b46a] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(181,39,53,0.5)] transition-all cursor-pointer"
                  >
                    Verifikasi & Masuk Panggung Voting
                  </button>

                  {/* DEMO FAST-ACCESS BUTTONS */}
                  <div className="pt-3 border-t border-[#d6b46a]/25 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleUseDemoAccount('7708220002', 'VOTE-3M48Q')}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8a601e]/30 via-[#d6b46a]/35 to-[#8a601e]/30 hover:from-[#8a601e]/50 hover:to-[#8a601e]/50 border border-[#f5d890]/60 text-[#fef08a] font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                      title="Uji coba pemilih yang belum memberikan suara"
                    >
                      <Sparkle size={15} weight="fill" className="text-amber-300" />
                      <span>DEMO: Masuk (Belum Vote) — Citra Amelia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUseDemoAccount('7708220001', 'VOTE-7K92P')}
                      className="w-full py-2 px-3 rounded-lg bg-[#350a10]/50 hover:bg-[#350a10] border border-[#d6b46a]/30 text-[#eacfa4] font-mono text-[11px] font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Uji coba pemilih yang sudah memberikan suara"
                    >
                      <span>Demo (Sudah Vote): Andi Pratama (7708220001)</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-[#350a10]/50 border border-[#d6b46a]/30 text-center space-y-2">
                <p className="text-sm font-semibold text-[#f5e9d3]">
                  {runtimeStatus === 'TERJADWAL' || runtimeStatus === 'DRAFT'
                    ? 'Voting belum dibuka oleh panitia.'
                    : 'Voting telah ditutup sesuai jadwal acara.'}
                </p>
                <p className="text-xs text-[#eacfa4]/70">
                  Silakan ikuti instruksi panitia pada pengumuman acara.
                </p>
              </div>
            )}
          </div>
        ) : alreadyVoted && !voteSuccess ? (
          /* ========================================================= */
          /* STATE 6: ALREADY VOTED (SUDAH MEMBERIKAN SUARA) */
          /* ========================================================= */
          <AlreadyVotedState
            votingTitle={voting.title}
            voterNim={verifiedVoter.nim}
            voterName={verifiedVoter.fullName}
          />
        ) : (
          /* ========================================================= */
          /* STATE 2: GOLDEN SPOTLIGHT VOTING GALLERY (3 KOLOM DESKTOP) */
          /* ========================================================= */
          <VotingCandidateGallery
            voting={voting}
            candidates={candidates}
            verifiedVoter={verifiedVoter}
            onVoteClick={handleSelectCandidate}
            submitting={voteSubmitting}
          />
        )}
      </main>

      {/* ========================================================= */}
      {/* STATE 3: CONFIRMATION DIALOG MODAL */}
      {/* ========================================================= */}
      {showConfirmModal && selectedCandidate && (
        <VoteConfirmationDialog
          candidate={selectedCandidate}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmVote}
          submitting={voteSubmitting}
        />
      )}

      {/* ========================================================= */}
      {/* STATE 5: ANIMATED SUCCESS POPUP (GOLDEN SEAL) */}
      {/* ========================================================= */}
      {voteSuccess && selectedCandidate && (
        <VotingSuccessModal
          candidateName={selectedCandidate.name}
          voterName={verifiedVoter?.fullName}
        />
      )}

      {/* Bottom Footer */}
      <footer className="relative z-10 text-center text-[11px] text-[#eacfa4]/50 py-3 border-t border-[#d6b46a]/15 max-w-7xl mx-auto w-full select-none">
        Sistem Private Voting MEMORIA SIKC 2026. Hak cipta terpelihara.
      </footer>
    </div>
  );
}

export default function PrivateVotingPage(props: { params: Promise<{ voteToken: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#140809] flex items-center justify-center text-xs text-[#d6b46a] font-mono">
          Memuat panggung voting...
        </div>
      }
    >
      <PrivateVotingContent {...props} />
    </Suspense>
  );
}
