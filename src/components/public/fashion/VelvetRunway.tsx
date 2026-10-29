'use client';

import React from 'react';

interface VelvetRunwayProps {
  className?: string;
}

export function VelvetRunway({ className = '' }: VelvetRunwayProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none select-none z-10 ${className}`}>
      <svg
        viewBox="0 0 600 500"
        preserveAspectRatio="none"
        className="w-full h-full drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glossy Black-Red Lacquer Runway Floor Gradient */}
          <linearGradient id="runwayFloorGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#140406" />
            <stop offset="35%" stopColor="#2c080d" />
            <stop offset="65%" stopColor="#4a0d15" />
            <stop offset="90%" stopColor="#30070c" />
            <stop offset="100%" stopColor="#180305" />
          </linearGradient>

          {/* Left Golden Catwalk Rail Gradient */}
          <linearGradient id="leftRailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#855716" />
            <stop offset="30%" stopColor="#d6b46a" />
            <stop offset="50%" stopColor="#fff8db" />
            <stop offset="75%" stopColor="#d6b46a" />
            <stop offset="100%" stopColor="#f5d890" />
          </linearGradient>

          {/* Right Golden Catwalk Rail Gradient */}
          <linearGradient id="rightRailGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#855716" />
            <stop offset="30%" stopColor="#d6b46a" />
            <stop offset="50%" stopColor="#fff8db" />
            <stop offset="75%" stopColor="#d6b46a" />
            <stop offset="100%" stopColor="#f5d890" />
          </linearGradient>

          {/* Central Glossy Reflection Beam */}
          <linearGradient id="centerGlossBeam" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#f5d890" stopOpacity="0.08" />
            <stop offset="45%" stopColor="#fff8db" stopOpacity="0.22" />
            <stop offset="85%" stopColor="#f5d890" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Front Stage Plinth Bevel Gradient */}
          <linearGradient id="frontPlinthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#180305" />
            <stop offset="20%" stopColor="#3b0910" />
            <stop offset="50%" stopColor="#550f19" />
            <stop offset="80%" stopColor="#3b0910" />
            <stop offset="100%" stopColor="#180305" />
          </linearGradient>
        </defs>

        {/* 1. RUNWAY CATWALK 3D PERSPECTIVE FLOOR (Mengecil ke Titik Hilang Belakang) */}
        <polygon
          points="240,120 360,120 540,485 60,485"
          fill="url(#runwayFloorGrad)"
          stroke="#550f19"
          strokeWidth="1.5"
        />

        {/* 2. CATWALK CENTER RUNNER STRIP (Jalur Tengah Berkilau) */}
        <polygon
          points="285,120 315,120 355,485 245,485"
          fill="url(#centerGlossBeam)"
        />

        {/* 3. POLISHED GOLD RAILS (Garis Emas Tegas di Sisi Kiri & Kanan Catwalk) */}
        {/* Left Gold Rail */}
        <line x1="240" y1="120" x2="60" y2="485" stroke="url(#leftRailGrad)" strokeWidth="3.5" />
        <line x1="239" y1="120" x2="57" y2="485" stroke="#fff8db" strokeWidth="1" opacity="0.85" />

        {/* Right Gold Rail */}
        <line x1="360" y1="120" x2="540" y2="485" stroke="url(#rightRailGrad)" strokeWidth="3.5" />
        <line x1="361" y1="120" x2="543" y2="485" stroke="#fff8db" strokeWidth="1" opacity="0.85" />

        {/* 4. FRONT STAGE FACING PLINTH STEP (Langkah Panggung Depan) */}
        <polygon
          points="60,485 540,485 555,500 45,500"
          fill="url(#frontPlinthGrad)"
          stroke="#d6b46a"
          strokeWidth="1.5"
        />
        {/* Footlight Trim Glow on Front Step */}
        <line x1="45" y1="486" x2="555" y2="486" stroke="#fff8db" strokeWidth="1.5" opacity="0.9" />
      </svg>
    </div>
  );
}
