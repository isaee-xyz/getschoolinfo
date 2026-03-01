import React, { useId } from 'react';

/**
 * GetSchoolsInfo Brand Mark — Option B
 * Concept: Clean ascending data bars inside a rounded square.
 * Four bars represent the four pillars: Infrastructure, Academic, Safety, Digital.
 * The tallest bar has an amber accent — the standout data point.
 * No book, no checkmark — just confident, data-forward simplicity.
 * Reads clearly even at 24px.
 */

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

export const LogoMark = ({ size = 32, className = '', variant = 'default' }: Omit<LogoProps, 'showWordmark'>) => {
  const colors = {
    default: { bg1: '#0D9488', bg2: '#0F766E', bar: '#FFFFFF', accent: '#D97706' },
    white: { bg1: '#FFFFFF', bg2: '#E2E8F0', bar: '#0D9488', accent: '#D97706' },
    dark: { bg1: '#0D9488', bg2: '#115E59', bar: '#FFFFFF', accent: '#D97706' },
  };
  const c = colors[variant];
  const reactId = useId();
  const uid = `logo-${variant}-${reactId.replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="GetSchoolsInfo logo"
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c.bg1} />
          <stop offset="100%" stopColor={c.bg2} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="10" fill={`url(#${uid})`} />

      {/* Four ascending bars — the entire logo mark */}
      {/* Bar 1: shortest (Infrastructure) */}
      <rect x="7.5" y="24" width="5" height="8" rx="1.5" fill={c.bar} opacity="0.6" />
      {/* Bar 2: medium (Safety) */}
      <rect x="14.5" y="19" width="5" height="13" rx="1.5" fill={c.bar} opacity="0.75" />
      {/* Bar 3: tall (Academic) */}
      <rect x="21.5" y="14" width="5" height="18" rx="1.5" fill={c.bar} opacity="0.9" />
      {/* Bar 4: tallest, amber accent (Overall score — the standout) */}
      <rect x="28.5" y="9" width="5" height="23" rx="1.5" fill={c.accent} />
    </svg>
  );
};

export const Logo = ({ size = 32, className = '', showWordmark = true, variant = 'default' }: LogoProps) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-gsi-text';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} variant={variant} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`text-[17px] font-bold ${textColor} tracking-tight font-display`}>
            Get<span style={{ color: variant === 'white' ? '#99F6E4' : 'var(--gsi-primary)' }}>Schools</span>Info
          </span>
          <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold ${variant === 'white' ? 'text-teal-200' : 'text-gsi-text-muted'}`}>
            India's School Data Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
