import React from 'react';
import nonnaPhoto from '../../assets/nonna.webp';

export const NonnaAvatar: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <img
    src={nonnaPhoto}
    alt="La Nonna"
    className={`${className} rounded-full object-cover flex-shrink-0 ring-1 ring-primary/30`}
  />
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l5 5L20 6" />
  </svg>
);
