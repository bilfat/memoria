'use client';

import React from 'react';

// Koordinat lampu spotlight tertanam pada concentric rings (viewBox: 600 x 220)
// Outer ring: cx=300, cy=100, rx=250, ry=72 (14 bulbs)
const OUTER_BULBS = [
  0, 25.7, 51.4, 77.1, 102.8, 128.5, 154.2, 180, 205.7, 231.4, 257.1, 282.8, 308.5, 334.2
].map((deg, i) => {
  const rad = (deg * Math.PI) / 180;
  return {
    id: `out-${i}`,
    x: +(300 + 250 * Math.cos(rad)).toFixed(1),
    y: +(100 + 72 * Math.sin(rad)).toFixed(1),
  };
});

// Middle ring: cx=300, cy=100, rx=185, ry=52 (10 bulbs)
const MIDDLE_BULBS = [
  18, 54, 90, 126, 162, 198, 234, 270, 306, 342
].map((deg, i) => {
  const rad = (deg * Math.PI) / 180;
  return {
    id: `mid-${i}`,
    x: +(300 + 185 * Math.cos(rad)).toFixed(1),
    y: +(100 + 52 * Math.sin(rad)).toFixed(1),
  };
});

interface CircularLightRigProps {
  className?: string;
}

export const CircularLightRig = React.forwardRef<HTMLDivElement, CircularLightRigProps>(
  function CircularLightRig({ className = '' }, ref) {
    return (
      <div
        ref={ref}
        className={`relative w-full max-w-xl mx-auto pointer-events-none select-none ${className}`}
      >
        {/* Overhead Golden Ambient Light Dome */}
        <div className="absolute -top-12 inset-x-12 h-36 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f5d890]/25 via-[#d6b46a]/10 to-transparent blur-xl pointer-events-none" />

        <svg
          viewBox="0 0 600 220"
          className="w-full h-auto overflow-visible drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallic Gold Gradient for Outer Ring */}
            <linearGradient id="goldRingOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="20%" stopColor="#d6b46a" />
              <stop offset="45%" stopColor="#855716" />
              <stop offset="50%" stopColor="#fffdf0" />
              <stop offset="55%" stopColor="#a16c21" />
              <stop offset="80%" stopColor="#d6b46a" />
              <stop offset="100%" stopColor="#f5d890" />
            </linearGradient>

            {/* Metallic Gold Gradient for Middle Ring */}
            <linearGradient id="goldRingMiddle" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f5d890" />
              <stop offset="30%" stopColor="#a16c21" />
              <stop offset="50%" stopColor="#fff8db" />
              <stop offset="70%" stopColor="#855716" />
              <stop offset="100%" stopColor="#e5c175" />
            </linearGradient>

            {/* Metallic Gold Gradient for Inner Ring */}
            <linearGradient id="goldRingInner" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d6b46a" />
              <stop offset="50%" stopColor="#fff8db" />
              <stop offset="100%" stopColor="#a16c21" />
            </linearGradient>

            {/* Incandescent Spotlight Bulb Glow */}
            <radialGradient id="bulbCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fff7bd" />
              <stop offset="70%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>

            {/* Cable Metallic Gradient */}
            <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#855716" />
              <stop offset="50%" stopColor="#f5d890" />
              <stop offset="100%" stopColor="#855716" />
            </linearGradient>
          </defs>

          {/* 1. SUSPENSION RIGGING CABLES (Gantungan dari Plafon Panggung) */}
          <line x1="85" y1="0" x2="85" y2="76" stroke="url(#cableGrad)" strokeWidth="1.8" opacity="0.75" />
          <line x1="190" y1="0" x2="190" y2="38" stroke="url(#cableGrad)" strokeWidth="1.8" opacity="0.75" />
          <line x1="410" y1="0" x2="410" y2="38" stroke="url(#cableGrad)" strokeWidth="1.8" opacity="0.75" />
          <line x1="515" y1="0" x2="515" y2="76" stroke="url(#cableGrad)" strokeWidth="1.8" opacity="0.75" />

          {/* Cable Mounting Brackets */}
          <circle cx="85" cy="76" r="3" fill="#f5d890" stroke="#855716" strokeWidth="1" />
          <circle cx="190" cy="38" r="3" fill="#f5d890" stroke="#855716" strokeWidth="1" />
          <circle cx="410" cy="38" r="3" fill="#f5d890" stroke="#855716" strokeWidth="1" />
          <circle cx="515" cy="76" r="3" fill="#f5d890" stroke="#855716" strokeWidth="1" />

          {/* 2. OUTER CONCENTRIC GOLDEN RING */}
          {/* Bevel Shadow Layer */}
          <ellipse cx="300" cy="103" rx="250" ry="72" stroke="#180407" strokeWidth="11" opacity="0.8" />
          {/* Main Gold Pipe */}
          <ellipse cx="300" cy="100" rx="250" ry="72" stroke="url(#goldRingOuter)" strokeWidth="8.5" />
          {/* Specular Top Rim Highlight */}
          <ellipse cx="300" cy="98.5" rx="249" ry="71" stroke="#fff8db" strokeWidth="1.5" opacity="0.85" />
          {/* Inner Groove Line */}
          <ellipse cx="300" cy="100" rx="244" ry="70" stroke="#784812" strokeWidth="1" opacity="0.6" />

          {/* 3. MIDDLE CONCENTRIC GOLDEN RING */}
          <ellipse cx="300" cy="102" rx="185" ry="52" stroke="#180407" strokeWidth="9" opacity="0.8" />
          <ellipse cx="300" cy="100" rx="185" ry="52" stroke="url(#goldRingMiddle)" strokeWidth="6.5" />
          <ellipse cx="300" cy="99" rx="184" ry="51.2" stroke="#fff8db" strokeWidth="1.2" opacity="0.85" />

          {/* 4. INNER CONCENTRIC GOLDEN RING */}
          <ellipse cx="300" cy="101.5" rx="120" ry="34" stroke="#180407" strokeWidth="7" opacity="0.8" />
          <ellipse cx="300" cy="100" rx="120" ry="34" stroke="url(#goldRingInner)" strokeWidth="4.5" />
          <ellipse cx="300" cy="99.2" rx="119.2" ry="33.5" stroke="#fff8db" strokeWidth="1" opacity="0.75" />

          {/* 5. RADIAL CROSSBARS / SPOKES (Menghubungkan Cincin Konsentris) */}
          {[30, 90, 150, 210, 270, 330].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = +(300 + 120 * Math.cos(rad)).toFixed(1);
            const y1 = +(100 + 34 * Math.sin(rad)).toFixed(1);
            const x2 = +(300 + 250 * Math.cos(rad)).toFixed(1);
            const y2 = +(100 + 72 * Math.sin(rad)).toFixed(1);
            return (
              <line
                key={`spoke-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#goldRingMiddle)"
                strokeWidth="2.5"
                opacity="0.85"
              />
            );
          })}

          {/* 6. EMBEDDED SPOTLIGHT BULBS (Outer Ring) */}
          {OUTER_BULBS.map((b) => (
            <g key={b.id} className="awarding-rig-bulb">
              {/* Fixture Socket Housing */}
              <circle cx={b.x} cy={b.y} r="6.5" fill="#140809" stroke="#d6b46a" strokeWidth="1" />
              {/* Outer Glow Halo */}
              <circle cx={b.x} cy={b.y} r="8.5" fill="#f59e0b" opacity="0.25" />
              {/* Glowing Incandescent Bulb Core */}
              <circle cx={b.x} cy={b.y} r="4.2" fill="url(#bulbCoreGlow)" />
            </g>
          ))}

          {/* 7. EMBEDDED SPOTLIGHT BULBS (Middle Ring) */}
          {MIDDLE_BULBS.map((b) => (
            <g key={b.id} className="awarding-rig-bulb">
              <circle cx={b.x} cy={b.y} r="5.5" fill="#140809" stroke="#d6b46a" strokeWidth="0.9" />
              <circle cx={b.x} cy={b.y} r="7" fill="#f59e0b" opacity="0.2" />
              <circle cx={b.x} cy={b.y} r="3.4" fill="url(#bulbCoreGlow)" />
            </g>
          ))}
        </svg>
      </div>
    );
  }
);

