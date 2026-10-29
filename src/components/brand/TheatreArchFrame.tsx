'use client';

import React from 'react';

// Koordinat lampu bohlam melengkung di sepanjang Proscenium Arch (viewBox 1200 x 780)
// Arch path melengkung dari kiri (x=80, y=300) naik ke puncak (x=600, y=45) turun ke kanan (x=1120, y=300)
const ARCH_BULBS = [
  // Pilar Kiri (dari bawah ke atas)
  { id: 'p-l-1', x: 80, y: 720, type: 'pillar' },
  { id: 'p-l-2', x: 80, y: 660, type: 'pillar' },
  { id: 'p-l-3', x: 80, y: 600, type: 'pillar' },
  { id: 'p-l-4', x: 80, y: 540, type: 'pillar' },
  { id: 'p-l-5', x: 80, y: 480, type: 'pillar' },
  { id: 'p-l-6', x: 80, y: 420, type: 'pillar' },
  { id: 'p-l-7', x: 80, y: 360, type: 'pillar' },
  { id: 'p-l-8', x: 80, y: 300, type: 'pillar' },

  // Lengkungan Kiri (naik menuju puncak)
  { id: 'a-l-1', x: 95, y: 245, type: 'arch' },
  { id: 'a-l-2', x: 130, y: 195, type: 'arch' },
  { id: 'a-l-3', x: 180, y: 150, type: 'arch' },
  { id: 'a-l-4', x: 240, y: 115, type: 'arch' },
  { id: 'a-l-5', x: 310, y: 85, type: 'arch' },
  { id: 'a-l-6', x: 390, y: 65, type: 'arch' },
  { id: 'a-l-7', x: 475, y: 52, type: 'arch' },
  { id: 'a-l-8', x: 550, y: 47, type: 'arch' },

  // Puncak Tengah
  { id: 'a-c-0', x: 600, y: 45, type: 'arch-center' },

  // Lengkungan Kanan (turun dari puncak)
  { id: 'a-r-8', x: 650, y: 47, type: 'arch' },
  { id: 'a-r-7', x: 725, y: 52, type: 'arch' },
  { id: 'a-r-6', x: 810, y: 65, type: 'arch' },
  { id: 'a-r-5', x: 890, y: 85, type: 'arch' },
  { id: 'a-r-4', x: 960, y: 115, type: 'arch' },
  { id: 'a-r-3', x: 1020, y: 150, type: 'arch' },
  { id: 'a-r-2', x: 1070, y: 195, type: 'arch' },
  { id: 'a-r-1', x: 1105, y: 245, type: 'arch' },

  // Pilar Kanan (turun ke bawah)
  { id: 'p-r-8', x: 1120, y: 300, type: 'pillar' },
  { id: 'p-r-7', x: 1120, y: 360, type: 'pillar' },
  { id: 'p-r-6', x: 1120, y: 420, type: 'pillar' },
  { id: 'p-r-5', x: 1120, y: 480, type: 'pillar' },
  { id: 'p-r-4', x: 1120, y: 540, type: 'pillar' },
  { id: 'p-r-3', x: 1120, y: 600, type: 'pillar' },
  { id: 'p-r-2', x: 1120, y: 660, type: 'pillar' },
  { id: 'p-r-1', x: 1120, y: 720, type: 'pillar' },
];

export function TheatreArchFrame() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
      <svg
        viewBox="0 0 1200 780"
        className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Metallic Gold Gradient for Outer Frame */}
          <linearGradient id="goldArchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5d890" />
            <stop offset="20%" stopColor="#d6b46a" />
            <stop offset="45%" stopColor="#966a22" />
            <stop offset="50%" stopColor="#fff3cf" />
            <stop offset="55%" stopColor="#a97c2c" />
            <stop offset="80%" stopColor="#d6b46a" />
            <stop offset="100%" stopColor="#f5d890" />
          </linearGradient>

          {/* Deep Velvet Molding Shadow Fill */}
          <linearGradient id="moldingDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#350a10" />
            <stop offset="50%" stopColor="#1e0407" />
            <stop offset="100%" stopColor="#140809" />
          </linearGradient>

          {/* Marquee Bulb Glowing Radial Gradient */}
          <radialGradient id="marqueeBulbGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fff5c0" />
            <stop offset="65%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>

        {/* 1. OUTER THEATRE ARCH FRAME (PROSCENIUM BORDER) */}
        {/* Pilar Kiri Outer */}
        <rect
          x="30"
          y="280"
          width="100"
          height="480"
          rx="12"
          fill="url(#moldingDarkGrad)"
          stroke="url(#goldArchGrad)"
          strokeWidth="3.5"
        />
        {/* Pilar Kiri Fluted Relief Grooves */}
        <line x1="60" y1="300" x2="60" y2="740" stroke="#d6b46a" strokeWidth="1.2" strokeOpacity="0.4" />
        <line x1="80" y1="300" x2="80" y2="740" stroke="#f5d890" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="100" y1="300" x2="100" y2="740" stroke="#d6b46a" strokeWidth="1.2" strokeOpacity="0.4" />

        {/* Pilar Kanan Outer */}
        <rect
          x="1070"
          y="280"
          width="100"
          height="480"
          rx="12"
          fill="url(#moldingDarkGrad)"
          stroke="url(#goldArchGrad)"
          strokeWidth="3.5"
        />
        {/* Pilar Kanan Fluted Relief Grooves */}
        <line x1="1100" y1="300" x2="1100" y2="740" stroke="#d6b46a" strokeWidth="1.2" strokeOpacity="0.4" />
        <line x1="1120" y1="300" x2="1120" y2="740" stroke="#f5d890" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="1140" y1="300" x2="1140" y2="740" stroke="#d6b46a" strokeWidth="1.2" strokeOpacity="0.4" />

        {/* Top Grand Proscenium Arch Molding Curve */}
        <path
          d="M 30 300 C 30 110, 240 16, 600 16 C 960 16, 1170 110, 1170 300 L 1070 300 C 1070 140, 890 55, 600 55 C 310 55, 130 140, 130 300 Z"
          fill="url(#moldingDarkGrad)"
          stroke="url(#goldArchGrad)"
          strokeWidth="4"
        />

        {/* Inner Gold Bevel Trim */}
        <path
          d="M 130 300 C 130 145, 310 65, 600 65 C 890 65, 1070 145, 1070 300"
          fill="none"
          stroke="#f5d890"
          strokeWidth="2"
          strokeOpacity="0.8"
        />

        {/* 2. TOP GOLDEN CROWN ORNAMENT (Art Deco / Royal Theatre Crest di Puncak Arch) */}
        <g transform="translate(600, 32)">
          {/* Ambient Crown Halo */}
          <circle cx="0" cy="-8" r="14" fill="#facc15" opacity="0.3" />
          {/* Central Golden Diamond Finial */}
          <polygon
            points="0,-24 16,-8 0,8 -16,-8"
            fill="url(#goldArchGrad)"
            stroke="#f5d890"
            strokeWidth="1.5"
          />
          {/* Left Floral Scroll Wing */}
          <path
            d="M -16 -8 C -45 -18, -75 -4, -100 -2 C -70 12, -35 4, 0 6"
            fill="none"
            stroke="url(#goldArchGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right Floral Scroll Wing */}
          <path
            d="M 16 -8 C 45 -18, 75 -4, 100 -2 C 70 12, 35 4, 0 6"
            fill="none"
            stroke="url(#goldArchGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Tiny Ruby Jewel Core */}
          <circle cx="0" cy="-8" r="4" fill="#891523" stroke="#f5d890" strokeWidth="1" />
        </g>

        {/* 3. MARQUEE BULBS ROW ALONG ARCH & PILLARS (Optimized GPU Rendering) */}
        {ARCH_BULBS.map((bulb) => (
          <g key={bulb.id} className="stage-marquee-bulb transition-opacity duration-300">
            {/* Warm Ambient Halo Glow */}
            <circle
              cx={bulb.x}
              cy={bulb.y}
              r="11"
              fill="#f59e0b"
              opacity="0.3"
            />
            {/* Marquee Bulb Housing Rim */}
            <circle
              cx={bulb.x}
              cy={bulb.y}
              r="6.5"
              fill="#421417"
              stroke="#d6b46a"
              strokeWidth="1.2"
            />
            {/* Glowing Incandescent Core with Hardware-Accelerated Animation */}
            <circle
              cx={bulb.x}
              cy={bulb.y}
              r="5"
              fill="url(#marqueeBulbGrad)"
              className="animate-marquee-glow"
              style={{
                animationDelay: `${(parseInt(bulb.id.replace(/[^0-9]/g, '0') || '0', 10) % 5) * 0.3}s`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

