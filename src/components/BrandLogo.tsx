import React from 'react';

interface BrandLogoProps {
  className?: string;
  isDark?: boolean;
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-10 w-auto', isDark = false, compact = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Botanical Shield Symbol */}
      <svg
        viewBox="0 0 48 48"
        className="h-10 w-10 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="14"
          fill={isDark ? '#235347' : '#235347'}
          fillOpacity={isDark ? '0.25' : '0.12'}
          stroke={isDark ? '#8EB69B' : '#235347'}
          strokeWidth="1.5"
        />
        {/* Organic Leaf Contour */}
        <path
          d="M 24 10 C 31 10 36 16 36 24 C 36 32 28 36 24 38 C 20 36 12 32 12 24 C 12 16 17 10 24 10 Z"
          fill={isDark ? '#8EB69B' : '#235347'}
        />
        {/* Vein curve */}
        <path
          d="M 24 12 C 24 22 17 28 17 28"
          stroke={isDark ? '#051F20' : '#DAF1DE'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Node point */}
        <circle cx="27" cy="21" r="3" fill={isDark ? '#DAF1DE' : '#8EB69B'} />
        {/* Horizontal base stem */}
        <path
          d="M 18 31 L 30 31"
          stroke={isDark ? '#051F20' : '#DAF1DE'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {!compact && (
        <div className="flex flex-col leading-tight select-none">
          <div className="flex items-center">
            <span
              className={`font-extrabold text-[20px] tracking-tight ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#0B2B26]'
              }`}
            >
              IMC
            </span>
            <span
              className={`font-normal text-[20px] ml-1 tracking-tight ${
                isDark ? 'text-[#DAF1DE]' : 'text-[#235347]'
              }`}
            >
              Saúde
            </span>
          </div>
          <span
            className={`text-[9px] font-semibold tracking-[0.14em] uppercase ${
              isDark ? 'text-[#8EB69B]' : 'text-[#8EB69B]'
            }`}
          >
            MONITORAMENTO &amp; BEM-ESTAR
          </span>
        </div>
      )}
    </div>
  );
};
