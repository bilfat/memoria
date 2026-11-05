'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { AwardingPageHero } from '@/components/public/awarding/AwardingPageHero';
import { getPublicEventSettings, EventSettingsDTO } from '@/app/actions/cms';
import { Trophy, Clock, ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';

export default function AwardingPage() {
  const [cmsData, setCmsData] = useState<EventSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicEventSettings()
      .then((data) => {
        setCmsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const isVisible = Boolean(cmsData?.awardingPageVisible);

  return (
    <PublicLayoutShell
      className="bg-[#FFFFFF] text-[#3E2418] selection:bg-[#D6B46A]/25 selection:text-[#3E2418] overflow-x-hidden min-h-screen"
    >
      <div className="relative py-12 sm:py-18 md:py-22 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[80vh] overflow-hidden">
        {/* Overhead Ambient Light Washes */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-5xl h-96 bg-[radial-gradient(ellipse_at_top,_rgba(234,207,164,0.22)_0%,_rgba(214,180,106,0.12)_35%,_rgba(255,253,248,0.05)_65%,_transparent_80%)] blur-3xl pointer-events-none"
        />

        {/* Hero Section */}
        <AwardingPageHero
          title={cmsData?.awardingTitle || 'The Golden Moment Awarding'}
          description={cmsData?.awardingDescription || 'Penghargaan kehormatan tahunan untuk mahasiswa berprestasi, inovasi digital terunggul, dan kontributor terbaik SIKC.'}
        />

        {/* Visibility Toggle / Coming Soon State (Phase 1 Compliant) */}
        {loading ? (
          <div className="text-center py-20 text-xs text-neutral-400">
            Memuat informasi panggung...
          </div>
        ) : !isVisible ? (
          <div className="text-center py-16 px-4 bg-[#FFFDF8] border border-[#d6b46a]/30 rounded-3xl max-w-2xl mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAEDEF] border border-[#891523]/20 text-[#891523] flex items-center justify-center mx-auto">
              <Clock size={28} />
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#111827]">
              Malam Penganugerahan Segera Hadir
            </h2>
            <p className="text-sm text-[#7B6050] max-w-md mx-auto leading-relaxed">
              Daftar nominator dan pengumuman penerima penghargaan tahunan MEMORIA Diesnatalis 2026 sedang dalam proses penilaian.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#891523] text-white text-xs font-semibold hover:bg-[#720e1a] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#FFFDF8] border border-[#d6b46a]/30 rounded-3xl max-w-3xl mx-auto shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAEDEF] text-[#891523] flex items-center justify-center mx-auto">
              <Trophy size={24} weight="fill" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#111827]">
              Apresiasi Prestasi Civitas Akademika
            </h2>
            <p className="text-sm text-[#7B6050] max-w-xl mx-auto leading-relaxed">
              Malam penganugerahan piala kehormatan MEMORIA Golden Hall of Fame akan diumumkan secara langsung pada malam puncak perayaan.
            </p>
          </div>
        )}
      </div>
    </PublicLayoutShell>
  );
}
