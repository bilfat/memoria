import React from 'react';

interface BrandLogotypeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showSubtitle?: boolean;
}

export function BrandLogotype({
  className = '',
  size = 'md',
  showSubtitle = false,
}: BrandLogotypeProps) {
  let sizeClass = 'text-3xl';
  if (size === 'sm') sizeClass = 'text-xl tracking-wider';
  if (size === 'md') sizeClass = 'text-3xl tracking-widest';
  if (size === 'lg') sizeClass = 'text-5xl tracking-widest';
  if (size === 'xl') sizeClass = 'text-6xl md:text-7xl tracking-widest';
  if (size === 'hero') sizeClass = 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.15em]';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <span
        style={{ fontFamily: 'var(--font-ballet), cursive' }}
        className={`font-normal drop-shadow-[0_4px_16px_rgba(214,180,106,0.35)] text-memoria-ivory hover:text-memoria-gold transition-colors duration-300 ${sizeClass}`}
      >
        Memoria
      </span>
      {showSubtitle && (
        <span className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase text-memoria-gold/90 mt-1">
          A Night to Remember
        </span>
      )}
    </div>
  );
}
