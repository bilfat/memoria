'use client';

import React, { useEffect, useState } from 'react';
import { PublicLayoutShell } from '@/components/public/PublicLayoutShell';
import { TheatreStageHero } from '@/components/brand/TheatreStageHero';
import { BandShowcase } from '@/components/public/BandShowcase';
import { FashionShowcase } from '@/components/public/FashionShowcase';
import { AwardingShowcase } from '@/components/public/AwardingShowcase';
import { eventAdapter } from '@/data/adapters';
import { mockStore } from '@/data/mock/mockStore';
import { EventContent, Band } from '@/types';

export default function HomePage() {
  const [event, setEvent] = useState<EventContent>(mockStore.getEvent());
  const [bands, setBands] = useState<Band[]>(mockStore.getBands());

  useEffect(() => {
    // Initial fetch
    eventAdapter.getEvent().then(setEvent);
    eventAdapter.listBands().then(setBands);

    // Subscribe to real-time mock store mutations
    const unsubscribe = mockStore.subscribe(() => {
      setEvent(mockStore.getEvent());
      setBands(mockStore.getBands());
    });

    return () => unsubscribe();
  }, []);

  return (
    <PublicLayoutShell
      showLightRays={true}
      className="bg-[#fcfbf9] text-neutral-900 selection:bg-[#891523] selection:text-white"
    >
      {/* 1. Theatre Proscenium Stage Hero with GSAP Curtains, Marquee, Countdown & Identity */}
      <TheatreStageHero event={event} />

      {/* 2. Band Showcase in Asymmetric Alternating Layout */}
      <BandShowcase bands={bands} />

      {/* 3. The Velvet Runway Fashion Show Stage */}
      <FashionShowcase event={event} />

      {/* 4. The Golden Spotlight Ceremony Awarding Stage (Redesigned Theatrical Stage) */}
      <AwardingShowcase event={event} />
    </PublicLayoutShell>
  );
}
