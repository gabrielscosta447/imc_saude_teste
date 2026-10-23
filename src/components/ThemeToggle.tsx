import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  floating?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle, floating = false }) => {
  if (floating) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <button
          type="button"
          aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          onClick={onToggle}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
            isDark
              ? 'bg-[#0B2B26]/80 hover:bg-[#163832] text-[#DAF1DE] border border-[#8EB69B]/20 backdrop-blur-md'
              : 'bg-white/85 hover:bg-white text-[#0B2B26] border border-white/90 backdrop-blur-md shadow-sm'
          }`}
          title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          <span className={`material-symbols-outlined text-[20px] ${isDark ? 'text-[#a9d2b6]' : 'text-[#235347]'}`}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={onToggle}
      className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
        isDark
          ? 'bg-[#163832]/70 hover:bg-[#163832] border border-[#8EB69B]/20 text-[#DAF1DE]'
          : 'bg-[#d8f3f4] hover:bg-[#d2edee] text-[#404945] hover:text-[#051F20]'
      }`}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      <span className="material-symbols-outlined text-[19px]">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};
