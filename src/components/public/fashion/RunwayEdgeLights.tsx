'use client';

import React from 'react';

export function RunwayEdgeLights() {
  // 8 pasang lampu tepi catwalk berderet mengikuti garis perspektif dari belakang ke depan
  // t: 0.05 (paling belakang) s/d 0.95 (paling depan)
  const T_VALUES = [0.08, 0.20, 0.33, 0.46, 0.59, 0.72, 0.85, 0.96];

  const LIGHTS = T_VALUES.map((t, i) => {
    // Left rail: from (240, 120) to (60, 485)
    const xL = 240 + t * (60 - 240);
    // Right rail: from (360, 120) to (540, 360)
    const xR = 360 + t * (540 - 360);
    const y = 120 + t * (485 - 120);
    const r = +(2.2 + t * 3.2).toFixed(1);

    return {
      id: `pair-${i}`,
      left: { x: +xL.toFixed(1), y: +y.toFixed(1), r },
      right: { x: +xR.toFixed(1), y: +y.toFixed(1), r },
      index: i,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-15">
      <svg
        viewBox="0 0 600 500"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Incandescent Warm Bulb Glow */}
          <radialGradient id="runwayEdgeBulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fff8db" />
            <stop offset="65%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>

        {LIGHTS.map(({ id, left, right, index }) => (
          <React.Fragment key={id}>
            {/* LEFT EDGE LIGHT */}
            <g className="fashion-edge-light" data-light-index={index}>
              {/* Fixture Brass Socket */}
              <circle
                cx={left.x}
                cy={left.y}
                r={left.r + 2}
                fill="#180406"
                stroke="#d6b46a"
                strokeWidth="1"
              />
              {/* Warm Light Aura */}
              <circle
                cx={left.x}
                cy={left.y}
                r={left.r * 2.6}
                fill="#f59e0b"
                opacity="0.32"
              />
              {/* Core Bulb */}
              <circle
                cx={left.x}
                cy={left.y}
                r={left.r}
                fill="url(#runwayEdgeBulbGlow)"
              />
              {/* Subtle Floor Contact Light Reflection */}
              <ellipse
                cx={left.x + 3}
                cy={left.y + left.r + 2}
                rx={left.r * 2}
                ry={left.r * 0.7}
                fill="#f5d890"
                opacity="0.28"
              />
            </g>

            {/* RIGHT EDGE LIGHT */}
            <g className="fashion-edge-light" data-light-index={index}>
              {/* Fixture Brass Socket */}
              <circle
                cx={right.x}
                cy={right.y}
                r={right.r + 2}
                fill="#180406"
                stroke="#d6b46a"
                strokeWidth="1"
              />
              {/* Warm Light Aura */}
              <circle
                cx={right.x}
                cy={right.y}
                r={right.r * 2.6}
                fill="#f59e0b"
                opacity="0.32"
              />
              {/* Core Bulb */}
              <circle
                cx={right.x}
                cy={right.y}
                r={right.r}
                fill="url(#runwayEdgeBulbGlow)"
              />
              {/* Subtle Floor Contact Light Reflection */}
              <ellipse
                cx={right.x - 3}
                cy={right.y + right.r + 2}
                rx={right.r * 2}
                ry={right.r * 0.7}
                fill="#f5d890"
                opacity="0.28"
              />
            </g>
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
}
