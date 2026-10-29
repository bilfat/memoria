import React from 'react';

interface BrandLogotypeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showSubtitle?: boolean;
  variant?: 'light' | 'dark';
}

export function BrandLogotype({
  className = '',
  size = 'md',
  showSubtitle = false,
  variant = 'light',
}: BrandLogotypeProps) {
  let sizeClass = 'text-3xl';
  if (size === 'sm') sizeClass = 'text-xl tracking-wider';
  if (size === 'md') sizeClass = 'text-3xl tracking-widest';
  if (size === 'lg') sizeClass = 'text-5xl tracking-widest';
  if (size === 'xl') sizeClass = 'text-6xl md:text-7xl tracking-widest';
  if (size === 'hero') sizeClass = 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.15em]';

  const isDarkVariant = variant === 'dark';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <span
        style={{ fontFamily: 'var(--font-ballet), cursive' }}
        className={`font-normal transition-all duration-300 ${
          isDarkVariant
            ? 'bg-gradient-to-r from-[#350a10] via-[#891523] to-[#540c14] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(214,180,106,0.45)]'
            : 'text-memoria-ivory hover:text-memoria-gold drop-shadow-[0_4px_16px_rgba(214,180,106,0.35)]'
        } ${sizeClass}`}
      >
        Memoria
      </span>
      {showSubtitle && (
        <span
          className={`text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase mt-1 ${
            isDarkVariant ? 'text-[#891523] font-semibold' : 'text-memoria-gold/90'
          }`}
        >
          A Night to Remember
        </span>
      )}
    </div>
  );
}
