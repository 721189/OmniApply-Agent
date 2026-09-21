import React from 'react';

/**
 * Hand-drawn SVG Doodle Accents
 * Adds whimsical, authentic, high-craft visual touches to key callouts, badges, and pricing cards.
 */

// Playful hand-drawn doodle arrow pointing down or left
export const DoodleArrow: React.FC<{ className?: string }> = ({ className = 'w-10 h-10 text-amber-400' }) => (
  <svg 
    viewBox="0 0 54 44" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 14C12 8 26 6 38 16C46 22 47 32 38 38C30 42 22 36 28 28C32 24 44 26 49 32" />
    <path d="M41 40L50 32L51 21" />
  </svg>
);

// Hand-drawn doodle crown for Executive tier
export const DoodleCrown: React.FC<{ className?: string }> = ({ className = 'w-6 h-6 text-amber-400' }) => (
  <svg 
    viewBox="0 0 32 28" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 23H29L27 9L20 16L16 5L12 16L5 9L3 23Z" />
    <circle cx="5" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="4" r="1.5" fill="currentColor" />
    <circle cx="27" cy="8" r="1.5" fill="currentColor" />
    <path d="M6 23C11 25 21 25 26 23" />
  </svg>
);

// Hand-drawn squiggly underline
export const DoodleUnderline: React.FC<{ className?: string }> = ({ className = 'w-28 h-3 text-indigo-400' }) => (
  <svg 
    viewBox="0 0 120 12" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round"
  >
    <path d="M3 8C20 4 35 10 52 6C68 2 84 9 100 5C108 3 114 6 117 7" />
  </svg>
);

// Hand-drawn starburst / sparkle
export const DoodleSparkle: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-amber-400' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round"
  >
    <path d="M12 2V22M2 12H22M5 5L19 19M5 19L19 5" />
  </svg>
);

// Hand-drawn circle / badge around text
export const DoodleCircleBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative inline-flex items-center justify-center px-2 py-0.5 ${className}`}>
    <svg 
      className="absolute inset-0 w-full h-full text-indigo-500/40 pointer-events-none" 
      viewBox="0 0 100 40" 
      preserveAspectRatio="none"
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeDasharray="95 5"
    >
      <path d="M6 20C6 10 25 4 50 4C75 4 94 10 94 20C94 30 75 36 50 36C25 36 6 30 6 20Z" />
    </svg>
    <span className="relative z-10">{children}</span>
  </div>
);

// Razorpay Icon / Badge
export const RazorpayBadge: React.FC<{ className?: string }> = ({ className = 'h-4' }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold ${className}`}>
    <span className="font-black tracking-wider uppercase text-blue-300">Razorpay</span>
    <span className="text-[9px] text-blue-400/80 font-normal">UPI • Cards • NetBanking</span>
  </div>
);
