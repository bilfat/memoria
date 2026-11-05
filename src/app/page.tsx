'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { TheatreStageHero } from '@/components/brand/TheatreStageHero';
import { BandShowcase } from '@/components/public/BandShowcase';
import { FashionShowcase } from '@/components/public/FashionShowcase';
import { AwardingShowcase } from '@/components/public/AwardingShowcase';
import { ScrollSection } from '@/components/public/ScrollSection';
import { getPublicEventSettings, EventSettingsDTO } from '@/app/actions/cms';
import { createClient } from '@/lib/supabase/client';
import { EventContent, Band } from '@/types';

export default function HomePage() {
  const [cmsData, setCmsData] = useState<EventSettingsDTO | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = () => {
      getPublicEventSettings().then((data) => {
        if (isMounted) setCmsData(data);
      });
    };

    fetchLatest();

    // Supabase Realtime: dengarkan perubahan tabel event_settings secara live
    const supabase = createClient();
    const channel = supabase
      .channel('realtime:public-event-settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_settings' },
        () => {
          fetchLatest();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Map DTO ke format yang diharapkan komponen visual existing
  const event: EventContent = {
    id: 'event-memoria-2026',
    eventName: cmsData?.eventName || 'MEMORIA',
    tagline: cmsData?.tagline || 'Velvet Night — Diesnatalis SIKC 2026',
    description: cmsData?.description || 'Satu malam istimewa perayaan Diesnatalis D4 Sistem Informasi Kota Cerdas.',
    eventStartAt: cmsData?.eventStartAt || '2026-11-20T18:30:00+07:00',
    venueName: cmsData?.venueName || 'Grand Ballroom & Theatre Hall',
    venueAddress: cmsData?.venueAddress || 'Telkom University Landmark Hall, Gedung Selaru Lt. 4, Bandung',
    heroImage: '/brand/og-cover.webp',
    footerText: cmsData?.footerText || 'MEMORIA 2026 — Himpunan Mahasiswa D4 Sistem Informasi Kota Cerdas.',
    fashionTeaser: {
      title: cmsData?.fashionTitle || 'Panggung Fashion Show',
      description: cmsData?.fashionDescription || 'Panggung runway berbalut beludru merah dengan parade busana haute couture & carnival theatrical yang memukau.',
      image: cmsData?.fashionImagePath || '/images/fashion-model-clean.png',
    },
    awardingTeaser: {
      title: cmsData?.awardingTitle || 'The Golden Moment Awarding',
      description: cmsData?.awardingDescription || 'Penghargaan kehormatan tahunan untuk mahasiswa berprestasi, inovasi digital terunggul, dan kontributor terbaik SIKC.',
    },
  };

  // 1 Penampil Band Tunggal sesuai spesifikasi Phase 1
  const bands: Band[] = [
    {
      id: 'band-primary',
      name: cmsData?.bandName || 'Fosca Band',
      description: cmsData?.bandDescription || 'Band beraliran indie-pop orchestral yang membawakan harmoni melodi hangat bernuansa sinematik teater.',
      photo: cmsData?.bandImagePath || '/images/band-silhouette.png',
      sortOrder: 1,
    },
  ];

  return (
    <PublicLayoutShell
      showLightRays={true}
      className="bg-[#fcfbf9] text-neutral-900 selection:bg-[#891523] selection:text-white"
    >
      {/* 1. Theatre Proscenium Stage Hero with GSAP Curtains, Marquee, Countdown & Identity */}
      <TheatreStageHero event={event} />

      {/* 2. Band Showcase in Asymmetric Alternating Layout with Smooth Scroll Enter/Exit */}
      <ScrollSection id="scroll-band" threshold={0.12}>
        <BandShowcase bands={bands} />
      </ScrollSection>

      {/* 3. The Velvet Runway Fashion Show Stage with Smooth Scroll Enter/Exit */}
      <ScrollSection id="scroll-fashion" threshold={0.12}>
        <FashionShowcase event={event} />
      </ScrollSection>

      {/* 4. The Golden Spotlight Ceremony Awarding Stage with Smooth Scroll Enter/Exit */}
      <ScrollSection id="scroll-awarding" threshold={0.12}>
        <AwardingShowcase event={event} />
      </ScrollSection>
    </PublicLayoutShell>
  );
}
