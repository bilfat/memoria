'use client';

import React from 'react';

interface RunwayLightingRigProps {
  className?: string;
}

export const RunwayLightingRig = React.forwardRef<HTMLDivElement, RunwayLightingRigProps>(
  function RunwayLightingRig({ className = '' }, ref) {
    // 7 linear spotlight fixtures positioned along the horizontal overhead truss (viewBox 600 x 90)
    const FIXTURES = [
      { id: 'f-1', x: 60, angle: 18 },
      { id: 'f-2', x: 140, angle: 12 },
      { id: 'f-3', x: 220, angle: 6 },
      { id: 'f-4', x: 300, angle: 0 },
      { id: 'f-5', x: 380, angle: -6 },
      { id: 'f-6', x: 460, angle: -12 },
      { id: 'f-7', x: 540, angle: -18 },
    ];

    return (
      <div
        ref={ref}
        className={`relative w-full max-w-2xl mx-auto pointer-events-none select-none z-30 ${className}`}
      >
        {/* Overhead Ambient Golden Light Dome */}
        <div className="absolute -top-8 inset-x-8 h-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f5d890]/25 via-[#d6b46a]/10 to-transparent blur-xl pointer-events-none" />

        <svg
          viewBox="0 0 600 90"
          className="w-full h-auto overflow-visible drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Linear Metallic Gold Truss Gradient */}
            <linearGradient id="trussGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#855716" />
              <stop offset="15%" stopColor="#d6b46a" />
              <stop offset="30%" stopColor="#fff8db" />
              <stop offset="50%" stopColor="#d6b46a" />
              <stop offset="70%" stopColor="#fff8db" />
              <stop offset="85%" stopColor="#d6b46a" />
              <stop offset="100%" stopColor="#855716" />
            </linearGradient>

            {/* Spotlight Housing Gradient */}
            <linearGradient id="housingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#350a10" />
              <stop offset="50%" stopColor="#140809" />
              <stop offset="100%" stopColor="#25060a" />
            </linearGradient>

            {/* Incandescent Bulb Core Glow */}
            <radialGradient id="runwayBulbGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fff7bd" />
              <stop offset="70%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>

            {/* Suspension Rigging Cable Gradient */}
            <linearGradient id="cableGradFashion" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#855716" />
              <stop offset="50%" stopColor="#f5d890" />
              <stop offset="100%" stopColor="#855716" />
            </linearGradient>
          </defs>

          {/* 1. CEILING SUSPENSION CABLES */}
          <line x1="80" y1="0" x2="80" y2="28" stroke="url(#cableGradFashion)" strokeWidth="1.8" opacity="0.8" />
          <line x1="220" y1="0" x2="220" y2="28" stroke="url(#cableGradFashion)" strokeWidth="1.8" opacity="0.8" />
          <line x1="380" y1="0" x2="380" y2="28" stroke="url(#cableGradFashion)" strokeWidth="1.8" opacity="0.8" />
          <line x1="520" y1="0" x2="520" y2="28" stroke="url(#cableGradFashion)" strokeWidth="1.8" opacity="0.8" />

          {/* Mounting Clamps */}
          {[80, 220, 380, 520].map((x) => (
            <rect key={`clamp-${x}`} x={x - 4} y="24" width="8" height="6" rx="1.5" fill="#f5d890" stroke="#855716" strokeWidth="0.8" />
          ))}

          {/* 2. MAIN HORIZONTAL RUNWAY TRUSS (Double Chords with Crossbar Lattice) */}
          {/* Upper Chord Tube */}
          <rect x="25" y="28" width="550" height="4.5" rx="2" fill="url(#trussGoldGrad)" />
          {/* Lower Chord Tube */}
          <rect x="25" y="44" width="550" height="5" rx="2" fill="url(#trussGoldGrad)" />

          {/* Lattice Diagonal Crossbars */}
          {[...Array(26)].map((_, i) => {
            const x1 = 30 + i * 21;
            const x2 = 30 + (i + 1) * 21;
            return (
              <line
                key={`lattice-${i}`}
                x1={i % 2 === 0 ? x1 : x2}
                y1="32"
                x2={i % 2 === 0 ? x2 : x1}
                y2="44"
                stroke="#d6b46a"
                strokeWidth="1.4"
                opacity="0.8"
              />
            );
          })}

          {/* 3. SPOTLIGHT FIXTURE CANISTERS & BULBS */}
          {FIXTURES.map((f) => (
            <g
              key={f.id}
              className="fashion-rig-spotlight"
              transform={`translate(${f.x}, 48) rotate(${f.angle}, 0, 0)`}
            >
              {/* Mounting Yoke Bracket */}
              <path d="M-6 0 L-6 8 L6 8 L6 0" stroke="#d6b46a" strokeWidth="1.5" fill="none" />
              {/* Canister Body */}
              <path
                d="M-8 8 L-11 26 L11 26 L8 8 Z"
                fill="url(#housingGrad)"
                stroke="#d6b46a"
                strokeWidth="1"
              />
              {/* Gold Lens Rim */}
              <ellipse cx="0" cy="26" rx="11" ry="3.5" fill="#1c0508" stroke="#f5d890" strokeWidth="1.2" />
              {/* Glowing Bulb Core */}
              <circle cx="0" cy="26" r="3.8" fill="url(#runwayBulbGlow)" className="fashion-rig-bulb" />
              {/* Warm Lens Glare */}
              <ellipse cx="0" cy="27" rx="9" ry="2" fill="#fff7bd" opacity="0.6" />
            </g>
          ))}
        </svg>
      </div>
    );
  }
);
