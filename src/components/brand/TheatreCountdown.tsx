'use client';

import React from 'react';
import { CountdownTime } from '@/lib/date';

interface TheatreCountdownProps {
  countdown: CountdownTime;
}

// Koordinat lampu bohlam melingkar di sekeliling frame (viewBox 160 x 175)
const BULB_COORDINATES = [
  // Sisi Atas
  { x: 32, y: 12 },
  { x: 51, y: 12 },
  { x: 70, y: 12 },
  { x: 89, y: 12 },
  { x: 108, y: 12 },
  { x: 128, y: 12 },

  // Sudut Kanan Atas
  { x: 142, y: 20 },

  // Sisi Kanan
  { x: 148, y: 36 },
  { x: 148, y: 57 },
  { x: 148, y: 78 },
  { x: 148, y: 99 },
  { x: 148, y: 120 },
  { x: 148, y: 141 },

  // Sudut Kanan Bawah
  { x: 142, y: 156 },

  // Sisi Bawah
  { x: 128, y: 163 },
  { x: 108, y: 163 },
  { x: 89, y: 163 },
  { x: 70, y: 163 },
  { x: 32, y: 163 },

  // Sudut Kiri Bawah
  { x: 18, y: 156 },

  // Sisi Kiri
  { x: 12, y: 141 },
  { x: 12, y: 120 },
  { x: 12, y: 78 },
  { x: 12, y: 57 },
  { x: 12, y: 36 },

  // Sudut Kiri Atas
  { x: 18, y: 20 },
];

const MarqueeBulbBox = React.memo(function MarqueeBulbBox({
  value,
  label,
  boxId,
}: {
  value: number;
  label: string;
  boxId: string;
}) {
  return (
    <div className="marquee-countdown-box relative w-24 xs:w-28 sm:w-20 md:w-24 lg:w-28 aspect-[1/1.08] flex items-center justify-center select-none group shrink-0">
      {/* SVG Canvas for Marquee Bulbs & Glowing Metallic Theatre Frame */}
      <svg
        viewBox="0 0 160 175"
        className="absolute inset-0 w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
      >
        <defs>
          {/* Box Gradient Fill: Deep Burgundy Chocolate Stage Wood */}
          <linearGradient id={`boxBg-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c0c0e" />
            <stop offset="40%" stopColor="#1c0608" />
            <stop offset="100%" stopColor="#0d0204" />
          </linearGradient>

          {/* Golden Outer Bevel Gradient */}
          <linearGradient id={`goldBorder-${boxId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3da90" />
            <stop offset="25%" stopColor="#a36e28" />
            <stop offset="50%" stopColor="#fdf1c7" />
            <stop offset="75%" stopColor="#965f20" />
            <stop offset="100%" stopColor="#dfb768" />
          </linearGradient>

          {/* Marquee Bulb Radial Glow: Hot Incandescent Light */}
          <radialGradient id={`bulbGlow-${boxId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fff3b0" />
            <stop offset="65%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>

        {/* Outer Shadow & Metallic Gold Beveled Rim */}
        <rect
          x="3"
          y="3"
          width="154"
          height="169"
          rx="26"
          fill="none"
          stroke={`url(#goldBorder-${boxId})`}
          strokeWidth="3"
        />

        {/* Main Dark Velvet Box Base */}
        <rect
          x="5"
          y="5"
          width="150"
          height="165"
          rx="24"
          fill={`url(#boxBg-${boxId})`}
        />

        {/* Outer Marquee Track Inset Groove */}
        <rect
          x="9"
          y="9"
          width="142"
          height="157"
          rx="20"
          fill="none"
          stroke="#421417"
          strokeWidth="10"
        />

        {/* Inner Fine Gold Border */}
        <rect
          x="20"
          y="20"
          width="120"
          height="135"
          rx="14"
          fill="none"
          stroke="#cca762"
          strokeWidth="1.2"
          strokeOpacity="0.45"
        />

        {/* Marquee Bulbs Ring */}
        {BULB_COORDINATES.map((coord, i) => (
          <g key={`bulb-${boxId}-${i}`}>
            {/* Ambient Warm Halo behind bulb */}
            <circle
              cx={coord.x}
              cy={coord.y}
              r="6.5"
              fill="#f59e0b"
              opacity="0.35"
            />
            {/* Core Incandescent Bulb */}
            <circle
              cx={coord.x}
              cy={coord.y}
              r="3.4"
              fill={`url(#bulbGlow-${boxId})`}
            />
          </g>
        ))}
      </svg>

      {/* Box Inner Editorial Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-1">
        {/* Large Countdown Digits */}
        <span
          style={{ fontFamily: 'var(--font-bodoni), Georgia, serif' }}
          className="text-2xl xs:text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#fffaf0] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] tracking-tight tabular-nums leading-none"
        >
          {String(value).padStart(2, '0')}
        </span>

        {/* Gold Diamond Ornament Divider Line */}
        <div className="w-8 xs:w-9 sm:w-8 md:w-12 my-1 sm:my-1.5 relative flex items-center justify-center">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-80" />
          <div className="absolute w-1 xs:w-1.5 sm:w-1.5 rotate-45 bg-[#fef08a] border border-[#a16207] shadow-[0_0_5px_rgba(250,204,21,0.85)]" />
        </div>

        {/* Label: DAYS, HOURS, MINUTES, SECONDS */}
        <span
          style={{ fontFamily: 'var(--font-bodoni), serif' }}
          className="text-[9px] xs:text-[10px] sm:text-[7.5px] md:text-[9px] font-semibold tracking-[0.18em] sm:tracking-[0.2em] text-[#ebd5aa] uppercase drop-shadow-sm"
        >
          {label}
        </span>
      </div>
    </div>
  );
});

const StarSparkleDivider = React.memo(function StarSparkleDivider() {
  return (
    <div className="flex items-center justify-center shrink-0 px-0.5 sm:px-1 z-10">
      <svg
        viewBox="0 0 24 24"
        className="w-2.5 sm:w-3 md:w-4 h-2.5 sm:h-3 md:h-4 drop-shadow-[0_0_8px_rgba(250,204,21,0.85)]"
      >
        <defs>
          <radialGradient id="sparkleGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
        {/* 4-pointed diamond sparkle star */}
        <path
          d="M12 0 C12 6.5 17.5 12 24 12 C17.5 12 12 17.5 12 24 C12 17.5 6.5 12 0 12 C6.5 12 12 6.5 12 0 Z"
          fill="url(#sparkleGrad)"
        />
      </svg>
    </div>
  );
});

export function TheatreCountdown({ countdown }: TheatreCountdownProps) {
  if (countdown.isPast) {
    return (
      <div className="py-2.5 px-6 rounded-full bg-gradient-to-r from-memoria-burgundy to-memoria-stage-red text-memoria-ivory font-bold text-xs sm:text-sm tracking-widest border border-memoria-gold/50 shadow-2xl animate-pulse">
        PERTUNJUKAN TEATER TELAH DIMULAI
      </div>
    );
  }

  const units = [
    { label: 'DAYS', val: countdown.days, id: 'days' },
    { label: 'HOURS', val: countdown.hours, id: 'hours' },
    { label: 'MINUTES', val: countdown.minutes, id: 'mins' },
    { label: 'SECONDS', val: countdown.seconds, id: 'secs' },
  ];

  return (
    <div className="w-full flex justify-center">
      {/* 1. Mobile Layout: 2x2 Grid (1 1 / 1 1) dengan Angka Besar Jelas */}
      <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:hidden justify-items-center">
        {units.map((unit) => (
          <MarqueeBulbBox key={unit.id} value={unit.val} label={unit.label} boxId={unit.id} />
        ))}
      </div>

      {/* 2. Tablet & Desktop Layout: 4 Horizontal Boxes with Star Sparkle Dividers */}
      <div className="hidden sm:flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
        {units.map((unit, index) => (
          <React.Fragment key={unit.id}>
            <MarqueeBulbBox value={unit.val} label={unit.label} boxId={unit.id} />
            {index < units.length - 1 && <StarSparkleDivider />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
