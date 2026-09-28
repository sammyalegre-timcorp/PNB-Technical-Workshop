import React from 'react';

interface PNBLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const PNBLogo: React.FC<PNBLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* PNB Official Shield Badge */}
      <svg
        viewBox="0 0 100 100"
        className={`${heightClasses[size]} w-auto aspect-square shrink-0 drop-shadow-xs`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Philippine National Bank Shield Emblem"
      >
        {/* Outer rounded container border */}
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="18"
          fill="#FFFFFF"
          stroke="#001489"
          strokeWidth="6"
        />

        {/* Shield outline */}
        <path
          d="M16 24 C 24 23, 34 16, 50 8 C 66 16, 76 23, 84 24 C 84 55, 78 76, 50 92 C 22 76, 16 55, 16 24 Z"
          fill="#001489"
        />

        {/* Inner Shield Body */}
        <path
          d="M20 26 C 27 25, 36 19, 50 12 C 64 19, 73 25, 80 26 C 80 53, 75 72, 50 87 C 25 72, 20 53, 20 26 Z"
          fill="#FFFFFF"
        />

        {/* Top White Area for Stars */}
        <path
          d="M20 26 C 27 25, 36 19, 50 12 C 64 19, 73 25, 80 26 L 80 40 L 20 40 Z"
          fill="#FFFFFF"
        />

        {/* 3 Golden Stars */}
        {/* Center top star */}
        <polygon
          points="50,15 52,20 57,20 53,23 54,28 50,25 46,28 47,23 43,20 48,20"
          fill="#F5B212"
        />
        {/* Left star */}
        <polygon
          points="32,23 34,27 38,27 35,29 36,33 32,31 28,33 29,29 26,27 30,27"
          fill="#F5B212"
        />
        {/* Right star */}
        <polygon
          points="68,23 70,27 74,27 71,29 72,33 68,31 64,33 65,29 62,27 66,27"
          fill="#F5B212"
        />

        {/* Horizontal Divider Band */}
        <rect x="20" y="38" width="60" height="4" fill="#001489" />

        {/* Left Field: Vibrant Light Blue / Cyan */}
        <path
          d="M20 42 L 50 42 L 50 87 C 36 78, 24 65, 20 42 Z"
          fill="#009FDC"
        />

        {/* Right Field: Philippine Red */}
        <path
          d="M50 42 L 80 42 C 76 65, 64 78, 50 87 L 50 42 Z"
          fill="#E31B23"
        />

        {/* Vertical Center Divider Line */}
        <line x1="50" y1="42" x2="50" y2="87" stroke="#001489" strokeWidth="3" />

        {/* Eagle Silhouette (Left side) */}
        <g fill="#FFFFFF">
          <path d="M28 58 C 30 54, 34 52, 38 52 C 37 54, 35 56, 36 60 C 37 63, 40 66, 42 67 C 38 67, 34 68, 30 73 C 32 68, 30 63, 28 58 Z" />
          <path d="M33 52 L 40 48 L 42 53 L 38 55 Z" />
          <path d="M26 62 L 31 63 L 30 67 L 25 65 Z" />
        </g>

        {/* Sea-Lion Rampant (Right side) */}
        <g fill="#FFFFFF">
          <path d="M62 48 C 65 47, 68 49, 70 52 C 67 53, 67 56, 68 59 C 71 58, 73 55, 74 53 C 73 57, 72 61, 68 64 C 69 67, 72 69, 74 72 C 69 72, 66 69, 64 66 C 62 68, 59 69, 58 73 C 58 68, 60 62, 62 58 C 60 55, 61 51, 62 48 Z" />
          <path d="M72 47 L 76 45 L 75 51 Z" />
        </g>

        {/* Golden Sun Emblem in Center */}
        {/* Sun Outer Glow/Ring */}
        <circle cx="50" cy="40" r="13" fill="#001489" />
        <circle cx="50" cy="40" r="10" fill="#F5B212" stroke="#001489" strokeWidth="1.5" />
        {/* Sun Rays */}
        <g stroke="#F5B212" strokeWidth="2.5" strokeLinecap="round">
          <line x1="50" y1="26" x2="50" y2="29" />
          <line x1="50" y1="51" x2="50" y2="54" />
          <line x1="36" y1="40" x2="39" y2="40" />
          <line x1="61" y1="40" x2="64" y2="40" />
          <line x1="40" y1="30" x2="42" y2="32" />
          <line x1="58" y1="48" x2="60" y2="50" />
          <line x1="40" y1="50" x2="42" y2="48" />
          <line x1="58" y1="32" x2="60" y2="30" />
        </g>
        <circle cx="50" cy="40" r="6" fill="#F5B212" />
      </svg>

      {/* PNB Wordmark in Official Royal Blue */}
      {showText && (
        <span
          className="font-black text-[#001489] tracking-[-0.03em] leading-none"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
            fontSize: size === 'sm' ? '1.75rem' : size === 'md' ? '2.5rem' : '3.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          PNB
        </span>
      )}
    </div>
  );
};
