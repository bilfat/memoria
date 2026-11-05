'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { FashionEditorialHero } from '@/components/public/fashion-page/FashionEditorialHero';
import { getPublicEventSettings, EventSettingsDTO } from '@/app/actions/cms';
import { Sparkle, Clock, ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';

export default function FashionShowPage() {
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

  const isVisible = Boolean(cmsData?.fashionPageVisible);

  return (
    <PublicLayoutShell
      className="bg-[#FFFFFF] text-[#3E2418] selection:bg-[#891523]/20 selection:text-[#3E2418] overflow-x-hidden min-h-screen"
    >
      <div className="relative py-8 sm:py-14 md:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh] overflow-hidden">
        {/* Editorial Background Mesh */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #891523 0, #891523 1px, transparent 0, transparent 40px)',
          }}
        />

        {/* Hero Editorial */}
        <FashionEditorialHero
          title={cmsData?.fashionTitle || 'Panggung Fashion Show'}
          description={cmsData?.fashionDescription || 'Panggung runway berbalut beludru merah dengan parade busana haute couture & carnival theatrical yang memukau.'}
        />

        <div className="w-full max-w-5xl mx-auto my-10 sm:my-16 h-[1px] bg-gradient-to-r from-transparent via-[#891523]/25 to-transparent" />

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
              Panggung Fashion Show Segera Hadir
            </h2>
            <p className="text-sm text-[#7B6050] max-w-md mx-auto leading-relaxed">
              Dokumentasi dan parade penampil busana peragaan panggung MEMORIA sedang dipersiapkan oleh panitia.
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
              <Sparkle size={24} weight="fill" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#111827]">
              Parade Karya Busana Telkom University
            </h2>
            <p className="text-sm text-[#7B6050] max-w-xl mx-auto leading-relaxed">
              Malam puncak peragaan busana teatrikal akan diselenggarakan langsung di panggung megah teater MEMORIA. Kategori dan penampil resmi akan diumumkan secara langsung pada malam acara.
            </p>
          </div>
        )}
      </div>
    </PublicLayoutShell>
  );
}
