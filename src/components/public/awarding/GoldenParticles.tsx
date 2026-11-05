'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  maxAlpha: number;
  fadeSpeed: number;
}

export function GoldenParticles({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Hormati preferensi reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // 16 partikel sudah sangat cukup untuk panggung tanpa membebani GPU/CPU
    const PARTICLE_COUNT = 16;
    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.8,
        speedY: Math.random() * 0.4 + 0.15,
        speedX: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.5 + 0.1,
        maxAlpha: Math.random() * 0.55 + 0.2,
        fadeSpeed: Math.random() * 0.006 + 0.003,
      });
    }

    let isVisible = true;
    let isInViewport = true;

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Observer agar partikel HANYA dihitung saat section terlihat di layar
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isInViewport = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const render = () => {
      if (!isVisible || !isInViewport) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render partikel bersih tanpa shadowBlur yang berat di GPU
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha += p.fadeSpeed;

        if (p.alpha > p.maxAlpha || p.alpha < 0.1) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        // Wrap around borders
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 216, 144, ${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-10 w-full h-full ${className}`}
    />
  );
}
