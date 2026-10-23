import React from 'react';

interface AppFooterProps {
  isDark: boolean;
}

export const AppFooter: React.FC<AppFooterProps> = ({ isDark }) => {
  return (
    <footer
      className={`w-full border-t backdrop-blur-md py-6 mt-auto transition-colors duration-200 ${
        isDark
          ? 'bg-[#0B2B26]/80 border-white/[0.08] text-[#c1c8c1]'
          : 'bg-[#def9f9]/70 border-[#c0c8c4]/40 text-[#404945]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className={`font-bold font-display ${isDark ? 'text-[#DAF1DE]' : 'text-[#053c31]'}`}>
            IMC Saúde
          </span>
          <span className={isDark ? 'text-[#8b938c]' : 'text-[#707975]'}>
            • Monitoramento &amp; Vitalidade Biológica
          </span>
        </div>
        <p className={isDark ? 'text-[#8b938c]' : 'text-[#707975]'}>
          © 2025 IMC Saúde. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};
